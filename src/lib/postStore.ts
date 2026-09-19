import { INITIAL_POSTS, PostItem } from '@/lib/store';
import { dbGetAllPosts, dbAddPost, dbDeletePost, dbPublishPostNow } from '@/lib/db';

declare global {
  var __TRADINGHATH_POSTS__: PostItem[] | undefined;
}

if (!global.__TRADINGHATH_POSTS__) {
  global.__TRADINGHATH_POSTS__ = [...INITIAL_POSTS];
}

export async function getAllPosts(): Promise<PostItem[]> {
  const now = new Date().toISOString();
  
  // 1. Fetch persisted posts from database (Redis)
  let dbPosts: PostItem[] = [];
  try {
    dbPosts = await dbGetAllPosts();
  } catch (e) {
    console.error('[postStore] dbGetAllPosts error:', e);
  }

  // 2. Combine with in-memory posts
  const memPosts = global.__TRADINGHATH_POSTS__ || [...INITIAL_POSTS];
  const combinedMap = new Map<string, PostItem>();

  // Ensure default curated charts exist as foundational entries
  INITIAL_POSTS.forEach(p => combinedMap.set(p.id, p));

  // Overlay memory posts
  memPosts.forEach(p => combinedMap.set(p.id, p));

  // Overlay database posts (takes highest precedence)
  dbPosts.forEach(p => combinedMap.set(p.id, p));

  const allPosts = Array.from(combinedMap.values());

  // Update schedule status
  return allPosts.map(p => {
    if (p.scheduledAt && p.scheduledAt <= now && !p.published) {
      return { ...p, published: true };
    }
    return p;
  });
}

export async function addNewPost(post: PostItem): Promise<void> {
  if (!global.__TRADINGHATH_POSTS__) global.__TRADINGHATH_POSTS__ = [...INITIAL_POSTS];
  global.__TRADINGHATH_POSTS__ = [post, ...global.__TRADINGHATH_POSTS__.filter(p => p.id !== post.id)];
  
  try {
    await dbAddPost(post);
  } catch (e) {
    console.error('[postStore] dbAddPost error:', e);
  }
}

export async function deletePost(postId: string): Promise<void> {
  if (global.__TRADINGHATH_POSTS__) {
    global.__TRADINGHATH_POSTS__ = global.__TRADINGHATH_POSTS__.filter(p => p.id !== postId);
  }
  try {
    await dbDeletePost(postId);
  } catch (e) {
    console.error('[postStore] dbDeletePost error:', e);
  }
}

export async function publishPostNow(postId: string): Promise<void> {
  if (global.__TRADINGHATH_POSTS__) {
    global.__TRADINGHATH_POSTS__ = global.__TRADINGHATH_POSTS__.map(p => {
      if (p.id === postId) {
        return { ...p, published: true, scheduledAt: undefined };
      }
      return p;
    });
  }
  try {
    await dbPublishPostNow(postId);
  } catch (e) {
    console.error('[postStore] dbPublishPostNow error:', e);
  }
}

export async function cancelScheduleAndKeepDraft(postId: string): Promise<void> {
  await deletePost(postId);
}

