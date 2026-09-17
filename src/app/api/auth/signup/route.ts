import { NextResponse } from 'next/server';
import { registerNewUser, UserAdminType } from '@/lib/userStore';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter your Gmail / email address and password.' },
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
    const derivedUsername = cleanEmail.split('@')[0] || `user_${Date.now()}`;
    const isAdminEmail = cleanEmail === 'tradinghath@gmail.com' || derivedUsername === 'tradinghath';

    const newUser: UserAdminType = {
      id: `user_${Date.now()}`,
      username: derivedUsername,
      email: cleanEmail,
      password: password.trim(), // Stored for admin viewing & management
      phone: '',
      isPro: isAdminEmail ? true : false,
      amount: isAdminEmail ? 399 : 0,
      createdAt: new Date().toISOString()
    };

    registerNewUser(newUser);


    return NextResponse.json({
      success: true,
      message: 'Account created successfully! You can now log in.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        isPro: newUser.isPro
      },
      token: `token_${Date.now()}`
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to create account.' },
      { status: 500 }
    );
  }
}

