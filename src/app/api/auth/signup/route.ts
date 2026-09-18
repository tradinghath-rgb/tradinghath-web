import { NextResponse } from 'next/server';
import { dbFindUserByEmail, dbRegisterUser, UserRecord } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter your email address and password.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check for existing user
    const existing = await dbFindUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists. Please log in.' },
        { status: 409 }
      );
    }

    const derivedUsername = cleanEmail.split('@')[0] || `user_${Date.now()}`;
    const isAdminEmail = cleanEmail === 'tradinghath@gmail.com';

    const newUser: UserRecord = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      username: derivedUsername,
      email: cleanEmail,
      password: password.trim(),
      phone: '',
      isPro: isAdminEmail,
      amount: isAdminEmail ? 399 : 0,
      createdAt: new Date().toISOString(),
    };

    // Persist to KV database (survives server restarts)
    await dbRegisterUser(newUser);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! You can now log in.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        isPro: newUser.isPro,
      },
    });
  } catch (err: any) {
    console.error('[SIGNUP]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
