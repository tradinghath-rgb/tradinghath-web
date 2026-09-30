import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { dbUpdateUserProStatus, dbGetAllUsersRaw, dbGetAllUtr, dbSubmitUtr } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_live_TclwORJF0hO0sJ';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || '5muzlTULoD2MTvD3Kyz8cHvC';
    const razorpay = new Razorpay({ key_id, key_secret });

    // Fetch the 50 most recent payments from Razorpay
    const payments = await razorpay.payments.all({ count: 50 });
    const allUsers = await dbGetAllUsersRaw();
    const allUtrs = await dbGetAllUtr();

    // Look for any captured payment of ₹399 that matches this user's email,
    // or recent captured payments that haven't been claimed by any other user
    const matched = payments.items.find((p: any) => {
      if (p.status !== 'captured') return false;
      if (Number(p.amount) < 39900) return false;

      // 1. Direct match with email on Razorpay payment
      if (p.email && p.email.toLowerCase() === cleanEmail) {
        return true;
      }

      return false;
    });

    if (matched) {
      // Check if this payment is already claimed by a DIFFERENT account
      const alreadyClaimed = allUsers.find(
        u => u.isPro &&
             u.paymentId &&
             u.paymentId.toLowerCase() === matched.id.toLowerCase() &&
             u.email?.toLowerCase() !== cleanEmail
      );

      if (!alreadyClaimed) {
        // Automatically activate Pro access for this user
        const acquirer = matched.acquirer_data || {};
        const utrNumber = acquirer.rrn || acquirer.bank_transaction_id || acquirer.upi_transaction_id || matched.id;
        const upiId = matched.vpa || '';

        await dbUpdateUserProStatus(cleanEmail, true, {
          paymentId: matched.id,
          utrId: utrNumber,
          upiId,
          amount: 399
        });

        try {
          await dbSubmitUtr({
            id: `utr_auto_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            email: cleanEmail,
            utrNumber,
            upiId,
            paymentDate: new Date().toLocaleDateString('en-IN'),
            paymentTime: new Date().toLocaleTimeString('en-IN'),
            paymentMethod: matched.method || 'UPI',
            amount: 399,
            status: 'VERIFIED',
            adminNotes: `Auto-verified on redirection via Razorpay payment ${matched.id}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } catch (e) {}

        return NextResponse.json({
          success: true,
          isPro: true,
          paymentId: matched.id,
          message: 'Payment detected! Pro lifetime access granted automatically.'
        });
      }
    }

    return NextResponse.json({
      success: true,
      isPro: false,
      message: 'No automatic payment match found yet'
    });
  } catch (error: any) {
    console.error('Auto-check payment error:', error);
    return NextResponse.json({ success: false, error: 'Auto check failed' }, { status: 500 });
  }
}
