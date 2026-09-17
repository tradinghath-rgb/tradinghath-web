import { NextResponse } from 'next/server';
import { findUserByCredentials, registerNewUser, isUserDeleted } from '@/lib/userStore';

export async function POST(req: Request) {
  try {
    const { identifier, password, clientUsers } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter both username/email and password.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    // 1. Strict Check: If this user ID, email, or username is marked as DELETED by Admin, block completely!
    if (isUserDeleted(cleanIdentifier)) {
      return NextResponse.json(
        {
          success: false,
          error: 'This account has been deleted by Administrator. Please create a new account to continue.'
        },
        { status: 401 }
      );
    }

    // Sync any registered client users into server memory if provided (skip any that were deleted)
    if (Array.isArray(clientUsers) && clientUsers.length > 0) {
      for (const cu of clientUsers) {
        if (cu && cu.email && cu.username) {
          if (!isUserDeleted(cu.id) && !isUserDeleted(cu.email) && !isUserDeleted(cu.username)) {
            registerNewUser(cu);
          }
        }
      }
    }

    // 2. Check Admin Login
    if (
      (cleanIdentifier.toLowerCase() === 'tradinghath' || cleanIdentifier.toLowerCase() === 'tradinghath@gmail.com') &&
      (cleanPassword === '22NE1A04E1@093' || cleanPassword === '22NE1A04E1' || cleanPassword === '9390')
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

    // 3. Strict Check: User MUST have an active registered account!
    let existingUser = findUserByCredentials(cleanIdentifier, cleanPassword);

    // If not found in global memory, check clientUsers fallback (only non-deleted users)
    if (!existingUser && Array.isArray(clientUsers)) {
      const match = clientUsers.find(
        (u: any) =>
          (u.username?.toLowerCase() === cleanIdentifier.toLowerCase() ||
            u.email?.toLowerCase() === cleanIdentifier.toLowerCase()) &&
          u.password === cleanPassword &&
          !isUserDeleted(u.id) &&
          !isUserDeleted(u.email) &&
          !isUserDeleted(u.username)
      );
      if (match) {
        registerNewUser(match);
        existingUser = match;
      }
    }

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

