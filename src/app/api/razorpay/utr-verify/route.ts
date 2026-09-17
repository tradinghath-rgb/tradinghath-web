import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getAllUsers, updateUserProStatus } from '@/lib/userStore';

export async function POST(req: Request) {
  try {
    const { utrId, email } = await req.json();

    if (!utrId || utrId.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 12-digit UPI UTR / Reference ID or Razorpay Payment ID.' },
        { status: 400 }
      );
    }

    const cleanUtr = utrId.trim().toLowerCase();

    // Use Razorpay Live API keys directly
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_live_TclwORJF0hO0sJ';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || '5muzlTULoD2MTvD3Kyz8cHvC';

    const razorpay = new Razorpay({ key_id, key_secret });

    let verifiedPayment: any = null;

    try {
      // 1. Try fetching directly as a Razorpay Payment ID (e.g. pay_...)
      if (cleanUtr.startsWith('pay_')) {
        try {
          const directPay = await razorpay.payments.fetch(utrId.trim());
          if (directPay && directPay.status === 'captured') {
            verifiedPayment = directPay;
          }
        } catch (e) {
          // not a direct payment ID, continue to search list
        }
      }

      // 2. Search recent payments from Razorpay (up to 100 recent transactions)
      if (!verifiedPayment) {
        const paymentsList = await razorpay.payments.all({ count: 100 });
        
        verifiedPayment = paymentsList.items.find((p: any) => {
          const acquirer = p.acquirer_data || {};
          const rrn = String(acquirer.rrn || '').trim().toLowerCase();
          const upiTxnId = String(acquirer.upi_transaction_id || '').trim().toLowerCase();
          const bankTxnId = String(acquirer.bank_transaction_id || '').trim().toLowerCase();
          const payId = String(p.id || '').trim().toLowerCase();
          const orderId = String(p.order_id || '').trim().toLowerCase();

          const isMatch = (
            payId === cleanUtr ||
            rrn === cleanUtr ||
            upiTxnId === cleanUtr ||
            bankTxnId === cleanUtr ||
            orderId === cleanUtr
          );

          return isMatch && p.status === 'captured';
        });
      }
    } catch (rzpErr: any) {
      console.error('Razorpay automated verification error:', rzpErr);
    }

    // If Razorpay automatically finds the real captured payment:
    if (verifiedPayment) {
      // Auto-grant pro status in userStore if email exists
      if (email) {
        const all = getAllUsers();
        const target = all.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
        if (target) {
          updateUserProStatus(target.id, true);
        }
      }

      return NextResponse.json({
        success: true,
        isPro: true,
        message: `✅ Real payment verified by Razorpay! (Amount: ₹${verifiedPayment.amount / 100}). Access unlocked!`,
        paymentId: verifiedPayment.id,
        utrId: cleanUtr,
        email
      });
    }

    // If Razorpay confirms NO captured payment exists with this UTR:
    return NextResponse.json({
      success: true,
      isPro: false,
      message: '❌ Razorpay Automated Check: No successful (captured) ₹399 payment matches this UTR ID in your Razorpay account. If you made the payment, please check your bank SMS / UPI app for the exact 12-digit UTR or wait 1-2 minutes for Razorpay to settle it.',
      utrId: cleanUtr,
      email
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Automated Razorpay verification failed.' },
      { status: 500 }
    );
  }
}


