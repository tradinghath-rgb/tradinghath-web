import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Generate 6 digit reset verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // In a production server, this invokes nodemailer/Sendgrid from tradinghath@gmail.com
    console.log(`[PASSWORD RESET] Dispatching code ${resetCode} to ${email} from tradinghath@gmail.com`);

    return NextResponse.json({
      success: true,
      message: `A 6-digit reset code has been sent from tradinghath@gmail.com to your email.`,
      debugCode: resetCode // returned so user can test immediately in preview mode
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
