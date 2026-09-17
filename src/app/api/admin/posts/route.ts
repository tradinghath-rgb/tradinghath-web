import { NextResponse } from 'next/server';
import { PostItem } from '@/lib/store';
import { getAllPosts, addPost, deletePost } from '@/lib/postsStore';

export async function GET() {
  const posts = getAllPosts();
  return NextResponse.json({
    success: true,
    posts
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, postId, title, description, type, language, chartUrl, videoUrl, scheduledAt } = body;

    // Handle delete action
    if (action === 'delete' && postId) {
      const deleted = deletePost(postId);
      return NextResponse.json({
        success: deleted,
        message: deleted ? 'Post deleted successfully!' : 'Post not found'
      });
    }

    const newPost: PostItem = {
      id: `post_${Date.now()}`,
      title,
      description,
      type: type || 'chart',
      language: language || 'both',
      chartUrl: chartUrl || (type === 'chart' ? 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80' : undefined),
      videoUrl: videoUrl || (type === 'video' ? '/videos/telugu/REEL-24(LQT SETUP).mp4' : undefined),
      downloadUrl: type === 'chart' ? (chartUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80') : undefined,
      scheduledAt: scheduledAt || undefined,
      published: !scheduledAt || new Date(scheduledAt) <= new Date(),
      createdAt: new Date().toISOString()
    };

    addPost(newPost);

    return NextResponse.json({
      success: true,
      message: scheduledAt ? 'Post scheduled successfully!' : `Published directly to ${type === 'chart' ? 'Charts Section' : 'Videos Vault'}!`,
      post: newPost
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

