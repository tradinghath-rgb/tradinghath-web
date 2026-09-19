/**
 * db.ts — Persistent database layer using Upstash Redis
 *
 * Replaces all global.__TRADINGHATH_* in-memory stores.
 * Data survives server restarts, deployments, and scaling.
 *
 * Setup: Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local
 * Get free Redis at: https://console.upstash.com
 *
 * Falls back to in-memory Map if Redis is not configured (local dev without Redis).
 */

import { Redis } from '@upstash/redis';
import { PostItem } from '@/lib/store';

export interface UserRecord {
  id: string;
  username: string;
  email: string;
  password?: string;
  phone?: string;
  isPro: boolean;
  proGrantedAt?: string;
  createdAt: string;
  paymentId?: string;
  utrId?: string;
  amount: number;
  deleted?: boolean;
}

const KV_USERS_KEY = 'tradinghath:users';
const KV_UTR_KEY = 'tradinghath:utr_submissions';
const KV_COMMENTS_KEY = 'tradinghath:comments';
const KV_POSTS_KEY = 'tradinghath:posts';

// ---- In-memory fallback for local dev without Redis ----
const _mem: {
  users: UserRecord[];
  utr: UtrRecord[];
  comments: any[];
  posts: PostItem[];
} = { users: [], utr: [], comments: [], posts: [] };

function getRedis(): Redis | null {
  const rawUrl = process.env.UPSTASH_REDIS_REST_URL;
  const rawToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!rawUrl || !rawToken) return null;
  const url = rawUrl.trim().replace(/^["']|["']$/g, '');
  const token = rawToken.trim().replace(/^["']|["']$/g, '');
  return new Redis({ url, token });
}

// =========================================================
// USER OPERATIONS
// =========================================================

export async function dbGetAllUsers(): Promise<UserRecord[]> {
  const redis = getRedis();
  if (!redis) return _mem.users.filter(u => !u.deleted);
  try {
    const users = await redis.get<UserRecord[]>(KV_USERS_KEY);
    if (!users) return [];
    return users.filter(u => !u.deleted);
  } catch (e) {
    console.error('[DB] dbGetAllUsers error:', e);
    return [];
  }
}

export async function dbGetAllUsersRaw(): Promise<UserRecord[]> {
  const redis = getRedis();
  if (!redis) return [..._mem.users];
  try {
    return (await redis.get<UserRecord[]>(KV_USERS_KEY)) || [];
  } catch {
    return [];
  }
}

async function dbSaveAllUsers(users: UserRecord[]): Promise<void> {
  const redis = getRedis();
  if (!redis) { _mem.users = users; return; }
  await redis.set(KV_USERS_KEY, users);
}

export async function dbFindUserByEmail(email: string): Promise<UserRecord | null> {
  const users = await dbGetAllUsersRaw();
  return users.find(u =>
    u.email?.toLowerCase() === email.trim().toLowerCase() && !u.deleted
  ) || null;
}

export async function dbFindUserByCredentials(identifier: string, pass: string): Promise<UserRecord | null> {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = pass.trim();
  const users = await dbGetAllUsers();
  return users.find(u => {
    const matchId = u.username?.toLowerCase() === cleanId || u.email?.toLowerCase() === cleanId;
    if (!matchId) return false;
    return u.password === cleanPass;
  }) || null;
}

export async function dbRegisterUser(user: UserRecord): Promise<void> {
  const users = await dbGetAllUsersRaw();
  const filtered = users.filter(u =>
    u.username?.toLowerCase() !== user.username?.toLowerCase() &&
    u.email?.toLowerCase() !== user.email?.toLowerCase()
  );
  filtered.unshift(user);
  await dbSaveAllUsers(filtered);
}

export async function dbUpdateUserProStatus(userIdOrEmail: string, isPro: boolean): Promise<void> {
  const users = await dbGetAllUsersRaw();
  const cleanKey = userIdOrEmail.trim().toLowerCase();
  const updated = users.map(u => {
    const isTarget =
      u.id === userIdOrEmail ||
      u.email?.toLowerCase() === cleanKey ||
      u.username?.toLowerCase() === cleanKey;
    if (isTarget) {
      return { ...u, isPro, proGrantedAt: isPro ? new Date().toISOString() : undefined };
    }
    return u;
  });
  await dbSaveAllUsers(updated);
}

export async function dbChangeUserPassword(userIdOrEmail: string, newPass: string): Promise<void> {
  const users = await dbGetAllUsersRaw();
  const cleanKey = userIdOrEmail.trim().toLowerCase();
  const trimmedPass = newPass.trim();
  const updated = users.map(u => {
    const isTarget =
      u.id === userIdOrEmail ||
      u.email?.toLowerCase() === cleanKey ||
      u.username?.toLowerCase() === cleanKey;
    if (isTarget) return { ...u, password: trimmedPass };
    return u;
  });
  await dbSaveAllUsers(updated);
}

export async function dbSoftDeleteUser(userIdOrEmail: string): Promise<void> {
  const users = await dbGetAllUsersRaw();
  const cleanKey = userIdOrEmail.trim().toLowerCase();
  const updated = users.map(u => {
    const isTarget =
      u.id === userIdOrEmail ||
      u.email?.toLowerCase() === cleanKey ||
      u.username?.toLowerCase() === cleanKey;
    if (isTarget) return { ...u, deleted: true };
    return u;
  });
  await dbSaveAllUsers(updated);
}

// =========================================================
// UTR SUBMISSIONS
// =========================================================

export interface UtrRecord {
  id: string;
  email: string;
  utrNumber: string;
  paymentDate: string;
  paymentTime?: string;
  paymentMethod: string;
  amount: number;
  status: 'PENDING' | 'VERIFYING' | 'VERIFIED' | 'REJECTED' | 'DUPLICATE';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export async function dbGetAllUtr(): Promise<UtrRecord[]> {
  const redis = getRedis();
  if (!redis) return [..._mem.utr];
  try {
    return (await redis.get<UtrRecord[]>(KV_UTR_KEY)) || [];
  } catch {
    return [];
  }
}

async function dbSaveAllUtr(records: UtrRecord[]): Promise<void> {
  const redis = getRedis();
  if (!redis) { _mem.utr = records; return; }
  await redis.set(KV_UTR_KEY, records);
}

export async function dbSubmitUtr(record: UtrRecord): Promise<{ success: boolean; error?: string }> {
  const existing = await dbGetAllUtr();
  const duplicate = existing.find(
    r => r.utrNumber?.toLowerCase() === record.utrNumber?.toLowerCase()
  );
  if (duplicate) {
    return { success: false, error: 'This UTR / Transaction ID has already been submitted.' };
  }
  existing.unshift(record);
  await dbSaveAllUtr(existing);
  return { success: true };
}

export async function dbUpdateUtrStatus(
  utrId: string,
  status: UtrRecord['status'],
  adminNotes?: string
): Promise<void> {
  const records = await dbGetAllUtr();
  const updated = records.map(r => {
    if (r.id === utrId) {
      return { ...r, status, adminNotes: adminNotes || r.adminNotes, updatedAt: new Date().toISOString() };
    }
    return r;
  });
  await dbSaveAllUtr(updated);
}

// =========================================================
// COMMENTS / REVIEWS
// =========================================================

export interface CommentRecord {
  id: string;
  userMasked: string;
  rawEmail?: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  createdAt: string;
}

export async function dbGetAllComments(): Promise<CommentRecord[]> {
  const redis = getRedis();
  if (!redis) return [..._mem.comments];
  try {
    return (await redis.get<CommentRecord[]>(KV_COMMENTS_KEY)) || [];
  } catch {
    return [];
  }
}

async function dbSaveAllComments(comments: CommentRecord[]): Promise<void> {
  const redis = getRedis();
  if (!redis) { _mem.comments = comments; return; }
  await redis.set(KV_COMMENTS_KEY, comments);
}

export async function dbAddComment(comment: CommentRecord): Promise<void> {
  const comments = await dbGetAllComments();
  comments.unshift(comment);
  await dbSaveAllComments(comments);
}

export async function dbDeleteComment(commentId: string): Promise<void> {
  const comments = await dbGetAllComments();
  const filtered = comments.filter(c => c.id !== commentId);
  await dbSaveAllComments(filtered);
}

// =========================================================
// POSTS (CHARTS & VIDEOS)
// =========================================================

export async function dbGetAllPosts(): Promise<PostItem[]> {
  const redis = getRedis();
  if (!redis) return [..._mem.posts];
  try {
    return (await redis.get<PostItem[]>(KV_POSTS_KEY)) || [];
  } catch (e) {
    console.error('[DB] dbGetAllPosts error:', e);
    return [..._mem.posts];
  }
}

const DEFAULT_CHART_FALLBACK = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80';

export async function dbSaveAllPosts(posts: PostItem[]): Promise<void> {
  const redis = getRedis();
  _mem.posts = [...posts];
  if (!redis) return;
  try {
    // IMPORTANT: Strip raw base64 data URLs before saving to Redis.
    // A single base64 image can be 500KB+ which causes the entire posts array
    // to exceed Redis limits and silently fail — making posts disappear for all users.
    // The actual image should already be stored separately via /api/upload.
    const sanitized = posts.map(p => {
      const updated = { ...p };
      if (updated.chartUrl?.startsWith('data:image/')) {
        updated.chartUrl = DEFAULT_CHART_FALLBACK;
      }
      if (updated.downloadUrl?.startsWith('data:image/')) {
        updated.downloadUrl = DEFAULT_CHART_FALLBACK;
      }
      return updated;
    });
    await redis.set(KV_POSTS_KEY, sanitized);
  } catch (e) {
    console.error('[DB] dbSaveAllPosts error:', e);
  }
}

export async function dbAddPost(post: PostItem): Promise<void> {
  const posts = await dbGetAllPosts();
  const filtered = posts.filter(p => p.id !== post.id);
  const updated = [post, ...filtered];
  await dbSaveAllPosts(updated);
}

export async function dbDeletePost(postId: string): Promise<void> {
  const posts = await dbGetAllPosts();
  const filtered = posts.filter(p => p.id !== postId);
  await dbSaveAllPosts(filtered);
}

export async function dbPublishPostNow(postId: string): Promise<void> {
  const posts = await dbGetAllPosts();
  const updated = posts.map(p => {
    if (p.id === postId) {
      return { ...p, published: true, scheduledAt: undefined };
    }
    return p;
  });
  await dbSaveAllPosts(updated);
}

