import { NextResponse } from 'next/server';
import { getAllPosts, addNewPost, deletePost, publishPostNow } from '@/lib/postStore';
import { PostItem } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json({
      success: true,
      posts
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      action, 
      postId, 
      id,
      title, 
      description, 
      type, 
      language, 
      chartUrl, 
      videoUrl, 
      videoUrlTelugu,
      videoUrlEnglish,
      downloadUrl,
      scheduledAt 
    } = body;

    if (action === 'delete') {
      await deletePost(postId || id);
      return NextResponse.json({ success: true, message: 'Post deleted successfully!' });
    }

    if (action === 'publish_now') {
      await publishPostNow(postId || id);
      return NextResponse.json({ success: true, message: 'Scheduled post has been published live now!' });
    }

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    const isChart = type === 'chart';
    const isScheduled = scheduledAt && new Date(scheduledAt) > new Date();
    const targetId = id || postId || `post_${Date.now()}`;

    const newPost: PostItem = {
      id: targetId,
      title: title.trim(),
      description: description ? description.trim() : '',
      type: type || 'chart',
      language: language || 'both',
      chartUrl: isChart ? (chartUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80') : undefined,
      videoUrl: videoUrl || (!isChart ? 'https://www.youtube.com/embed/ss24aZbCsYs?autoplay=0' : undefined),
      videoUrlTelugu: videoUrlTelugu || (language === 'telugu' || language === 'both' ? videoUrl : undefined),
      videoUrlEnglish: videoUrlEnglish || (language === 'english' || language === 'both' ? videoUrl : undefined),
      downloadUrl: downloadUrl || (isChart ? (chartUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80') : undefined),
      scheduledAt: scheduledAt || undefined,
      published: !isScheduled,
      createdAt: new Date().toISOString()
    };

    await addNewPost(newPost);

    return NextResponse.json({
      success: true,
      message: isScheduled ? 'Post scheduled successfully!' : 'Post published immediately to users!',
      post: newPost
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

