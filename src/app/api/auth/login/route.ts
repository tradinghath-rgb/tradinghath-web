import { NextResponse } from 'next/server';
import { findUserByCredentials } from '@/lib/userStore';

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter both username/email and password.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    // 1. Check Admin Login
    if (
      (cleanIdentifier.toLowerCase() === 'tradinghath' || cleanIdentifier.toLowerCase() === 'tradinghath@gmail.com') &&
      cleanPassword === '22NE1A04E1@093'
    ) {
      return NextResponse.json({
        success: true,
        isAdmin: true,
        isPro: true,
        user: {
          username: 'tradinghath',
          email: 'tradinghath@gmail.com',
          role: 'admin'
        },
        token: 'admin_token_' + Date.now()
      });
    }

    // 2. Strict Check: User MUST have registered first!
    const existingUser = findUserByCredentials(cleanIdentifier, cleanPassword);

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account not found or invalid password! Please create an account first by clicking "Sign up" below.'
        },
        { status: 401 }
      );
    }

    // Registered user authenticated successfully
    return NextResponse.json({
      success: true,
      isAdmin: false,
      isPro: existingUser.isPro,
      user: {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
        role: 'user'
      },
      token: 'user_token_' + Date.now()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Login service failed' },
      { status: 500 }
    );
  }
}

