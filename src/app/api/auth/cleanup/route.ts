import { NextRequest, NextResponse } from 'next/server';
import { deleteInactiveUsers, findInactiveUsers } from '@/services/userService';
import { verifyToken } from '@/lib/jwt';

interface CleanupRequest {
  adminToken?: string;
}

/**
 * Verify if the request is from an admin user
 * For now, we'll use a simple admin email check or admin token
 * In production, this should be replaced with proper role-based authentication
 */
function isAdminRequest(request: NextRequest): boolean {
  // Check for admin token in environment
  const adminToken = process.env.ADMIN_TOKEN;
  
  // Get authorization header
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return false;
  }

  // If admin token is set in environment, check for it
  if (adminToken && token === adminToken) {
    return true;
  }

  // Otherwise, verify JWT and check if user is admin
  try {
    const payload = verifyToken(token);
    const adminEmail = process.env.ADMIN_EMAIL;
    
    // Check if user has admin role
    if (payload.role === 'admin') {
      return true;
    }
    
    // Fallback: check if user email matches admin email
    if (adminEmail && payload.email === adminEmail) {
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    if (!isAdminRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    console.log('Starting user cleanup process...');

    // Find inactive users first for logging
    const inactiveUsers = await findInactiveUsers();
    
    if (inactiveUsers.length === 0) {
      console.log('No inactive users found for cleanup');
      return NextResponse.json({
        message: 'No inactive users found',
        deletedCount: 0,
        deletedUsers: []
      }, { status: 200 });
    }

    console.log(`Found ${inactiveUsers.length} inactive users for cleanup:`, 
      inactiveUsers.map(user => ({ id: user.id, email: user.email, lastLoginAt: user.lastLoginAt }))
    );

    // Delete inactive users
    const result = await deleteInactiveUsers();

    console.log(`Successfully deleted ${result.count} inactive users`);
    console.log('Deleted user IDs:', result.deletedUsers);

    return NextResponse.json({
      message: `Successfully deleted ${result.count} inactive users`,
      deletedCount: result.count,
      deletedUsers: result.deletedUsers
    }, { status: 200 });

  } catch (error) {
    console.error('Cleanup error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Cleanup failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error during cleanup' },
      { status: 500 }
    );
  }
}

// GET endpoint to preview inactive users without deleting them
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    if (!isAdminRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    console.log('Fetching inactive users for preview...');

    // Find inactive users
    const inactiveUsers = await findInactiveUsers();
    
    const userPreview = inactiveUsers.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      lastLoginAt: user.lastLoginAt,
      daysSinceLastLogin: Math.floor((Date.now() - user.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24))
    }));

    console.log(`Found ${inactiveUsers.length} inactive users`);

    return NextResponse.json({
      message: `Found ${inactiveUsers.length} inactive users`,
      count: inactiveUsers.length,
      users: userPreview
    }, { status: 200 });

  } catch (error) {
    console.error('Preview error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Preview failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error during preview' },
      { status: 500 }
    );
  }
}