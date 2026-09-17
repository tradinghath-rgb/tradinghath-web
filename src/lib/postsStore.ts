import { INITIAL_POSTS, PostItem } from './store';

declare global {
  var __TRADINGHATH_POSTS__: PostItem[] | undefined;
}

if (!global.__TRADINGHATH_POSTS__) {
  global.__TRADINGHATH_POSTS__ = [...INITIAL_POSTS];
}

export function getAllPosts(): PostItem[] {
  const now = new Date().toISOString();
  if (!global.__TRADINGHATH_POSTS__) {
    global.__TRADINGHATH_POSTS__ = [...INITIAL_POSTS];
  }
  return global.__TRADINGHATH_POSTS__.map(p => {
    if (p.scheduledAt && p.scheduledAt <= now && !p.published) {
      return { ...p, published: true };
    }
    return p;
  });
}

export function addPost(post: PostItem): PostItem {
  if (!global.__TRADINGHATH_POSTS__) {
    global.__TRADINGHATH_POSTS__ = [...INITIAL_POSTS];
  }
  global.__TRADINGHATH_POSTS__.unshift(post);
  return post;
}

export function deletePost(postId: string): boolean {
  if (!global.__TRADINGHATH_POSTS__) return false;
  const initialLen = global.__TRADINGHATH_POSTS__.length;
  global.__TRADINGHATH_POSTS__ = global.__TRADINGHATH_POSTS__.filter(p => p.id !== postId);
  return global.__TRADINGHATH_POSTS__.length < initialLen;
}
