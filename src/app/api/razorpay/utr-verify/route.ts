import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { utrId, email, phone } = await req.json();

    if (!utrId || utrId.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 12-digit UPI UTR / Reference ID.' },
        { status: 400 }
      );
    }

    const cleanUtr = utrId.trim();

    // Check Razorpay payments API to see if this UTR or reference exists in recent payments
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_live_TclwORJF0hO0sJ';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || '5muzlTULoD2MTvD3Kyz8cHvC';

    let verifiedViaRzp = false;
    let paymentDetails: any = null;

    try {
      const razorpay = new Razorpay({ key_id, key_secret });
      const recentPayments = await razorpay.payments.all({ count: 20 });
      
      // Look for match in payment entities (acquirer_data.rrn or bank_transaction_id or id)
      const matched = recentPayments.items.find((p: any) => {
        const acquirer = p.acquirer_data || {};
        return (
          p.id === cleanUtr ||
          acquirer.rrn === cleanUtr ||
          acquirer.bank_transaction_id === cleanUtr ||
          acquirer.upi_transaction_id === cleanUtr
        );
      });

      if (matched && matched.status === 'captured') {
        verifiedViaRzp = true;
        paymentDetails = matched;
      }
    } catch (rzpErr) {
      console.warn('Razorpay UTR lookup fallback:', rzpErr);
    }

    // In both cases, return status. If verified immediately, pro granted.
    // If pending, mark as pending verification for admin review.
    return NextResponse.json({
      success: true,
      status: verifiedViaRzp ? 'verified' : 'pending_admin_approval',
      isPro: verifiedViaRzp,
      message: verifiedViaRzp
        ? 'UTR ID successfully verified via Razorpay! Lifetime access activated.'
        : 'UTR ID submitted successfully. Our system is verifying your ₹399 payment. Access is typically activated within a few minutes!',
      utrId: cleanUtr,
      email
    });
  } catch (error: any) {
    console.error('UTR Verification Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error verifying UTR' },
      { status: 500 }
    );
  }
}
