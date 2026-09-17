import { NextResponse } from 'next/server';
import { findUserByCredentials, findUserByIdentifier } from '@/lib/userStore';

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter both email and password.' },
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

    // 2. Strict Check: Does this email or username exist at all?
    const userExists = findUserByIdentifier(cleanIdentifier);
    if (!userExists) {
      return NextResponse.json(
        {
          success: false,
          notRegistered: true,
          error: `This email "${cleanIdentifier}" is not registered. Please click "Sign up" below to create your account first!`
        },
        { status: 404 }
      );
    }

    // 3. User exists: check password
    const existingUser = findUserByCredentials(cleanIdentifier, cleanPassword);

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Incorrect password! Please enter the correct password or click "Forgot password".'
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

