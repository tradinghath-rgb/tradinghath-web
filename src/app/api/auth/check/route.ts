import { NextResponse } from 'next/server';
import { getAllUsers, isUserDeleted } from '@/lib/userStore';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId, email, username } = await req.json();

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanId = (userId || '').trim();

    // Check if deleted
    if (isUserDeleted(cleanId) || isUserDeleted(cleanEmail) || isUserDeleted(cleanUser)) {
      return NextResponse.json({
        success: true,
        deleted: true,
        isPro: false,
        message: 'Account has been deleted'
      });
    }

    // Admin is strictly tradinghath only
    const isAdmin = cleanUser === 'tradinghath' || cleanEmail === 'tradinghath@gmail.com';
    if (isAdmin) {
      return NextResponse.json({
        success: true,
        isPro: true,
        isAdmin: true,
        deleted: false
      });
    }

    // Check against live server records
    const allUsers = getAllUsers();
    const found = allUsers.find(
      u => u.id === cleanId || 
           (u.email && u.email.toLowerCase() === cleanEmail) || 
           (u.username && u.username.toLowerCase() === cleanUser)
    );

    if (!found) {
      // User does not exist in admin database
      return NextResponse.json({
        success: true,
        deleted: true,
        isPro: false,
        message: 'User not found in system'
      });
    }

    return NextResponse.json({
      success: true,
      deleted: false,
      isPro: found.isPro === true,
      amount: found.amount || 0
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
