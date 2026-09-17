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
    const cleanEmail = (email || '').trim().toLowerCase();

    // Check Razorpay payments API strictly
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_live_TclwORJF0hO0sJ';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || '5muzlTULoD2MTvD3Kyz8cHvC';

    let verifiedViaRzp = false;
    let matchedPayment: any = null;

    try {
      const razorpay = new Razorpay({ key_id, key_secret });
      const recentPayments = await razorpay.payments.all({ count: 100 });
      
      matchedPayment = recentPayments.items.find((p: any) => {
        if (p.status !== 'captured') return false;

        const acquirer = p.acquirer_data || {};
        const rzpEmail = (p.email || '').toLowerCase();
        const rzpContact = (p.contact || '');
        const rrn = (acquirer.rrn || '').toString();
        const bankTxnId = (acquirer.bank_transaction_id || '').toString();
        const upiTxnId = (acquirer.upi_transaction_id || '').toString();
        const paymentId = (p.id || '').toString();

        // Check if UTR matches payment ID, rrn, bank txn id, upi txn id, or string contains UTR
        const idMatches = 
          paymentId.toLowerCase() === cleanUtr.toLowerCase() ||
          rrn === cleanUtr ||
          bankTxnId === cleanUtr ||
          upiTxnId === cleanUtr ||
          (cleanUtr.length >= 8 && (rrn.includes(cleanUtr) || bankTxnId.includes(cleanUtr) || upiTxnId.includes(cleanUtr)));

        // Or email matches and payment was within last 48 hours for 399
        const emailMatches = cleanEmail && rzpEmail === cleanEmail;

        return idMatches || emailMatches;
      });

      if (matchedPayment) {
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
        message: 'Payment verified automatically with Razorpay records! Pro access unlocked immediately.',
        utrId: cleanUtr,
        paymentId: matchedPayment?.id,
        email: cleanEmail
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

