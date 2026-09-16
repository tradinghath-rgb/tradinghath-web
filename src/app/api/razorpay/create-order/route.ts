import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount = 399, currency = 'INR', receipt, notes } = body;

    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_live_TclwORJF0hO0sJ';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || '5muzlTULoD2MTvD3Kyz8cHvC';

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: Math.round(Number(amount) * 100), // amount in paise (39900)
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {
        plan: 'TradingHath Lifetime Access 399',
        support: 'tradinghath@gmail.com'
      }
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: key_id
    });
  } catch (error: any) {
    console.error('Razorpay Create Order Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create Razorpay Order'
      },
      { status: 500 }
    );
  }
}
