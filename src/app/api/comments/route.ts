import { NextResponse } from 'next/server';
import { INITIAL_REVIEWS, ReviewItem, maskEmail } from '@/lib/store';
import { dbGetAllComments, dbAddComment, dbDeleteComment, dbGetAllUsersRaw, CommentRecord } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbComments = await dbGetAllComments();
    
    // Combine persistent database comments with initial seed reviews
    const existingIds = new Set(dbComments.map(c => c.id));
    const seedReviews = INITIAL_REVIEWS.filter(r => !existingIds.has(r.id));
    const allReviews = [...dbComments, ...seedReviews];

    return NextResponse.json({
      success: true,
      reviews: allReviews
    });
  } catch (err: any) {
    return NextResponse.json({ success: true, reviews: INITIAL_REVIEWS });
  }
}

export async function POST(req: Request) {
  try {
    const { email, rating, comment } = await req.json();

    if (!comment || comment.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: 'Please enter a genuine comment (at least 4 characters).' },
        { status: 400 }
      );
    }

    const cleanEmail = (email || '').trim().toLowerCase();

    // Verify user is registered
    const allUsers = await dbGetAllUsersRaw();
    const isRegistered = allUsers.some(
      u => u.email?.toLowerCase() === cleanEmail && !u.deleted
    ) || cleanEmail === 'tradinghath@gmail.com';

    if (!isRegistered) {
      return NextResponse.json(
        {
          success: false,
          requireAuth: true,
          error: 'Only registered members can post comments. Please sign up or log in first.'
        },
        { status: 401 }
      );
    }

    const masked = maskEmail(cleanEmail || 'member@gmail.com');

    const newComment: CommentRecord = {
      id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userMasked: masked,
      rawEmail: cleanEmail,
      rating: Number(rating) || 5,
      comment: comment.trim(),
      date: 'Just now',
      verified: true,
      createdAt: new Date().toISOString()
    };

    await dbAddComment(newComment);

    return NextResponse.json({
      success: true,
      message: 'Thank you for sharing your experience! Your review is now live.',
      review: newComment
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Comment ID is required' }, { status: 400 });
    }

    await dbDeleteComment(id);

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully.'
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

