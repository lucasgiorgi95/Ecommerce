#!/usr/bin/env tsx

/**
 * User Cleanup Script
 * 
 * This script removes inactive user accounts that haven't logged in for more than 30 days.
 * It's designed to be run manually or scheduled via cron job.
 * 
 * Usage:
 *   npm run cleanup:users
 *   tsx scripts/cleanup-users.ts
 * 
 * Options:
 *   --dry-run    Show what would be deleted without actually deleting
 *   --days=N     Override the default 30-day threshold (for testing)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CleanupOptions {
  dryRun: boolean;
  daysThreshold: number;
}

async function parseArgs(): Promise<CleanupOptions> {
  const args = process.argv.slice(2);
  
  const options: CleanupOptions = {
    dryRun: false,
    daysThreshold: 30
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--days=')) {
      const days = parseInt(arg.split('=')[1]);
      if (isNaN(days) || days < 1) {
        throw new Error('Invalid days value. Must be a positive number.');
      }
      options.daysThreshold = days;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
User Cleanup Script

Usage: tsx scripts/cleanup-users.ts [options]

Options:
  --dry-run       Show what would be deleted without actually deleting
  --days=N        Override the default 30-day threshold
  --help, -h      Show this help message

Examples:
  tsx scripts/cleanup-users.ts --dry-run
  tsx scripts/cleanup-users.ts --days=7 --dry-run
  tsx scripts/cleanup-users.ts
      `);
      process.exit(0);
    }
  }

  return options;
}

async function findInactiveUsers(daysThreshold: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

  console.log(`🔍 Finding users inactive since: ${cutoffDate.toISOString()}`);

  const inactiveUsers = await prisma.user.findMany({
    where: {
      lastLoginAt: {
        lt: cutoffDate
      }
    },
    select: {
      id: true,
      email: true,
      name: true,
      lastLoginAt: true,
      createdAt: true
    },
    orderBy: {
      lastLoginAt: 'asc'
    }
  });

  return inactiveUsers;
}

async function cleanupUsers(options: CleanupOptions) {
  try {
    console.log('🧹 Starting user cleanup process...');
    console.log(`📅 Threshold: ${options.daysThreshold} days`);
    console.log(`🔧 Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`);
    console.log('');

    const inactiveUsers = await findInactiveUsers(options.daysThreshold);

    if (inactiveUsers.length === 0) {
      console.log('✅ No inactive users found. Database is clean!');
      return;
    }

    console.log(`📊 Found ${inactiveUsers.length} inactive user(s):`);
    console.log('');

    // Display users to be deleted
    inactiveUsers.forEach((user, index) => {
      const daysSinceLogin = Math.floor(
        (Date.now() - user.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      console.log(`${index + 1}. ${user.email} (${user.name})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Last login: ${user.lastLoginAt.toISOString()} (${daysSinceLogin} days ago)`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
      console.log('');
    });

    if (options.dryRun) {
      console.log('🔍 DRY RUN: No users were actually deleted.');
      console.log(`💡 Run without --dry-run to delete these ${inactiveUsers.length} user(s).`);
      return;
    }

    // Confirm deletion in live mode
    console.log('⚠️  WARNING: This will permanently delete these users!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Perform deletion
    const userIds = inactiveUsers.map(user => user.id);
    
    const deleteResult = await prisma.user.deleteMany({
      where: {
        id: {
          in: userIds
        }
      }
    });

    console.log(`✅ Successfully deleted ${deleteResult.count} inactive user(s).`);
    
    // Log the cleanup operation
    const timestamp = new Date().toISOString();
    console.log(`📝 Cleanup completed at: ${timestamp}`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
async function main() {
  try {
    const options = await parseArgs();
    await cleanupUsers(options);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

export { cleanupUsers, findInactiveUsers };