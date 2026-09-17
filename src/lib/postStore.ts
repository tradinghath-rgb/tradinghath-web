import { INITIAL_POSTS, PostItem } from '@/lib/store';

declare global {
  var __TRADINGHATH_POSTS__: PostItem[] | undefined;
}

if (!global.__TRADINGHATH_POSTS__) {
  global.__TRADINGHATH_POSTS__ = [...INITIAL_POSTS];
}

export function getAllPosts(): PostItem[] {
  const now = new Date().toISOString();
  if (!global.__TRADINGHATH_POSTS__) global.__TRADINGHATH_POSTS__ = [...INITIAL_POSTS];

  return global.__TRADINGHATH_POSTS__.map(p => {
    if (p.scheduledAt && p.scheduledAt <= now && !p.published) {
      return { ...p, published: true };
    }
    return p;
  });
}

export function addNewPost(post: PostItem) {
  if (!global.__TRADINGHATH_POSTS__) global.__TRADINGHATH_POSTS__ = [...INITIAL_POSTS];
  global.__TRADINGHATH_POSTS__.unshift(post);
}

export function deletePost(postId: string) {
  if (!global.__TRADINGHATH_POSTS__) return;
  global.__TRADINGHATH_POSTS__ = global.__TRADINGHATH_POSTS__.filter(p => p.id !== postId);
}

export function publishPostNow(postId: string) {
  if (!global.__TRADINGHATH_POSTS__) return;
  global.__TRADINGHATH_POSTS__ = global.__TRADINGHATH_POSTS__.map(p => {
    if (p.id === postId) {
      return { ...p, published: true, scheduledAt: undefined };
    }
    return p;
  });
}

export function cancelScheduleAndKeepDraft(postId: string) {
  if (!global.__TRADINGHATH_POSTS__) return;
  global.__TRADINGHATH_POSTS__ = global.__TRADINGHATH_POSTS__.filter(p => p.id !== postId);
}
