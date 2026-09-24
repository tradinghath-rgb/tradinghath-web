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

  const DEFAULT_CHART = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80';

  const allPosts = Array.from(combinedMap.values());

  // Update schedule status and sanitize browser-only URLs
  return allPosts.map(p => {
    let updated = { ...p };

    // Fix scheduled posts that are now past due
    if (p.scheduledAt && p.scheduledAt <= now && !p.published) {
      updated.published = true;
    }

    // Sanitize: remove any indexeddb:// references — they are browser-local only and
    // meaningless/broken on other users' devices. Replace with the default stock chart.
    if (updated.chartUrl?.startsWith('indexeddb://')) {
      updated.chartUrl = DEFAULT_CHART;
      updated.downloadUrl = DEFAULT_CHART;
    }
    if (updated.downloadUrl?.startsWith('indexeddb://')) {
      updated.downloadUrl = DEFAULT_CHART;
    }

    return updated;
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
  // If post was from INITIAL_POSTS, ensure it is loaded into memory/db as published
  const basePost = INITIAL_POSTS.find(p => p.id === postId);

  if (global.__TRADINGHATH_POSTS__) {
    const exists = global.__TRADINGHATH_POSTS__.some(p => p.id === postId);
    if (!exists && basePost) {
      global.__TRADINGHATH_POSTS__.push({ ...basePost, published: true, scheduledAt: undefined });
    } else {
      global.__TRADINGHATH_POSTS__ = global.__TRADINGHATH_POSTS__.map(p => {
        if (p.id === postId) {
          return { ...p, published: true, scheduledAt: undefined };
        }
        return p;
      });
    }
  }

  try {
    const posts = await dbGetAllPosts();
    const existsInDb = posts.some(p => p.id === postId);
    if (!existsInDb && basePost) {
      await dbAddPost({ ...basePost, published: true, scheduledAt: undefined });
    } else {
      await dbPublishPostNow(postId);
    }
  } catch (e) {
    console.error('[postStore] dbPublishPostNow error:', e);
  }
}

export async function cancelScheduleAndKeepDraft(postId: string): Promise<void> {
  await deletePost(postId);
}

