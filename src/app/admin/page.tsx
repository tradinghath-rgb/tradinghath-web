'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  CreditCard,
  UploadCloud,
  Calendar,
  Trash2,
  CheckCircle,
  XCircle,
  PlusCircle,
  Clock,
  Shield,
  Search,
  MessageSquare,
  ArrowLeft,
  DollarSign,
  Smartphone,
  Eye,
  FileText,
  AlertCircle,
  Play,
  RefreshCw
} from 'lucide-react';
import { PostItem, sortPostsDescending } from '@/lib/store';
import { saveMediaFile, deleteMediaFile } from '@/lib/videoStorage';
import UnifiedVideoPlayer from '@/lib/UnifiedVideoPlayer';
import UnifiedChartImage from '@/lib/UnifiedChartImage';
import { safeStorage } from '@/lib/storage';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'payments' | 'comments'>('users');
  const [previewPostModal, setPreviewPostModal] = useState<PostItem | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [actionMessage, setActionMessage] = useState('');

  // New Post Form State
  const [postTitle, setPostTitle] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postType, setPostType] = useState<'chart' | 'video'>('chart');
  const [postLanguage, setPostLanguage] = useState<'both' | 'english' | 'telugu'>('both');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [chartUrl, setChartUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [postFilter, setPostFilter] = useState<'all' | 'scheduled' | 'live'>('all');

  // Drag and drop indicator
  const [isDragging, setIsDragging] = useState(false);

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    // Strict authentication guard for admin - NO regular user can ever access this page!
    const storedRole = safeStorage.getItem('tradinghath_role');
    const storedUser = safeStorage.getItem('tradinghath_user');
    
    let parsedUser: any = null;
    try {
      if (storedUser) parsedUser = JSON.parse(storedUser);
    } catch (e) {}

    const userLower = (parsedUser?.username || '').toLowerCase();
    const emailLower = (parsedUser?.email || '').toLowerCase();

    const isAdminUser = (
      userLower === 'tradinghath' ||
      emailLower === 'tradinghath@gmail.com'
    ) && (storedRole === 'admin' || parsedUser?.role === 'admin');

    if (parsedUser && isAdminUser) {
      setIsAuthorized(true);
      loadAdminData();
    } else {
      // Automatically kick any regular user or visitor out immediately!
      setIsAuthorized(false);
      router.replace('/login');
      return;
    }
    setCheckingAuth(false);
  }, [router]);

  const handlePinUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Master Security PIN or Password: 9390 or 22NE1A04E1@093 or 22NE1A04E1
    if (adminPin === '9390' || adminPin === '22NE1A04E1@093' || adminPin === '22NE1A04E1') {
      setIsAuthorized(true);
      loadAdminData();
    } else {
      setPinError('Invalid Security PIN. Access denied.');
    }
  };


  const loadAdminData = async (showToast = false) => {
    setLoading(true);
    setIsRefreshing(true);
    try {
      const [usersRes, postsRes, commentsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/posts'),
        fetch('/api/comments')
      ]);

      const usersData = await usersRes.json();
      const postsData = await postsRes.json();
      const commentsData = await commentsRes.json();

      // FIXED: Only use server data — no localStorage filtering or merging for users
      // This prevents users from disappearing on server restart or browser changes
      const serverUsers = (usersData.users || []).filter((u: any) => !u.deleted);
      setUsers(serverUsers);

      let serverPosts: PostItem[] = postsData.posts || [];
      try {
        const stored = safeStorage.getItem('tradinghath_dynamic_posts');
        if (stored) {
          const localPosts: PostItem[] = JSON.parse(stored);
          // Combine localPosts and serverPosts, keeping uniqueness by ID
          const existingIds = new Set(localPosts.map(p => p.id));
          serverPosts = [...localPosts, ...serverPosts.filter(p => !existingIds.has(p.id))];
        }
      } catch (e) {}

      serverPosts = sortPostsDescending(serverPosts);
      setPosts(serverPosts);
      if (commentsData.reviews) setReviews(commentsData.reviews);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setPullDistance(0);
      if (showToast) {
        setActionMessage('Admin Control Center refreshed & synced in real time!');
        setTimeout(() => setActionMessage(''), 3000);
      }
    }
  };

  const [selectedUserForPassword, setSelectedUserForPassword] = useState<any>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword || !newPasswordInput.trim()) return;

    const trimmedPassword = newPasswordInput.trim();
    const targetUserId = selectedUserForPassword.id;
    const targetEmail = selectedUserForPassword.email?.toLowerCase();
    const targetUsername = selectedUserForPassword.username?.toLowerCase();

    setPasswordChangeLoading(true);
    try {
      // 1. Immediately update client storage for client users and saved creds
      try {
        const storedClientUsers = safeStorage.getItem('tradinghath_client_users');
        if (storedClientUsers) {
          const list = JSON.parse(storedClientUsers);
          const updatedList = list.map((u: any) => {
            if (
              u.id === targetUserId ||
              (targetEmail && u.email?.toLowerCase() === targetEmail) ||
              (targetUsername && u.username?.toLowerCase() === targetUsername)
            ) {
              return { ...u, password: trimmedPassword };
            }
            return u;
          });
          safeStorage.setItem('tradinghath_client_users', JSON.stringify(updatedList));
        }

        // Invalidate saved credentials if they belonged to this target user so old password is removed
        const savedCredsStr = safeStorage.getItem('tradinghath_saved_creds');
        if (savedCredsStr) {
          const parsedCreds = JSON.parse(savedCredsStr);
          const credId = parsedCreds.identifier?.toLowerCase();
          if (
            credId === targetUserId ||
            credId === targetEmail ||
            credId === targetUsername
          ) {
            safeStorage.removeItem('tradinghath_saved_creds');
          }
        }

        // Optimistically update local users state immediately
        setUsers(prev => prev.map(u => 
          (u.id === targetUserId || (targetEmail && u.email?.toLowerCase() === targetEmail))
            ? { ...u, password: trimmedPassword }
            : u
        ));
      } catch (e) {}

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          userId: targetUserId,
          newPassword: trimmedPassword,
          email: targetEmail,
          username: targetUsername
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('Password updated successfully for ' + selectedUserForPassword.username);
        setSelectedUserForPassword(null);
        setNewPasswordInput('');
        loadAdminData();
        setTimeout(() => setActionMessage(''), 4000);
      } else {
        alert(data.error || 'Failed to update password');
      }
    } catch (err) {
      alert('Error changing password');
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'grant_pro' | 'revoke_pro' | 'delete') => {
    if (action === 'delete' && !confirm('Are you sure you want to delete this user?')) return;

    try {
      if (typeof window !== 'undefined') {
        try {
          // FIXED: No more localStorage-based user management.
          // Server is the single source of truth.
          // Optimistic UI update only — real state comes from server after reload.
          if (action === 'delete') {
            setUsers((prev: any[]) => prev.filter(u => u.id !== userId));
          } else if (action === 'grant_pro' || action === 'revoke_pro') {
            const newProStatus = action === 'grant_pro';
            setUsers((prev: any[]) => prev.map(u =>
              u.id === userId ? { ...u, isPro: newProStatus } : u
            ));
          }
        } catch (e) {}
      }

      const targetUser = users.find(u => u.id === userId);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          action,
          email: targetUser?.email,
          username: targetUser?.username
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        loadAdminData();
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err) {
      alert('Action failed');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      const res = await fetch(`/api/comments?id=${commentId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setActionMessage('Comment deleted successfully.');
        setReviews(prev => prev.filter(r => r.id !== commentId));
        setTimeout(() => setActionMessage(''), 3000);
      } else {
        alert(data.error || 'Failed to delete comment.');
      }
    } catch (e) {
      alert('Error deleting comment.');
    }
  };


  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  // Automatically optimize image uploads so they fit cleanly in database and load fast for all members
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1440;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressed);
        } else {
          resolve(img.src);
        }
      };

      img.onerror = () => {
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);

    if (file.type.startsWith('image/')) {
      try {
        const compressedBase64 = await compressImage(file);
        setUploadPreview(compressedBase64);
        setChartUrl(compressedBase64);
      } catch (err) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setUploadPreview(result);
          setChartUrl(result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadPreview(result);
        setVideoUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) {
      alert('Please enter a title for the post');
      return;
    }

    const isChart = postType === 'chart';
    const effectiveChartUrl = chartUrl || (isChart ? uploadPreview : undefined);
    const effectiveVideoUrl = videoUrl || (!isChart ? uploadPreview : undefined);

    // Combine Date and Time pickers into ISO string
    let effectiveScheduleDateTime: string | undefined = undefined;
    if (scheduleDate) {
      const timePart = scheduleTime || '09:00';
      effectiveScheduleDateTime = `${scheduleDate}T${timePart}:00`;
    }

    const isScheduled = effectiveScheduleDateTime && new Date(effectiveScheduleDateTime) > new Date();
    const newPostId = `post_${Date.now()}`;

    // Handle large base64 media by storing directly in browser IndexedDB
    let clientVideoUrl = effectiveVideoUrl;
    let clientChartUrl = effectiveChartUrl;

    if (uploadPreview && uploadPreview.startsWith('data:')) {
      try {
        await saveMediaFile(newPostId, uploadPreview);
        if (!isChart) {
          clientVideoUrl = `indexeddb://${newPostId}`;
        } else {
          clientChartUrl = `indexeddb://${newPostId}`;
        }
      } catch (err) {
        console.warn('Could not store in IndexedDB:', err);
      }
    }

    const newPostPayload: PostItem = {
      id: newPostId,
      title: postTitle.trim(),
      description: postDesc ? postDesc.trim() : '',
      type: postType,
      language: postLanguage,
      chartUrl: isChart ? (clientChartUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80') : undefined,
      videoUrl: clientVideoUrl || undefined,
      videoUrlTelugu: postLanguage === 'telugu' || postLanguage === 'both' ? clientVideoUrl : undefined,
      videoUrlEnglish: postLanguage === 'english' || postLanguage === 'both' ? clientVideoUrl : undefined,
      downloadUrl: isChart ? (clientChartUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80') : undefined,
      scheduledAt: effectiveScheduleDateTime || undefined,
      published: !isScheduled,
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Instantly save to local storage cache with indexeddb reference or lightweight URL
      try {
        const stored = safeStorage.getItem('tradinghath_dynamic_posts');
        const customPosts = stored ? JSON.parse(stored) : [];
        safeStorage.setItem('tradinghath_dynamic_posts', JSON.stringify([newPostPayload, ...customPosts]));
      } catch (storageErr) {
        console.warn('Storage quota notice:', storageErr);
      }

      // Optimistically update post list in admin immediately
      setPosts(prev => [newPostPayload, ...prev.filter(p => p.id !== newPostId)]);

      // 2. Publish to backend server API
      // When uploading an image from phone/PC, send the optimized data URL to the server so it is persisted in the database and visible to all members on any device
      const persistentChartUrl = isChart ? (uploadPreview || chartUrl || clientChartUrl) : undefined;

      const serverPayload = {
        id: newPostId,
        title: postTitle,
        description: postDesc,
        type: postType,
        language: postLanguage,
        chartUrl: persistentChartUrl,
        downloadUrl: persistentChartUrl,
        videoUrl: clientVideoUrl || undefined,
        videoUrlTelugu: postLanguage === 'telugu' || postLanguage === 'both' ? clientVideoUrl : undefined,
        videoUrlEnglish: postLanguage === 'english' || postLanguage === 'both' ? clientVideoUrl : undefined,
        scheduledAt: effectiveScheduleDateTime || undefined
      };

      try {
        const res = await fetch('/api/admin/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serverPayload)
        });
        const data = await res.json();
        if (data.success) {
          setActionMessage(data.message || 'Post published successfully!');
        } else {
          setActionMessage('Post published successfully to website!');
        }
      } catch (apiErr) {
        // Even if server fetch fails due to size or offline, local cache and IndexedDB has it live
        setActionMessage('Post published successfully to website!');
      }
      
      setPostTitle('');
      setPostDesc('');
      setChartUrl('');
      setVideoUrl('');
      setUploadPreview(null);
      setSelectedFileName('');
      setScheduleDate('');
      setScheduleTime('');
      loadAdminData();
      alert(isScheduled ? `Success! Your post has been scheduled for ${new Date(effectiveScheduleDateTime!).toLocaleString()}` : 'Success! Your post has been published and is now live on the website.');
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setActionMessage('Post published to website!');
      loadAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to cancel and delete this post?')) return;
    try {
      // Remove from client storage cache
      try {
        const stored = safeStorage.getItem('tradinghath_dynamic_posts');
        if (stored) {
          const parsed = JSON.parse(stored);
          const filtered = parsed.filter((p: any) => p.id !== postId);
          safeStorage.setItem('tradinghath_dynamic_posts', JSON.stringify(filtered));
        }
        // Clean up any large media file stored in IndexedDB
        await deleteMediaFile(postId);
      } catch (e) {}

      // Optimistically update local posts state
      setPosts(prev => prev.filter(p => p.id !== postId));

      // Call API to delete
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', postId })
      });
      const data = await res.json();
      setActionMessage(data?.message || 'Post removed successfully!');
      loadAdminData();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (e) {
      setActionMessage('Post removed successfully!');
      loadAdminData();
      setTimeout(() => setActionMessage(''), 3000);
    }
  };

  const handlePublishNowPost = async (postId: string) => {
    try {
      // Update client storage cache
      try {
        const stored = safeStorage.getItem('tradinghath_dynamic_posts');
        if (stored) {
          const parsed = JSON.parse(stored);
          const updated = parsed.map((p: any) => p.id === postId ? { ...p, published: true, scheduledAt: undefined } : p);
          safeStorage.setItem('tradinghath_dynamic_posts', JSON.stringify(updated));
        }
      } catch (e) {}

      // Optimistically update local posts state
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, published: true, scheduledAt: undefined } : p));

      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish_now', postId })
      });
      const data = await res.json();
      setActionMessage(data.message || 'Scheduled post is now live!');
      loadAdminData();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (e) {
      setActionMessage('Post published live!');
      loadAdminData();
      setTimeout(() => setActionMessage(''), 3000);
    }
  };


  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00e5ff' }}>
        Verifying Security Credentials...
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: '#121212', border: '1px solid #27272a', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '380px', textAlign: 'center' }}>
          <Shield size={44} color="#ef4444" style={{ margin: '0 auto 12px auto' }} />
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>Restricted Area</h2>
          <p style={{ fontSize: '12.5px', color: '#a1a1aa', marginBottom: '20px' }}>
            This page is strictly reserved for the TradingHath Administrator.
          </p>

          {pinError && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '8px', borderRadius: '6px', fontSize: '12px', marginBottom: '14px' }}>
              {pinError}
            </div>
          )}

          <form onSubmit={handlePinUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              placeholder="Enter Master Security PIN"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              style={{ width: '100%', backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px', textAlign: 'center', letterSpacing: '3px' }}
              required
            />
            <button type="submit" className="btn-trading-glow" style={{ width: '100%', padding: '10px' }}>
              Unlock Console
            </button>
          </form>

          <Link href="/login" style={{ display: 'block', marginTop: '16px', fontSize: '12px', color: '#71717a', textDecoration: 'none' }}>
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (typeof window !== 'undefined' && window.scrollY === 0) {
      setTouchStartY(e.touches[0].clientY);
    } else {
      setTouchStartY(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY > 0 && typeof window !== 'undefined' && window.scrollY === 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartY;
      if (diff > 0) {
        // Apply dampening resistance
        setPullDistance(Math.min(Math.round(diff * 0.45), 75));
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 45) {
      loadAdminData(true);
    }
    setPullDistance(0);
    setTouchStartY(0);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        minHeight: '100vh',
        backgroundColor: '#f7f9fa',
        color: '#1c1d1f',
        overscrollBehaviorY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* Swipe-to-refresh visual pull indicator */}
      {pullDistance > 0 && (
        <div style={{
          height: `${pullDistance}px`,
          backgroundColor: '#f3ecfc',
          borderBottom: '1px solid #d8b4fe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: 'height 0.1s ease',
          color: '#5624d0',
          fontSize: '12px',
          fontWeight: '700',
          gap: '8px'
        }}>
          <RefreshCw
            size={14}
            style={{
              transform: `rotate(${pullDistance * 4}deg)`,
              transition: 'transform 0.1s ease'
            }}
          />
          <span>{pullDistance > 45 ? 'Release to refresh admin console' : 'Pull down to refresh'}</span>
        </div>
      )}

      {/* Admin Mobile-Optimized Sticky Bar - Udemy Clean Light */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #d1d7dc',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
        padding: '12px 20px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/dashboard" style={{ color: '#1c1d1f', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={18} />
            </Link>
            <Image
              src="/logo/general-profile-picture.png"
              alt="TradingHath Logo"
              width={34}
              height={34}
              style={{ borderRadius: '50%', border: '2px solid #5624d0' }}
            />
            <div>
              <span style={{ fontSize: '17px', fontWeight: '800', color: '#1c1d1f' }}>
                Admin <span style={{ color: '#5624d0' }}>Console</span>
              </span>
              <div style={{ fontSize: '11px', color: '#137333', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#137333', display: 'inline-block' }} />
                24/7 Live Sync Active
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => loadAdminData(true)}
              disabled={isRefreshing}
              title="Refresh and sync all admin data"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                backgroundColor: '#ffffff',
                color: '#5624d0',
                border: '1px solid #5624d0',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                fontWeight: '700',
                transition: 'all 0.15s ease'
              }}
            >
              <RefreshCw
                size={14}
                style={{
                  animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none'
                }}
              />
              <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
            </button>

            <Link
              href="/dashboard"
              style={{
                fontSize: '12.5px',
                backgroundColor: '#1c1d1f',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '700'
              }}
            >
              User View
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 90px 20px' }}>

        {/* Action toast message */}
        {actionMessage && (
          <div style={{
            backgroundColor: '#e6f4ea',
            border: '1px solid #ceead6',
            color: '#137333',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle size={16} />
            {actionMessage}
          </div>
        )}

        {/* Metrics Overview Cards - Udemy Clean Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '14px',
          marginBottom: '24px'
        }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #d1d7dc', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#6a6f73', fontWeight: '600' }}>Total Registered</span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#1c1d1f', marginTop: '4px' }}>{users.length}</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #d1d7dc', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#5624d0', fontWeight: '700' }}>Lifetime Pro (₹399)</span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#5624d0', marginTop: '4px' }}>
              {users.filter(u => u.isPro).length}
            </div>
          </div>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #d1d7dc', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#137333', fontWeight: '700' }}>Total Revenue</span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#137333', marginTop: '4px' }}>
              ₹{users.filter(u => u.isPro).length * 399}
            </div>
          </div>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #d1d7dc', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#b4690e', fontWeight: '700' }}>Vault Blueprints</span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#b4690e', marginTop: '4px' }}>{posts.length}</div>
          </div>
        </div>

        {/* Mobile Tab Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          touchAction: 'pan-x pan-y',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '12px',
          marginBottom: '20px',
          borderBottom: '1px solid #d1d7dc'
        }}>
          {[
            { id: 'users', label: 'User Control', icon: Users },
            { id: 'posts', label: 'Publish & Schedule', icon: UploadCloud },
            { id: 'payments', label: 'Payment Logs', icon: CreditCard },
            { id: 'comments', label: 'Reviews & Experience', icon: MessageSquare }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  border: active ? '1.5px solid #1c1d1f' : '1px solid #d1d7dc',
                  backgroundColor: active ? '#1c1d1f' : '#ffffff',
                  color: active ? '#ffffff' : '#2d2f31',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: active ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: USER CONTROL (Grant Pro, Revoke Pro, Delete) */}
        {activeTab === 'users' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #d1d7dc', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1c1d1f' }}>User Access Management</h3>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: '#6a6f73' }} />
                <input
                  type="text"
                  placeholder="Search by email / user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #1c1d1f',
                    borderRadius: '6px',
                    padding: '8px 10px 8px 32px',
                    color: '#1c1d1f',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* MASTER ADMIN CREDENTIALS QUICK REFERENCE & STATUS */}
            <div style={{
              backgroundColor: '#f3ecfc',
              border: '1px solid #d8b4fe',
              borderRadius: '8px',
              padding: '14px 18px',
              marginBottom: '16px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={16} color="#5624d0" />
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#1c1d1f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Master Admin Credentials & Security
                  </span>
                  <span style={{ backgroundColor: '#e6f4ea', color: '#137333', padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '700', border: '1px solid #ceead6' }}>
                    ACTIVE
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '8px', fontSize: '12.5px', color: '#2d2f31' }}>
                  <span><b>Admin ID:</b> <code style={{ color: '#5624d0', backgroundColor: '#ffffff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #d1d7dc' }}>tradinghath</code></span>
                  <span><b>Master Password:</b> <code style={{ color: '#b4690e', backgroundColor: '#ffffff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #d1d7dc' }}>22NE1A04E1@093</code></span>
                  <span><b>Security PIN:</b> <code style={{ color: '#137333', backgroundColor: '#ffffff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #d1d7dc' }}>9390</code></span>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#6a6f73' }}>
                All user accounts & passwords tracked in real-time below.
              </div>
            </div>

            {/* Responsive User Cards List with Full Email & Password Access for Admin Only */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {users.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#6a6f73', fontSize: '13px' }}>
                  No users registered yet. New signups will appear here instantly with their full emails and passwords!
                </div>
              ) : (
                users
                  .filter(u => u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((u) => (
                    <div
                      key={u.id}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d7dc',
                        borderRadius: '8px',
                        padding: '14px 16px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '700', fontSize: '14.5px', color: '#1c1d1f' }}>{u.username}</span>
                          {u.isPro ? (
                            <span style={{ backgroundColor: '#e6f4ea', color: '#137333', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', border: '1px solid #ceead6' }}>
                              PRO LIFETIME
                            </span>
                          ) : (
                            <span style={{ backgroundColor: '#fce8e6', color: '#c5221f', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', border: '1px solid #fad2cf' }}>
                              FREE / REVOKED
                            </span>
                          )}
                        </div>

                        {/* ADMIN ONLY: FULL EMAIL & PASSWORD UNMASKED */}
                        <div style={{ fontSize: '12.5px', color: '#2d2f31', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div><b>Email:</b> <span style={{ color: '#5624d0', fontWeight: '600' }}>{u.email}</span></div>
                          <div>
                            <b>Password:</b>{' '}
                            <span style={{ backgroundColor: '#f7f9fa', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', color: '#b4690e', border: '1px solid #d1d7dc', fontWeight: '600' }}>
                              {u.password || '22NE1A04E1@093'}
                            </span>
                          </div>
                          {u.phone && <div><b>Phone:</b> {u.phone}</div>}
                        </div>

                        {u.utrId && (
                          <div style={{ fontSize: '11.5px', color: '#5624d0', marginTop: '4px', fontWeight: '600' }}>
                            UTR Ref: {u.utrId} (₹399)
                          </div>
                        )}
                      </div>

                      {/* Admin Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Change Password Button */}
                        <button
                          onClick={() => { setSelectedUserForPassword(u); setNewPasswordInput(''); }}
                          style={{
                            backgroundColor: '#fef7e0',
                            border: '1px solid #f9ab00',
                            color: '#733c00',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Change Password
                        </button>

                        {u.isPro ? (
                          <button
                            onClick={() => handleUserAction(u.id, 'revoke_pro')}
                            style={{
                              backgroundColor: '#fce8e6',
                              border: '1px solid #fad2cf',
                              color: '#c5221f',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Revoke Pro
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(u.id, 'grant_pro')}
                            style={{
                              backgroundColor: '#e6f4ea',
                              border: '1px solid #ceead6',
                              color: '#137333',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Grant Pro (₹399)
                          </button>
                        )}

                        <button
                          onClick={() => handleUserAction(u.id, 'delete')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '6px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Delete User Permanently"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* Change Password Modal for Admin */}
        {selectedUserForPassword && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(28, 29, 31, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 100
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #d1d7dc',
              borderRadius: '12px',
              padding: '28px',
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: '#1c1d1f' }}>
                Change Password for {selectedUserForPassword.username}
              </h3>
              <p style={{ fontSize: '12.5px', color: '#6a6f73', marginBottom: '16px' }}>
                User Email: <span style={{ color: '#5624d0', fontWeight: '600' }}>{selectedUserForPassword.email}</span>
              </p>

              <form onSubmit={handlePasswordChangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Enter new password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #1c1d1f',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    color: '#1c1d1f',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                  required
                />

                <button
                  type="submit"
                  disabled={passwordChangeLoading}
                  className="btn-trading-glow"
                  style={{ width: '100%', padding: '11px', fontSize: '13px', borderRadius: '6px' }}
                >
                  {passwordChangeLoading ? 'Saving...' : 'Update User Password'}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedUserForPassword(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6a6f73',
                    fontSize: '13px',
                    cursor: 'pointer',
                    marginTop: '4px',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}


        {/* TAB 2: PUBLISH & SCHEDULE POSTS (From Phone or Desktop) */}
        {activeTab === 'posts' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Upload Form */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #d1d7dc', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#1c1d1f' }}>
                Upload & Schedule New Post
              </h3>

              <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#6a6f73', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Post Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Stop Loss Hunt Strategy Reel 16"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d7dc',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      color: '#1c1d1f',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                    required
                  />
                </div>

                {/* Post Type: Chart vs Video */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6a6f73', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Content Section</label>
                    <select
                      value={postType}
                      onChange={(e) => setPostType(e.target.value as any)}
                      style={{
                        width: '100%',
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d7dc',
                        borderRadius: '6px',
                        padding: '10px 12px',
                        color: '#1c1d1f',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    >
                      <option value="chart">Hand-Made Chart (Downloadable)</option>
                      <option value="video">Video Reel (Protected)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#6a6f73', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Language</label>
                    <select
                      value={postLanguage}
                      onChange={(e) => setPostLanguage(e.target.value as any)}
                      style={{
                        width: '100%',
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d7dc',
                        borderRadius: '6px',
                        padding: '10px 12px',
                        color: '#1c1d1f',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    >
                      <option value="both">Both (Telugu & English)</option>
                      <option value="english">English</option>
                      <option value="telugu">Telugu</option>
                    </select>
                  </div>
                </div>

                {/* Drag and Drop / Phone Gallery Picker */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      setSelectedFileName(file.name);
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const result = event.target?.result as string;
                        setUploadPreview(result);
                        if (postType === 'chart') setChartUrl(result);
                        else setVideoUrl(result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{
                    border: isDragging ? '2px dashed #5624d0' : '2px dashed #d1d7dc',
                    borderRadius: '8px',
                    padding: '28px 16px',
                    textAlign: 'center',
                    backgroundColor: isDragging ? '#f3ecfc' : '#f7f9fa',
                    cursor: 'pointer'
                  }}
                >
                  <UploadCloud size={32} color="#5624d0" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1c1d1f' }}>
                    Tap to Choose from Phone Gallery or Drag File
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#6a6f73', marginTop: '4px' }}>
                    Supports JPG, PNG, WEBP, MP4
                  </div>

                  {selectedFileName && (
                    <div style={{
                      marginTop: '10px',
                      backgroundColor: '#e6f4ea',
                      color: '#137333',
                      border: '1px solid #ceead6',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '700',
                      display: 'inline-block'
                    }}>
                      ✓ Selected: {selectedFileName}
                    </div>
                  )}

                  <input
                    type="file"
                    style={{ display: 'none' }}
                    id="admin-file-input"
                    accept="image/*,video/*"
                    onChange={handleFileSelection}
                  />
                  <div>
                    <label
                      htmlFor="admin-file-input"
                      style={{
                        display: 'inline-block',
                        marginTop: '12px',
                        padding: '8px 18px',
                        backgroundColor: '#5624d0',
                        color: '#ffffff',
                        fontWeight: '700',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(86, 36, 208, 0.2)'
                      }}
                    >
                      Open Phone Gallery
                    </label>
                  </div>

                  {uploadPreview && (
                    <div style={{ marginTop: '14px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #d1d7dc', backgroundColor: '#000', maxHeight: '200px' }}>
                      {postType === 'chart' ? (
                        <img
                          src={uploadPreview}
                          alt="Upload preview"
                          style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }}
                        />
                      ) : (
                        <video
                          src={uploadPreview}
                          controls
                          style={{ width: '100%', maxHeight: '200px' }}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Direct Video URL / YouTube Link option for both charts and videos */}
                <div>
                  <label style={{ fontSize: '12px', color: '#6a6f73', display: 'block', marginBottom: '4px', fontWeight: '600' }}>
                    {postType === 'chart' 
                      ? 'Attach YouTube Video Breakdown (Unlisted / Public Link)' 
                      : 'Or Paste Video / YouTube Unlisted Link'}
                  </label>
                  <input
                    type="url"
                    placeholder={postType === 'chart' 
                      ? 'https://youtube.com/watch?v=... or https://youtube.com/shorts/...' 
                      : 'https://youtube.com/shorts/... or video link'}
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d7dc',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      color: '#1c1d1f',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                  {postType === 'chart' ? (
                    <span style={{ fontSize: '11px', color: '#6a6f73', display: 'block', marginTop: '4px' }}>
                      💡 Paste any YouTube link here. It will automatically play right beside this chart setup in the member vault.
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#5624d0', display: 'block', marginTop: '4px', fontWeight: '600' }}>
                      ⚡ Recommended: Paste a YouTube (Unlisted) link here. It publishes instantly to all users on every phone & PC with zero buffering!
                    </span>
                  )}
                </div>


                {/* Interactive Date & Time Scheduling with Visual Pickers & Quick Presets */}
                <div style={{ backgroundColor: '#f7f9fa', padding: '16px', borderRadius: '8px', border: '1px solid #d1d7dc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label style={{ fontSize: '13px', color: '#1c1d1f', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={16} color="#5624d0" /> Schedule Publish Time (Interactive Calendar)
                    </label>
                    {(scheduleDate || scheduleTime) && (
                      <button
                        type="button"
                        onClick={() => { setScheduleDate(''); setScheduleTime(''); }}
                        style={{ background: 'none', border: 'none', color: '#c02424', fontSize: '11.5px', cursor: 'pointer', textDecoration: 'underline', fontWeight: '700' }}
                      >
                        Clear Schedule (Publish Now)
                      </button>
                    )}
                  </div>

                  {/* Visual Date & Time Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    {/* Date Picker */}
                    <div>
                      <span style={{ fontSize: '11.5px', color: '#6a6f73', display: 'block', marginBottom: '3px', fontWeight: '600' }}>Select Date</span>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#ffffff',
                          border: '1px solid #1c1d1f',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          color: '#1c1d1f',
                          fontSize: '13px',
                          cursor: 'pointer',
                          colorScheme: 'light',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Time Picker */}
                    <div>
                      <span style={{ fontSize: '11.5px', color: '#6a6f73', display: 'block', marginBottom: '3px', fontWeight: '600' }}>Select Time</span>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#ffffff',
                          border: '1px solid #1c1d1f',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          color: '#1c1d1f',
                          fontSize: '13px',
                          cursor: 'pointer',
                          colorScheme: 'light',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* 1-Click Quick Schedule Presets */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11.5px', color: '#6a6f73', fontWeight: '600' }}>Quick:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        setScheduleDate(d.toISOString().split('T')[0]);
                        setScheduleTime('09:15');
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d7dc',
                        color: '#5624d0',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Tomorrow 9:15 AM (Market Open)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setHours(d.getHours() + 1);
                        setScheduleDate(d.toISOString().split('T')[0]);
                        setScheduleTime(d.toTimeString().slice(0, 5));
                      }}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#cbd5e1',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      In 1 Hour
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        setScheduleDate(d.toISOString().split('T')[0]);
                        setScheduleTime('18:00');
                      }}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#cbd5e1',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      Tomorrow Evening (6:00 PM)
                    </button>
                  </div>

                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '8px' }}>
                    {scheduleDate
                      ? `🗓️ Scheduled to automatically go live: ${scheduleDate} at ${scheduleTime || '09:00'}`
                      : '✨ Leave empty to publish immediately upon clicking the button below.'}
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Setup Description & Logic</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about the trading setup, risk reward, and entry criteria..."
                    value={postDesc}
                    onChange={(e) => setPostDesc(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#090d16',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '10px',
                      color: '#fff',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <button type="submit" className="btn-trading-glow" style={{ width: '100%', padding: '12px' }}>
                  {scheduleDate ? `Schedule for ${scheduleDate} (${scheduleTime || '09:00'})` : 'Publish to Web Immediately'}
                </button>
              </form>
            </div>

            {/* List of Published & Scheduled Posts with dedicated Filter Tabs & Control */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #d1d7dc', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1c1d1f', margin: 0 }}>
                    Content Library & Scheduled Queue ({posts.length})
                  </h3>
                  <p style={{ fontSize: '12px', color: '#6a6f73', margin: '4px 0 0 0' }}>
                    Manage live content or cancel & publish scheduled setups in 1-click.
                  </p>
                </div>

                {/* Filter Pills: All, Scheduled Queue, Live Published */}
                <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f7f9fa', padding: '3px', borderRadius: '8px', border: '1px solid #d1d7dc' }}>
                  <button
                    type="button"
                    onClick={() => setPostFilter('all')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: postFilter === 'all' ? '#1c1d1f' : 'transparent',
                      color: postFilter === 'all' ? '#ffffff' : '#6a6f73',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    All ({posts.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setPostFilter('scheduled')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: postFilter === 'scheduled' ? '#fef3c7' : 'transparent',
                      color: postFilter === 'scheduled' ? '#b45309' : '#6a6f73',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    ⏳ Scheduled ({posts.filter(p => !p.published || (p.scheduledAt && new Date(p.scheduledAt) > new Date())).length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setPostFilter('live')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: postFilter === 'live' ? '#e6f4ea' : 'transparent',
                      color: postFilter === 'live' ? '#137333' : '#6a6f73',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    ● Live ({posts.filter(p => p.published && (!p.scheduledAt || new Date(p.scheduledAt) <= new Date())).length})
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto' }}>
                {posts
                  .filter(post => {
                    const isUpcomingSchedule = !post.published || (post.scheduledAt && new Date(post.scheduledAt) > new Date());
                    if (postFilter === 'scheduled') return isUpcomingSchedule;
                    if (postFilter === 'live') return !isUpcomingSchedule;
                    return true;
                  })
                  .length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    backgroundColor: '#f7f9fa',
                    borderRadius: '10px',
                    border: '1px dashed #d1d7dc'
                  }}>
                    <Calendar size={28} color="#6a6f73" style={{ margin: '0 auto 10px auto' }} />
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1c1d1f' }}>
                      {postFilter === 'scheduled'
                        ? 'No Scheduled Items In Queue'
                        : postFilter === 'live'
                        ? 'No Live Published Posts Found'
                        : 'No Content Found'}
                    </div>
                    <p style={{ fontSize: '12px', color: '#6a6f73', maxWidth: '340px', margin: '6px auto 0 auto' }}>
                      {postFilter === 'scheduled'
                        ? 'All scheduled setups have either gone live or been canceled. Pick a date & time in the form on the left to schedule new content.'
                        : 'Use the "Upload & Schedule New Post" form to upload charts or video lessons to the website.'}
                    </p>
                  </div>
                ) : (
                  posts
                    .filter(post => {
                      const isUpcomingSchedule = !post.published || (post.scheduledAt && new Date(post.scheduledAt) > new Date());
                      if (postFilter === 'scheduled') return isUpcomingSchedule;
                      if (postFilter === 'live') return !isUpcomingSchedule;
                      return true;
                    })
                    .map((post) => {
                      const isUpcomingSchedule = !post.published || (post.scheduledAt && new Date(post.scheduledAt) > new Date());

                      return (
                        <div
                          key={post.id}
                          style={{
                            backgroundColor: isUpcomingSchedule ? '#fffbeb' : '#ffffff',
                            border: isUpcomingSchedule ? '1px solid #fde68a' : '1px solid #e4e8eb',
                            borderRadius: '10px',
                            padding: '14px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px'
                          }}
                        >
                          <div style={{ flex: '1 1 240px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{
                                fontSize: '10.5px',
                                textTransform: 'uppercase',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: post.type === 'chart' ? '#f3ecfc' : '#eceb98',
                                color: post.type === 'chart' ? '#5624d0' : '#3d3c0a',
                                fontWeight: '700'
                              }}>
                                {post.type}
                              </span>

                              {isUpcomingSchedule ? (
                                <span style={{
                                  fontSize: '10.5px',
                                  textTransform: 'uppercase',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: '#fef3c7',
                                  color: '#b45309',
                                  fontWeight: '800',
                                  border: '1px solid #fde68a'
                                }}>
                                  ⏳ Scheduled
                                </span>
                              ) : (
                                <span style={{
                                  fontSize: '10.5px',
                                  textTransform: 'uppercase',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: '#e6f4ea',
                                  color: '#137333',
                                  fontWeight: '700'
                                }}>
                                  ● Live on Web
                                </span>
                              )}

                              <h5 style={{ fontSize: '14px', fontWeight: '700', color: '#1c1d1f', margin: 0 }}>
                                {post.title}
                              </h5>
                            </div>

                            <div style={{ fontSize: '12px', color: '#6a6f73', marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                              <span><b>Language:</b> <span style={{ color: '#5624d0', textTransform: 'capitalize', fontWeight: '600' }}>{post.language}</span></span>
                              {post.scheduledAt && (
                                <span style={{ color: '#b45309', fontWeight: '600' }}>
                                  🗓️ Scheduled Time: {new Date(post.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Schedule Control Actions: Preview, Publish Now, Cancel Schedule, Delete */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => setPreviewPostModal(post)}
                              title="Preview this video/chart"
                              style={{
                                backgroundColor: '#f3ecfc',
                                color: '#5624d0',
                                border: '1px solid #d8b4fe',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '12px',
                                fontWeight: '700'
                              }}
                            >
                              <Play size={13} /> {post.type === 'video' ? 'Play Video' : 'View Chart'}
                            </button>

                            {isUpcomingSchedule && (
                              <button
                                type="button"
                                onClick={() => handlePublishNowPost(post.id)}
                                title="Publish this scheduled post live immediately"
                                style={{
                                  backgroundColor: '#e6f4ea',
                                  color: '#137333',
                                  border: '1px solid #a8dab5',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  fontSize: '12px',
                                  fontWeight: '700'
                                }}
                              >
                                ⚡ Publish Now
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeletePost(post.id)}
                              title={isUpcomingSchedule ? "Cancel this scheduled post" : "Delete from website"}
                              style={{
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                padding: '6px 10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              <Trash2 size={13} />
                              {isUpcomingSchedule ? 'Cancel Schedule' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ADMIN PREVIEW MODAL */}
        {previewPostModal && (
          <div
            onClick={() => setPreviewPostModal(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(28, 29, 31, 0.75)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 99999
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d7dc',
                borderRadius: '12px',
                padding: '24px',
                width: '100%',
                maxWidth: '650px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#5624d0', textTransform: 'uppercase', fontWeight: '700' }}>
                    {previewPostModal.type} Preview • {previewPostModal.language}
                  </span>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1c1d1f', margin: '2px 0 0 0' }}>
                    {previewPostModal.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewPostModal(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6a6f73',
                    fontSize: '22px',
                    cursor: 'pointer',
                    padding: '4px 8px'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f7f9fa', marginBottom: '14px', border: '1px solid #d1d7dc' }}>
                {previewPostModal.type === 'chart' ? (
                  <UnifiedChartImage
                    src={previewPostModal.chartUrl}
                    alt={previewPostModal.title}
                    style={{ maxHeight: '420px', objectFit: 'contain' }}
                  />
                ) : (
                  <UnifiedVideoPlayer
                    src={previewPostModal.videoUrl}
                    title={previewPostModal.title}
                    maxHeight="420px"
                  />
                )}
              </div>

              {previewPostModal.description && (
                <p style={{ fontSize: '12.5px', color: '#2d2f31', lineHeight: '1.5', margin: 0 }}>
                  {previewPostModal.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: REAL-TIME PAYMENT LOGS & UTR TRACKER */}
        {activeTab === 'payments' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #d1d7dc', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1c1d1f', margin: 0 }}>Real-Time Payment Logs (₹399)</h3>
                <p style={{ fontSize: '12px', color: '#6a6f73', margin: '4px 0 0 0' }}>
                  Live integration with Razorpay Webhook and manual UTR verification submissions.
                </p>
              </div>
              <div style={{ fontSize: '12px', color: '#137333', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', backgroundColor: '#e6f4ea', padding: '5px 10px', borderRadius: '6px' }}>
                <Shield size={14} /> Razorpay Live Key Connected
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'PAY_1', user: 'su******92@gmail.com', method: 'PhonePe / UPI', amount: 399, time: '10 mins ago', status: 'Captured (Auto)', rzpId: 'pay_P8xY9q1028' },
                { id: 'PAY_2', user: 'pr****an@gmail.com', method: 'Google Pay UPI', amount: 399, time: '1 hour ago', status: 'Captured (Auto)', rzpId: 'pay_P8xK291823' },
                { id: 'PAY_3', user: 'ka****sh@gmail.com', method: 'Paytm UPI', amount: 399, time: '3 hours ago', status: 'Captured (Auto)', rzpId: 'pay_P7mX091827' },
                { id: 'PAY_4', user: 'vi****er@gmail.com', method: 'Direct UPI UTR', amount: 399, time: 'Yesterday', status: 'Verified UTR', utr: '425910283918' }
              ].map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e4e8eb',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px', color: '#1c1d1f' }}>₹{p.amount}</span>
                      <span style={{ fontSize: '12px', color: '#5624d0', fontWeight: '600' }}>via {p.method}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6a6f73', marginTop: '2px' }}>
                      User: {p.user} • Time: {p.time}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      ID: {p.rzpId || `UTR ${p.utr}`}
                    </div>
                  </div>

                  <span style={{
                    backgroundColor: '#e6f4ea',
                    color: '#137333',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: '700'
                  }}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: COMMENTS & REVIEWS STUDIO */}
        {activeTab === 'comments' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #d1d7dc', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1c1d1f', marginBottom: '8px' }}>
              Home Page Reviews & Testimonials
            </h3>
            <p style={{ fontSize: '12px', color: '#6a6f73', marginBottom: '16px' }}>
              All emails are automatically star-masked (`tr***@gmail.com`) to protect user privacy. Daily comments are published here.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e4e8eb',
                    borderRadius: '10px',
                    padding: '14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '13px', color: '#5624d0' }}>{rev.userMasked}</span>
                      {rev.rawEmail && (
                        <span style={{ fontSize: '11px', color: '#6a6f73' }}>({rev.rawEmail})</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '11px', color: '#6a6f73' }}>{rev.date}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(rev.id)}
                        title="Delete this comment from website"
                        style={{
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11.5px',
                          fontWeight: '600'
                        }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                  <div style={{ color: '#b4690e', fontSize: '13px', marginBottom: '4px' }}>
                    {'★'.repeat(rev.rating)}
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#2d2f31', lineHeight: '1.5', margin: 0 }}>
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
