import { NextResponse } from 'next/server';
import { INITIAL_REVIEWS, ReviewItem, maskEmail } from '@/lib/store';

let commentsDb: ReviewItem[] = [...INITIAL_REVIEWS];

export async function GET() {
  return NextResponse.json({
    success: true,
    reviews: commentsDb
  });
}

export async function POST(req: Request) {
  try {
    const { email, rating, comment } = await req.json();

    if (!comment || comment.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: 'Please enter a genuine comment.' },
        { status: 400 }
      );
    }

    const masked = maskEmail(email || 'member@gmail.com');

    const newReview: ReviewItem = {
      id: `rev_${Date.now()}`,
      userMasked: masked,
      rating: Number(rating) || 5,
      comment: comment.trim(),
      date: 'Just now',
      verified: true
    };

    commentsDb.unshift(newReview);

    return NextResponse.json({
      success: true,
      message: 'Thank you for sharing your experience! Your review is now live.',
      review: newReview
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
