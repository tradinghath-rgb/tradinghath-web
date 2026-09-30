import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, phone, name } = body;

    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_live_TclwORJF0hO0sJ';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || '5muzlTULoD2MTvD3Kyz8cHvC';

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const paymentLink = await razorpay.paymentLink.create({
      amount: 39900, // 399 INR in paise
      currency: 'INR',
      accept_partial: false,
      description: 'Lifetime Access (₹399) - TradingHath Charts & Video Vault',
      customer: {
        name: name || 'Valued Trader',
        email: email || undefined,
        contact: phone || undefined,
      },
      notify: {
        sms: !!phone,
        email: !!email,
      },
      reminder_enable: true,
      notes: {
        userEmail: email || '',
        plan: 'Lifetime Access 399',
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradinghath.com'}/?payment_status=success`,
      callback_method: 'get',
    });

    return NextResponse.json({
      success: true,
      paymentLink: paymentLink.short_url,
      id: paymentLink.id,
    });
  } catch (error: any) {
    console.error('Razorpay Create Link Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment link' },
      { status: 500 }
    );
  }
}
