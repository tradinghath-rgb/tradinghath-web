import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, phone } = body;

    const key_secret = process.env.RAZORPAY_KEY_SECRET || '5muzlTULoD2MTvD3Kyz8cHvC';

    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = hmac.digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature. Verification failed.' },
        { status: 400 }
      );
    }

    // In a production database like Supabase or MongoDB, we update the user record to isPro: true.
    // Returning pro credentials and session token
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully! Pro lifetime access granted.',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      isPro: true,
      email
    });
  } catch (error: any) {
    console.error('Payment Verification Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
