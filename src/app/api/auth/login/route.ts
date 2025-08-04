import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, updateLastLogin } from '@/services/userService';
import { comparePassword } from '@/lib/auth';
import { generateToken } from '@/lib/jwt';

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
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

    // Find user by email
    const user = await findUserByEmail(email);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Cuenta desactivada. Contacta soporte.' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Update last login timestamp
    const updatedUser = await updateLastLogin(user.id);

    // Generate JWT token
    const token = generateToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: updatedUser,
      token,
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    
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