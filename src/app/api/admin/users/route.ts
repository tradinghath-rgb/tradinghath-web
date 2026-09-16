import { NextResponse } from 'next/server';

interface UserAdminType {
  id: string;
  username: string;
  email: string;
  phone?: string;
  isPro: boolean;
  proGrantedAt?: string;
  createdAt: string;
  paymentId?: string;
  utrId?: string;
  amount: number;
}

let mockUsers: UserAdminType[] = [
  {
    id: 'u1',
    username: 'rohit_trader',
    email: 'rohit****@gmail.com',
    phone: '+91 9876543210',
    isPro: true,
    proGrantedAt: '2026-09-15T10:30:00Z',
    createdAt: '2026-09-15T10:28:00Z',
    paymentId: 'pay_P9aK2dK9x8Lq1',
    amount: 399
  },
  {
    id: 'u2',
    username: 'karthik_nifty',
    email: 'karthik****@gmail.com',
    phone: '+91 9123456780',
    isPro: true,
    proGrantedAt: '2026-09-16T14:12:00Z',
    createdAt: '2026-09-16T14:10:00Z',
    utrId: '425910283918',
    amount: 399
  },
  {
    id: 'u3',
    username: 'vijay_scalper',
    email: 'vijay****@gmail.com',
    phone: '+91 9988776655',
    isPro: false,
    createdAt: '2026-09-16T18:00:00Z',
    amount: 0
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    users: mockUsers
  });
}

export async function POST(req: Request) {
  try {
    const { action, userId } = await req.json();

    if (action === 'grant_pro') {
      mockUsers = mockUsers.map(u => u.id === userId ? { ...u, isPro: true, proGrantedAt: new Date().toISOString() } : u);
      return NextResponse.json({ success: true, message: 'Pro access granted to user' });
    }

    if (action === 'revoke_pro') {
      mockUsers = mockUsers.map(u => u.id === userId ? { ...u, isPro: false } : u);
      return NextResponse.json({ success: true, message: 'Pro access revoked' });
    }

    if (action === 'delete') {
      mockUsers = mockUsers.filter(u => u.id !== userId);
      return NextResponse.json({ success: true, message: 'User deleted successfully' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

