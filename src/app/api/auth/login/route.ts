import { NextResponse } from 'next/server';

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

    // Check Admin login matching the user's reference screenshot
    // Username: tradinghath, Password: 22NE1A04E1@093
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

    // Normal User Login (demo auto-detects or checks pro status)
    // If the user's email has already unlocked ₹399, they are pro.
    const isMember = true;
    return NextResponse.json({
      success: true,
      isAdmin: false,
      isPro: cleanIdentifier.includes('pro') || cleanIdentifier.includes('paid'), // easy demo hook, or default active
      user: {
        username: cleanIdentifier.split('@')[0],
        email: cleanIdentifier.includes('@') ? cleanIdentifier : `${cleanIdentifier}@gmail.com`,
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
