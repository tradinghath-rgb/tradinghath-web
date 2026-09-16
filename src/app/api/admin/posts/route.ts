import { NextResponse } from 'next/server';
import { INITIAL_POSTS, PostItem } from '@/lib/store';

let postsDatabase: PostItem[] = [...INITIAL_POSTS];

export async function GET() {
  const now = new Date().toISOString();
  
  // Return all posts for admin, including scheduled ones
  return NextResponse.json({
    success: true,
    posts: postsDatabase.map(p => {
      // Auto-publish if scheduled time has passed
      if (p.scheduledAt && p.scheduledAt <= now && !p.published) {
        return { ...p, published: true };
      }
      return p;
    })
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, type, language, chartUrl, videoUrl, scheduledAt } = body;

    const newPost: PostItem = {
      id: `post_${Date.now()}`,
      title,
      description,
      type: type || 'chart',
      language: language || 'both',
      chartUrl: chartUrl || (type === 'chart' ? 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80' : undefined),
      videoUrl: videoUrl || '/videos/telugu/REEL-24(LQT SETUP).mp4',
      downloadUrl: type === 'chart' ? (chartUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80') : undefined,
      scheduledAt: scheduledAt || undefined,
      published: !scheduledAt || new Date(scheduledAt) <= new Date(),
      createdAt: new Date().toISOString()
    };

    postsDatabase.unshift(newPost);

    return NextResponse.json({
      success: true,
      message: scheduledAt ? 'Post scheduled successfully!' : 'Post published immediately!',
      post: newPost
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
