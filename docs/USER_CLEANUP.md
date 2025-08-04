# User Cleanup System

This document describes the automated user cleanup system that removes inactive user accounts after 30 days of inactivity.

## Overview

The user cleanup system helps maintain database hygiene and comply with privacy best practices by automatically removing user accounts that haven't been accessed for an extended period.

### Key Features

- **Automatic Detection**: Identifies users who haven't logged in for 30+ days
- **Safe Execution**: Includes dry-run mode for testing
- **Detailed Logging**: Provides comprehensive output about cleanup operations
- **Configurable Threshold**: Allows customization of the inactivity period
- **Manual and Scheduled Execution**: Can be run on-demand or via cron jobs

## Manual Execution

### Basic Usage

```bash
# Run cleanup with default settings (30 days)
npm run cleanup:users

# Or directly with tsx
tsx scripts/cleanup-users.ts
```

### Dry Run Mode

Always test first with dry-run mode to see what would be deleted:

```bash
# See what would be deleted without actually deleting
npm run cleanup:users -- --dry-run

# Test with different threshold
npm run cleanup:users -- --days=7 --dry-run
```

### Command Options

| Option | Description | Example |
|--------|-------------|---------|
| `--dry-run` | Show what would be deleted without deleting | `--dry-run` |
| `--days=N` | Override default 30-day threshold | `--days=60` |
| `--help` | Show help message | `--help` |

### Examples

```bash
# Test cleanup with 7-day threshold
npm run cleanup:users -- --days=7 --dry-run

# Run actual cleanup with 60-day threshold
npm run cleanup:users -- --days=60

# Get help
npm run cleanup:users -- --help
```

## Scheduled Execution (Cron Jobs)

### Linux/macOS Cron Setup

1. Open your crontab:
   ```bash
   crontab -e
   ```

2. Add one of these entries:

   ```bash
   # Run daily at 2:00 AM
   0 2 * * * cd /path/to/your/project && npm run cleanup:users >> /var/log/user-cleanup.log 2>&1

   # Run weekly on Sundays at 3:00 AM
   0 3 * * 0 cd /path/to/your/project && npm run cleanup:users >> /var/log/user-cleanup.log 2>&1

   # Run monthly on the 1st at 4:00 AM
   0 4 1 * * cd /path/to/your/project && npm run cleanup:users >> /var/log/user-cleanup.log 2>&1
   ```

3. Save and exit. The cron daemon will automatically pick up the changes.

### Windows Task Scheduler

1. Open Task Scheduler (`taskschd.msc`)
2. Click "Create Basic Task"
3. Set name: "User Cleanup"
4. Choose frequency (Daily/Weekly/Monthly)
5. Set time (e.g., 2:00 AM)
6. Action: "Start a program"
7. Program: `cmd.exe`
8. Arguments: `/c cd /d "C:\path\to\your\project" && npm run cleanup:users`

### Docker/Container Environments

If running in a containerized environment, you can add a cron job inside your container:

```dockerfile
# Add to your Dockerfile
RUN apt-get update && apt-get install -y cron

# Copy cron job file
COPY cleanup-cron /etc/cron.d/user-cleanup
RUN chmod 0644 /etc/cron.d/user-cleanup
RUN crontab /etc/cron.d/user-cleanup
```

Create `cleanup-cron` file:
```
0 2 * * * cd /app && npm run cleanup:users >> /var/log/user-cleanup.log 2>&1
```

### Using PM2 (Process Manager)

If you're using PM2, you can use its cron feature:

```bash
# Install PM2 cron
npm install -g pm2

# Create ecosystem file
```

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'user-cleanup',
    script: 'scripts/cleanup-users.ts',
    interpreter: 'tsx',
    cron_restart: '0 2 * * *', // Daily at 2 AM
    autorestart: false,
    watch: false
  }]
}
```

## Monitoring and Logging

### Log Output

The cleanup script provides detailed output:

```
🧹 Starting user cleanup process...
📅 Threshold: 30 days
🔧 Mode: LIVE

🔍 Finding users inactive since: 2024-01-01T02:00:00.000Z

📊 Found 3 inactive user(s):

1. old.user@example.com (Old User)
   ID: clx1234567890
   Last login: 2023-12-01T10:30:00.000Z (45 days ago)
   Created: 2023-11-15T09:00:00.000Z

✅ Successfully deleted 3 inactive user(s).
📝 Cleanup completed at: 2024-01-15T02:00:00.000Z
```

### Recommended Logging Setup

For production environments, redirect output to log files:

```bash
# Create log directory
mkdir -p /var/log/ecommerce

# Run with logging
npm run cleanup:users >> /var/log/ecommerce/user-cleanup.log 2>&1
```

### Log Rotation

Set up log rotation to prevent log files from growing too large:

Create `/etc/logrotate.d/user-cleanup`:
```
/var/log/ecommerce/user-cleanup.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 www-data www-data
}
```

## Safety Considerations

### Before Running in Production

1. **Always test with dry-run first**:
   ```bash
   npm run cleanup:users -- --dry-run
   ```

2. **Backup your database**:
   ```bash
   # PostgreSQL example
   pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

3. **Start with a longer threshold** for initial runs:
   ```bash
   npm run cleanup:users -- --days=60 --dry-run
   ```

### Recovery Considerations

- **No recovery mechanism**: Once users are deleted, they cannot be recovered
- **Consider soft deletion**: For critical applications, consider marking users as inactive instead of deleting
- **Audit trail**: The script logs all deletions with timestamps

## Troubleshooting

### Common Issues

1. **Database connection errors**:
   - Ensure `DATABASE_URL` environment variable is set
   - Check database connectivity
   - Verify Prisma client is properly configured

2. **Permission errors**:
   - Ensure the script has write permissions to log files
   - Check database user permissions for DELETE operations

3. **Cron job not running**:
   - Check cron service is running: `systemctl status cron`
   - Verify cron job syntax: `crontab -l`
   - Check system logs: `grep CRON /var/log/syslog`

### Testing

```bash
# Test with very short threshold to see if script works
npm run cleanup:users -- --days=1 --dry-run

# Check script help
npm run cleanup:users -- --help

# Verify database connection
npm run db:seed # Should work if DB is accessible
```

## Integration with Application

The cleanup system integrates with the authentication system:

- **User Model**: Uses `lastLoginAt` field to determine inactivity
- **Login Process**: Updates `lastLoginAt` on successful authentication
- **Account Reactivation**: Inactive accounts are automatically reactivated on login

## Security Notes

- The script requires database DELETE permissions
- Consider running with a dedicated database user with limited permissions
- Monitor cleanup logs for unusual activity
- Set up alerts for failed cleanup operations

## Configuration

### Environment Variables

The script uses the same database configuration as your main application:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
```

### Customization

To modify the default behavior, edit `scripts/cleanup-users.ts`:

- Change default threshold (currently 30 days)
- Modify logging format
- Add additional safety checks
- Implement soft deletion instead of hard deletion

## Support

For issues or questions about the user cleanup system:

1. Check the troubleshooting section above
2. Review the script logs for error details
3. Test with dry-run mode to isolate issues
4. Verify database connectivity and permissions