import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail, isAccountExpired, reactivateUser } from '@/services/userService';
import { generateToken } from '@/lib/jwt';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { name, email, password } = body;

    // Input validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    
    if (existingUser) {
      if (existingUser.isActive && !isAccountExpired(existingUser)) {
        // Active user already exists
        return NextResponse.json(
          { success: false, error: 'Este email ya está registrado' },
          { status: 409 }
        );
      } else if (!existingUser.isActive || isAccountExpired(existingUser)) {
        // Reactivate expired account
        const reactivatedUser = await reactivateUser(email, password);
        
        // Generate JWT token
        const token = generateToken({
          userId: reactivatedUser.id,
          email: reactivatedUser.email,
          name: reactivatedUser.name,
          role: reactivatedUser.role,
        });

        return NextResponse.json({
          success: true,
          message: 'Account reactivated successfully',
          user: reactivatedUser,
          token,
          reactivated: true,
        }, { status: 200 });
      }
    }

    // Create new user
    const user = await createUser({ name, email, password });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user,
      token,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}