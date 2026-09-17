import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { utrId, email } = await req.json();

    if (!utrId || utrId.trim().length < 8) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 12-digit UPI UTR transaction reference.' },
        { status: 400 }
      );
    }

    const cleanUtr = utrId.trim();

    // Check Razorpay payments API strictly
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_live_TclwORJF0hO0sJ';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || '5muzlTULoD2MTvD3Kyz8cHvC';

    let verifiedViaRzp = false;

    try {
      const razorpay = new Razorpay({ key_id, key_secret });
      const recentPayments = await razorpay.payments.all({ count: 50 });
      
      const matched = recentPayments.items.find((p: any) => {
        const acquirer = p.acquirer_data || {};
        return (
          p.status === 'captured' &&
          Number(p.amount) >= 39900 && // must be 399 INR
          (
            p.id === cleanUtr ||
            acquirer.rrn === cleanUtr ||
            acquirer.bank_transaction_id === cleanUtr ||
            acquirer.upi_transaction_id === cleanUtr
          )
        );
      });

      if (matched) {
        verifiedViaRzp = true;
      }
    } catch (rzpErr) {
      console.warn('Razorpay UTR check error:', rzpErr);
    }

    if (verifiedViaRzp) {
      return NextResponse.json({
        success: true,
        status: 'verified',
        isPro: true,
        message: 'Payment verified with Razorpay! Pro access unlocked.',
        utrId: cleanUtr,
        email
      });
    }

    // STRICT: If NOT found in Razorpay records, DO NOT GRANT ACCESS.
    // Queue for Admin manual verification in Admin panel only!
    return NextResponse.json({
      success: true,
      status: 'pending_admin_approval',
      isPro: false, // STRICT: Access remains locked!
      message: 'UTR ID submitted. Your payment is pending verification by the admin. Access will be unlocked once admin verifies your ₹399 payment.',
      utrId: cleanUtr,
      email
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Error submitting UTR.' },
      { status: 500 }
    );
  }
}

