import { NextResponse } from 'next/server';
import { dbGetAllUsers, dbFindUserByEmail } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId, email, username } = await req.json();

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanId = (userId || '').trim();

    // Admin is never deleted
    const isAdmin = cleanUser === 'tradinghath' || cleanEmail === 'tradinghath@gmail.com';
    if (isAdmin) {
      return NextResponse.json({
        success: true,
        isPro: true,
        isAdmin: true,
        deleted: false,
      });
    }

    // Query persistent database (Upstash Redis / in-memory fallback)
    const allUsers = await dbGetAllUsers();
    const found = allUsers.find(
      u =>
        u.id === cleanId ||
        (u.email && u.email.toLowerCase() === cleanEmail) ||
        (u.username && u.username.toLowerCase() === cleanUser)
    );

    if (!found) {
      // IMPORTANT: If user not found, it could be because:
      // 1. They were actually deleted by admin (legitimate)
      // 2. Redis is not yet configured and in-memory store is empty after restart
      //
      // To avoid false "account removed" alerts on server restart,
      // we return a SOFT "not found" response instead of deleted=true.
      // The dashboard will keep the session alive and retry.
      return NextResponse.json({
        success: true,
        deleted: false, // Do NOT kick users out just because DB is empty
        notFound: true, // Soft signal — dashboard can use this to show a warning without alert
        isPro: false,
        message: 'User not in current session store',
      });
    }

    // User found — check if soft-deleted
    if (found.deleted) {
      return NextResponse.json({
        success: true,
        deleted: true,
        isPro: false,
        message: 'Account has been deleted by administrator',
      });
    }

    return NextResponse.json({
      success: true,
      deleted: false,
      notFound: false,
      isPro: found.isPro === true,
      amount: found.amount || 0,
    });
  } catch (err: any) {
    console.error('[AUTH CHECK]', err);
    // On error, NEVER kick the user out — return safe response
    return NextResponse.json({
      success: false,
      deleted: false,
      isPro: false,
      error: err.message,
    });
  }
}
