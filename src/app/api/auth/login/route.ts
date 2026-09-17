import { NextResponse } from 'next/server';
import { findUserByCredentials, registerNewUser, isUserDeleted, getEffectivePassword } from '@/lib/userStore';

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
    // Note: registerNewUser now preserves any admin password overrides and pro overrides!
    if (Array.isArray(clientUsers) && clientUsers.length > 0) {
      for (const cu of clientUsers) {
        if (cu && cu.email && cu.username) {
          if (!isUserDeleted(cu.id) && !isUserDeleted(cu.email) && !isUserDeleted(cu.username)) {
            registerNewUser(cu);
          }
        }
      }
    }

    // 2. Check Admin Login (tradinghath / tradinghath@gmail.com)
    const isAdminAccount = cleanIdentifier.toLowerCase() === 'tradinghath' || cleanIdentifier.toLowerCase() === 'tradinghath@gmail.com';
    if (isAdminAccount) {
      const adminEffectivePass = getEffectivePassword('tradinghath') || getEffectivePassword('tradinghath@gmail.com');
      const isValidAdminPass = (
        cleanPassword === '22NE1A04E1@093' ||
        cleanPassword === '22NE1A04E1' ||
        cleanPassword === '9390' ||
        (adminEffectivePass && cleanPassword === adminEffectivePass)
      );

      if (isValidAdminPass) {
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
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid admin credentials! Please enter the correct password.'
          },
          { status: 401 }
        );
      }
    }

    // 3. Strict Check: User MUST authenticate against their active password!
    // Check if the user exists but provided an invalid/old password
    const effectivePass = getEffectivePassword(cleanIdentifier);
    if (effectivePass && effectivePass !== cleanPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid password! If your password was recently changed by Admin, please enter your new password.'
        },
        { status: 401 }
      );
    }

    let existingUser = findUserByCredentials(cleanIdentifier, cleanPassword);

    // If not found in memory, check clientUsers fallback ONLY if no password override exists
    if (!existingUser && Array.isArray(clientUsers)) {
      const match = clientUsers.find(
        (u: any) =>
          (u.username?.toLowerCase() === cleanIdentifier.toLowerCase() ||
            u.email?.toLowerCase() === cleanIdentifier.toLowerCase()) &&
          !isUserDeleted(u.id) &&
          !isUserDeleted(u.email) &&
          !isUserDeleted(u.username)
      );
      if (match) {
        const expectedPass = getEffectivePassword(cleanIdentifier) || match.password;
        if (cleanPassword === expectedPass) {
          registerNewUser({ ...match, password: expectedPass });
          existingUser = findUserByCredentials(cleanIdentifier, cleanPassword);
        }
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

