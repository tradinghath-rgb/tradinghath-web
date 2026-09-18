import { NextResponse } from 'next/server';
import {
  dbGetAllUsers,
  dbUpdateUserProStatus,
  dbSoftDeleteUser,
  dbChangeUserPassword,
} from '@/lib/db';

export async function GET() {
  try {
    const users = await dbGetAllUsers();
    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    console.error('[ADMIN USERS GET]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, userId, email, username, newPassword } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: 'Missing action' }, { status: 400 });
    }

    if (action === 'grant_pro') {
      const target = userId || email || username;
      if (!target) return NextResponse.json({ success: false, error: 'Missing user identifier' }, { status: 400 });
      await dbUpdateUserProStatus(target, true);
      return NextResponse.json({ success: true, message: 'Pro access granted.' });
    }

    if (action === 'revoke_pro') {
      const target = userId || email || username;
      if (!target) return NextResponse.json({ success: false, error: 'Missing user identifier' }, { status: 400 });
      await dbUpdateUserProStatus(target, false);
      return NextResponse.json({ success: true, message: 'Pro access revoked.' });
    }

    if (action === 'delete') {
      const target = userId || email || username;
      if (!target) return NextResponse.json({ success: false, error: 'Missing user identifier' }, { status: 400 });
      await dbSoftDeleteUser(target);
      return NextResponse.json({ success: true, message: 'User deleted.' });
    }

    if (action === 'change_password') {
      if (!newPassword || newPassword.length < 4) {
        return NextResponse.json({ success: false, error: 'Password too short (min 4 chars)' }, { status: 400 });
      }
      const target = userId || email || username;
      if (!target) return NextResponse.json({ success: false, error: 'Missing user identifier' }, { status: 400 });
      await dbChangeUserPassword(target, newPassword.trim());
      return NextResponse.json({ success: true, message: 'Password updated.' });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('[ADMIN USERS POST]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
