import { NextResponse } from 'next/server';
import { getRotatingReviews, ReviewItem, maskEmail, formatRealTimestamp } from '@/lib/store';
import { dbGetAllComments, dbAddComment, dbDeleteComment, dbGetAllUsersRaw, CommentRecord } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rawDbComments = await dbGetAllComments();
    const currentRotatingSeed = getRotatingReviews();

    // 1. Keep REAL user comment timestamps 100% genuine based on their actual creation time
    const dbComments: ReviewItem[] = rawDbComments.map(c => ({
      id: c.id,
      userMasked: c.userMasked,
      rating: c.rating,
      comment: c.comment,
      date: formatRealTimestamp(c.createdAt), // Authentic calculated elapsed time (never faked!)
      verified: c.verified ?? true
    }));
    
    // Filter seed reviews to exclude any matching IDs
    const existingIds = new Set(dbComments.map(c => c.id));
    const seedReviews = currentRotatingSeed.filter(r => !existingIds.has(r.id));

    // 2. Rotate comment placement smoothly across 2-hour intervals:
    // If there are both real user comments and rotating hype reviews, interleave them or rotate positions
    // so real comments and seed comments rotate naturally across the grid
    let combinedReviews: ReviewItem[] = [];

    if (dbComments.length === 0) {
      combinedReviews = seedReviews;
    } else {
      // Interleave real comments and rotating reviews based on current 2-hour slot
      const INTERVAL_MS = 2 * 60 * 60 * 1000;
      const slot = Math.floor(Date.now() / INTERVAL_MS);
      const rotatedSeeds = [...seedReviews];
      // Rotate seed starting position based on slot
      const seedShift = slot % rotatedSeeds.length;
      const shiftedSeeds = [...rotatedSeeds.slice(seedShift), ...rotatedSeeds.slice(0, seedShift)];

      // Interweave: real comment, seed comment, real comment, seed comment...
      const totalLen = dbComments.length + shiftedSeeds.length;
      let dbIdx = 0;
      let seedIdx = 0;

      for (let i = 0; i < totalLen; i++) {
        // Even positions get real comments first (if available), odd positions get seed comments
        if ((i % 2 === 0 && dbIdx < dbComments.length) || seedIdx >= shiftedSeeds.length) {
          combinedReviews.push(dbComments[dbIdx++]);
        } else if (seedIdx < shiftedSeeds.length) {
          combinedReviews.push(shiftedSeeds[seedIdx++]);
        }
      }
    }

    return NextResponse.json({
      success: true,
      reviews: combinedReviews
    });
  } catch (err: any) {
    return NextResponse.json({ success: true, reviews: getRotatingReviews() });
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

