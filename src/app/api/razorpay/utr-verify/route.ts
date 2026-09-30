import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { dbUpdateUserProStatus, dbSubmitUtr, dbGetAllUsersRaw, dbGetAllUtr } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { utrId, email, upiId, screenshotUrl } = await req.json();

    if (!utrId || utrId.trim().length < 8) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 12-digit UPI UTR transaction reference.' },
        { status: 400 }
      );
    }

    const cleanUtr = utrId.trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanUpiId = (upiId || '').trim();
    const cleanScreenshot = (screenshotUrl || '').trim();

    // 0. FIRST: Check database to see if this UTR has already been claimed by another user
    const [allUsers, allUtrs] = await Promise.all([
      dbGetAllUsersRaw(),
      dbGetAllUtr()
    ]);

    const claimedByUser = allUsers.find(
      u => u.isPro &&
           u.utrId &&
           u.utrId.toLowerCase() === cleanUtr.toLowerCase() &&
           u.email?.toLowerCase() !== cleanEmail
    );

    const claimedInUtr = allUtrs.find(
      r => r.utrNumber &&
           r.utrNumber.toLowerCase() === cleanUtr.toLowerCase() &&
           r.status === 'VERIFIED' &&
           r.email?.toLowerCase() !== cleanEmail
    );

    if (claimedByUser || claimedInUtr) {
      const originalOwner = claimedByUser?.email || claimedInUtr?.email;
      return NextResponse.json(
        {
          success: false,
          error: `SECURITY BLOCK: This UTR (${cleanUtr}) has already been claimed by account: ${originalOwner}. Each transaction can only be redeemed once!`
        },
        { status: 400 }
      );
    }

    // Check Razorpay payments API strictly
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_live_TclwORJF0hO0sJ';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || '5muzlTULoD2MTvD3Kyz8cHvC';

    let verifiedViaRzp = false;
    let matchedPayment: any = null;

    try {
      const razorpay = new Razorpay({ key_id, key_secret });
      const recentPayments = await razorpay.payments.all({ count: 50 });
      
      matchedPayment = recentPayments.items.find((p: any) => {
        const acquirer = p.acquirer_data || {};
        return (
          p.status === 'captured' &&
          Number(p.amount) >= 39900 && // must be 399 INR
          (
            p.id === cleanUtr ||
            acquirer.rrn === cleanUtr ||
            acquirer.bank_transaction_id === cleanUtr ||
            acquirer.upi_transaction_id === cleanUtr ||
            (cleanUpiId && p.vpa && p.vpa.toLowerCase() === cleanUpiId.toLowerCase())
          )
        );
      });

      if (matchedPayment) {
        verifiedViaRzp = true;
      }
    } catch (rzpErr) {
      console.warn('Razorpay UTR check error:', rzpErr);
    }

    if (verifiedViaRzp && matchedPayment) {
      const paymentId = matchedPayment.id;
      const targetUser = cleanEmail || matchedPayment.email || 'member@gmail.com';
      const actualUpi = cleanUpiId || matchedPayment.vpa || matchedPayment.acquirer_data?.payer_account_type || '';

      // Secondary check: verify if matched paymentId has already been claimed by another user
      const paymentClaimedByUser = allUsers.find(
        u => u.isPro &&
             u.paymentId &&
             u.paymentId.toLowerCase() === paymentId.toLowerCase() &&
             u.email?.toLowerCase() !== targetUser.toLowerCase()
      );

      if (paymentClaimedByUser) {
        return NextResponse.json(
          {
            success: false,
            error: `SECURITY BLOCK: This Razorpay payment (${paymentId}) has already been claimed by account: ${paymentClaimedByUser.email}. Each payment can only be redeemed once!`
          },
          { status: 400 }
        );
      }

      // 1. Permanently update database record to isPro: true
      await dbUpdateUserProStatus(targetUser, true, {
        paymentId,
        utrId: cleanUtr,
        upiId: actualUpi,
        screenshotUrl: cleanScreenshot,
        amount: 399,
      });

      // 2. Also record verified UTR in admin log
      try {
        await dbSubmitUtr({
          id: `utr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          email: targetUser,
          utrNumber: cleanUtr,
          upiId: actualUpi,
          screenshotUrl: cleanScreenshot,
          paymentDate: new Date().toLocaleDateString('en-IN'),
          paymentTime: new Date().toLocaleTimeString('en-IN'),
          paymentMethod: matchedPayment.method || 'UPI',
          amount: 399,
          status: 'VERIFIED',
          adminNotes: `Auto-verified via Razorpay payment ${paymentId}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (logErr) {
        console.warn('Failed to record UTR log:', logErr);
      }

      return NextResponse.json({
        success: true,
        status: 'verified',
        isPro: true,
        message: 'Payment verified with Razorpay! Pro lifetime access granted.',
        utrId: cleanUtr,
        upiId: actualUpi,
        screenshotUrl: cleanScreenshot,
        paymentId,
        email: targetUser,
      });
    }

    // Record submission for admin review
    if (cleanEmail) {
      try {
        await dbSubmitUtr({
          id: `utr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          email: cleanEmail,
          utrNumber: cleanUtr,
          upiId: cleanUpiId,
          screenshotUrl: cleanScreenshot,
          paymentDate: new Date().toLocaleDateString('en-IN'),
          paymentTime: new Date().toLocaleTimeString('en-IN'),
          paymentMethod: 'UPI',
          amount: 399,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (submitErr) {}
    }

    // STRICT: If NOT found in Razorpay records, DO NOT GRANT ACCESS.
    return NextResponse.json({
      success: true,
      status: 'pending_admin_approval',
      isPro: false, // STRICT: Access remains locked!
      message: 'Payment details & screenshot received! It is queued for administrator review. If already paid, admin will verify your UTR / Screenshot and activate your account immediately.',
      utrId: cleanUtr,
      upiId: cleanUpiId,
      screenshotUrl: cleanScreenshot,
      email: cleanEmail,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Error submitting UTR.' },
      { status: 500 }
    );
  }
}

