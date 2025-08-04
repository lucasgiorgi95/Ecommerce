import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // For JWT tokens, logout is primarily handled client-side
    // by removing the token from localStorage/cookies
    // This endpoint provides a consistent API and could be extended
    // for server-side token blacklisting in the future

    return NextResponse.json({
      message: 'Logout successful',
      success: true,
    }, { status: 200 });

  } catch (error) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}