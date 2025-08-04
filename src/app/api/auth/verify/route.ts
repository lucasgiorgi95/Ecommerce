import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { findUserByEmail } from '@/services/userService';

interface VerifyRequest {
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyRequest = await request.json();
    const { token } = body;

    // Input validation
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify JWT token
    const decoded = verifyToken(token);

    // Check if user still exists and is active
    const user = await findUserByEmail(decoded.email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Return user data
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };

    return NextResponse.json({
      message: 'Token is valid',
      user: userData,
      valid: true,
    }, { status: 200 });

  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error instanceof Error) {
      // Handle specific JWT errors
      if (error.message === 'Token has expired') {
        return NextResponse.json(
          { error: 'Token has expired', valid: false },
          { status: 401 }
        );
      } else if (error.message === 'Invalid token') {
        return NextResponse.json(
          { error: 'Invalid token', valid: false },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: error.message, valid: false },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Token verification failed', valid: false },
      { status: 500 }
    );
  }
}