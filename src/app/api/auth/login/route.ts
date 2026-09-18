import { NextResponse } from 'next/server';
import { dbFindUserByCredentials, dbGetAllUsersRaw, UserRecord } from '@/lib/db';

// Admin credentials (from env or hardcoded fallback)
const ADMIN_EMAIL = 'tradinghath@gmail.com';
const ADMIN_USERNAME = 'tradinghath';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '22NE1A04E1@093';

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter both username/email and password.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Admin login check (admin username 'tradinghath' or admin email 'tradinghath@gmail.com')
    const isAdminLogin =
      cleanIdentifier === ADMIN_EMAIL ||
      cleanIdentifier === ADMIN_USERNAME;

    if (isAdminLogin) {
      if (cleanPassword === ADMIN_PASSWORD) {
        return NextResponse.json({
          success: true,
          isAdmin: true,
          isPro: true,
          user: {
            id: 'admin',
            username: ADMIN_USERNAME,
            email: ADMIN_EMAIL,
            role: 'admin',
          },
          token: 'admin_token_' + Date.now(),
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid admin credentials.' },
          { status: 401 }
        );
      }
    }

    // 2. Enforce email format for all regular users (@ and domain required)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanIdentifier)) {
      return NextResponse.json(
        { success: false, error: 'Please enter your complete email address including @gmail.com (or your email domain). Name alone is not accepted.' },
        { status: 400 }
      );
    }

    // 3. Regular user login — strictly match user by their registered email
    const allUsers = await dbGetAllUsersRaw();
    const user = allUsers.find(
      u => u.email?.toLowerCase() === cleanIdentifier && !u.deleted
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email address. Please check your email or sign up.' },
        { status: 401 }
      );
    }

    if (user.password !== cleanPassword) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    if (user.deleted) {
      return NextResponse.json(
        { success: false, error: 'This account has been deleted. Please contact support.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      isAdmin: false,
      isPro: user.isPro,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'user',
      },
      token: 'user_token_' + Date.now(),
    });
  } catch (error: any) {
    console.error('[LOGIN]', error);
    return NextResponse.json(
      { success: false, error: 'Login service failed. Please try again.' },
      { status: 500 }
    );
  }
}
