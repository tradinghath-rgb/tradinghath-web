import { NextResponse } from 'next/server';
import {
  getAllUsers,
  updateUserProStatus,
  deleteUserPermanently,
  changeUserPassword
} from '@/lib/userStore';

export async function GET() {
  const users = getAllUsers();
  return NextResponse.json({
    success: true,
    users
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, userId, newPassword, email, username } = body;

    if (action === 'grant_pro') {
      updateUserProStatus(userId, true);
      return NextResponse.json({ success: true, message: 'Pro access granted to user' });
    }

    if (action === 'revoke_pro') {
      updateUserProStatus(userId, false);
      return NextResponse.json({ success: true, message: 'Pro access revoked' });
    }

    if (action === 'delete') {
      deleteUserPermanently(userId);
      if (email) deleteUserPermanently(email);
      if (username) deleteUserPermanently(username);
      return NextResponse.json({ success: true, message: 'User permanently deleted from system' });
    }

    if (action === 'change_password') {
      if (!newPassword || newPassword.length < 4) {
        return NextResponse.json({ success: false, error: 'Password too short' }, { status: 400 });
      }
      changeUserPassword(userId, newPassword.trim());
      return NextResponse.json({ success: true, message: 'User password updated successfully!' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}



