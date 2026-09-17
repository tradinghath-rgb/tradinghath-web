import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { username, email, phone, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please fill in username, email, and password.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const newUser = {
      id: `user_${Date.now()}`,
      username: username.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      role: 'user',
      isPro: false,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! You can now log in.',
      user: newUser,
      token: `token_${Date.now()}`
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to create account.' },
      { status: 500 }
    );
  }
}
