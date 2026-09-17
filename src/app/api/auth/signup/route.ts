import { NextResponse } from 'next/server';
import { registerNewUser, isUsernameTaken, isEmailTaken, UserAdminType } from '@/lib/userStore';

export async function POST(req: Request) {
  try {
    const { username, email, phone, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please fill in username, email, and password.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    // Check if username is already taken
    if (isUsernameTaken(cleanUsername) || cleanUsername.toLowerCase() === 'tradinghath') {
      return NextResponse.json(
        { success: false, error: `This username "${cleanUsername}" is already taken. Please choose a different username.` },
        { status: 400 }
      );
    }

    // Check if email is already registered
    if (isEmailTaken(cleanEmail) || cleanEmail.toLowerCase() === 'tradinghath@gmail.com') {
      return NextResponse.json(
        { success: false, error: `This email "${cleanEmail}" is already registered. Please log in or use a different email.` },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const newUser: UserAdminType = {
      id: `user_${Date.now()}`,
      username: username.trim(),
      email: email.trim(),
      password: password.trim(), // Stored for admin viewing & management
      phone: phone ? phone.trim() : '',
      isPro: false,
      amount: 0,
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

