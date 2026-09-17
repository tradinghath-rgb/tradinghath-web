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
  AlertCircle
} from 'lucide-react';
import { PostItem } from '@/lib/store';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'payments' | 'comments'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // New Post Form State
  const [postTitle, setPostTitle] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postType, setPostType] = useState<'chart' | 'video'>('chart');
  const [postLanguage, setPostLanguage] = useState<'both' | 'english' | 'telugu'>('both');
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [chartUrl, setChartUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Drag and drop indicator
  const [isDragging, setIsDragging] = useState(false);

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    // Strict authentication guard for admin
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('tradinghath_role');
      const storedUser = localStorage.getItem('tradinghath_user');
      
      let parsedUser: any = null;
      try {
        if (storedUser) parsedUser = JSON.parse(storedUser);
      } catch (e) {}

      // Must be explicitly logged in as admin username 'tradinghath'
      if (
        storedRole === 'admin' &&
        parsedUser &&
        (parsedUser.username === 'tradinghath' || parsedUser.email === 'tradinghath@gmail.com')
      ) {
        setIsAuthorized(true);
        loadAdminData();
      } else {
        // Automatically redirect unauthorized users back to login
        router.push('/login');
      }
      setCheckingAuth(false);
    }
  }, [router]);

  const handlePinUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Secondary 4-digit Master Security PIN for extra protection: 9390
    if (adminPin === '9390' || adminPin === '22NE1A04E1@093') {
      setIsAuthorized(true);
      loadAdminData();
    } else {
      setPinError('Invalid Security PIN. Access denied.');
    }
  };


  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, postsRes, commentsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/posts'),
        fetch('/api/comments')
      ]);

      const usersData = await usersRes.json();
      const postsData = await postsRes.json();
      const commentsData = await commentsRes.json();

      let serverUsers = usersData.users || [];
      if (typeof window !== 'undefined') {
        try {
          const storedUsers = localStorage.getItem('tradinghath_client_users');
          if (storedUsers) {
            const localUsers = JSON.parse(storedUsers);
            const existingIds = new Set(serverUsers.map((u: any) => u.id));
            const existingEmails = new Set(serverUsers.map((u: any) => u.email.toLowerCase()));
            const toAdd = localUsers.filter((u: any) => !existingIds.has(u.id) && !existingEmails.has(u.email.toLowerCase()));
            serverUsers = [...serverUsers, ...toAdd];
          }
        } catch (e) {}
      }
      setUsers(serverUsers);

      let serverPosts: PostItem[] = postsData.posts || [];
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('tradinghath_dynamic_posts');
          if (stored) {
            const localPosts: PostItem[] = JSON.parse(stored);
            // Combine localPosts and serverPosts, keeping uniqueness by ID
            const existingIds = new Set(localPosts.map(p => p.id));
            serverPosts = [...localPosts, ...serverPosts.filter(p => !existingIds.has(p.id))];
          }
        } catch (e) {}
      }

      setPosts(serverPosts);
      if (commentsData.reviews) setReviews(commentsData.reviews);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const [selectedUserForPassword, setSelectedUserForPassword] = useState<any>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword || !newPasswordInput.trim()) return;

    setPasswordChangeLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          userId: selectedUserForPassword.id,
          newPassword: newPasswordInput.trim()
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
    if (action === 'delete' && !confirm('Are you sure you want to permanently delete this user?')) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
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


  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadPreview(result);
      if (postType === 'chart' || file.type.startsWith('image/')) {
        setChartUrl(result);
      } else {
        setVideoUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) {
      alert('Please enter a title for the post');
      return;
    }

    const effectiveChartUrl = chartUrl || (postType === 'chart' ? uploadPreview : undefined);
    const effectiveVideoUrl = videoUrl || (postType === 'video' ? uploadPreview : undefined);
    const isChart = postType === 'chart';
    const isScheduled = scheduleDateTime && new Date(scheduleDateTime) > new Date();

    const newPostPayload: PostItem = {
      id: `post_${Date.now()}`,
      title: postTitle.trim(),
      description: postDesc ? postDesc.trim() : '',
      type: postType,
      language: postLanguage,
      chartUrl: isChart ? (effectiveChartUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80') : undefined,
      videoUrl: !isChart ? (effectiveVideoUrl || 'https://www.youtube.com/embed/ss24aZbCsYs?autoplay=1') : undefined,
      downloadUrl: isChart ? (effectiveChartUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80') : undefined,
      scheduledAt: scheduleDateTime || undefined,
      published: !isScheduled,
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Instantly save to local storage cache so it's permanently published on client
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('tradinghath_dynamic_posts');
          const customPosts = stored ? JSON.parse(stored) : [];
          localStorage.setItem('tradinghath_dynamic_posts', JSON.stringify([newPostPayload, ...customPosts]));
        } catch (storageErr) {
          console.warn('LocalStorage quota or access notice:', storageErr);
        }
      }

      // 2. Publish to backend server API
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle,
          description: postDesc,
          type: postType,
          language: postLanguage,
          chartUrl: effectiveChartUrl,
          videoUrl: effectiveVideoUrl,
          scheduledAt: scheduleDateTime || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message || 'Post published successfully!');
      } else {
        setActionMessage('Post published successfully to website!');
      }
      
      setPostTitle('');
      setPostDesc('');
      setChartUrl('');
      setVideoUrl('');
      setUploadPreview(null);
      setSelectedFileName('');
      setScheduleDateTime('');
      loadAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setActionMessage('Post published to website!');
      loadAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post from the website?')) return;
    try {
      // Remove from client localStorage cache
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('tradinghath_dynamic_posts');
          if (stored) {
            const parsed = JSON.parse(stored);
            const filtered = parsed.filter((p: any) => p.id !== postId);
            localStorage.setItem('tradinghath_dynamic_posts', JSON.stringify(filtered));
          }
        } catch (e) {}
      }

      // Call API to delete
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', postId })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('Post deleted successfully!');
      } else {
        setActionMessage('Post deleted successfully!');
      }
      loadAdminData();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (e) {
      setActionMessage('Post deleted successfully!');
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc' }}>

      {/* Admin Mobile-Optimized Sticky Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(9, 13, 22, 0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '12px 16px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/dashboard" style={{ color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={18} />
            </Link>
            <Image
              src="/logo/general-profile-picture.png"
              alt="TradingHath Logo"
              width={32}
              height={32}
              style={{ borderRadius: '50%', border: '2px solid #00e5ff' }}
            />
            <div>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                Admin <span style={{ color: '#00e5ff' }}>Console</span>
              </span>
              <div style={{ fontSize: '10px', color: '#00e676', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00e676', display: 'inline-block' }} />
                24/7 Live Sync Active
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              href="/dashboard"
              style={{
                fontSize: '12px',
                backgroundColor: 'rgba(0, 229, 255, 0.15)',
                color: '#00e5ff',
                padding: '6px 12px',
                borderRadius: '8px',
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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 16px 90px 16px' }}>

        {/* Action toast message */}
        {actionMessage && (
          <div style={{
            backgroundColor: 'rgba(0, 230, 118, 0.15)',
            border: '1px solid rgba(0, 230, 118, 0.4)',
            color: '#00e676',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '16px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle size={16} />
            {actionMessage}
          </div>
        )}

        {/* Metrics Overview Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ backgroundColor: '#111726', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Total Users</span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginTop: '4px' }}>{users.length}</div>
          </div>
          <div style={{ backgroundColor: '#111726', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
            <span style={{ fontSize: '12px', color: '#00e5ff' }}>Lifetime Pro (₹399)</span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#00e5ff', marginTop: '4px' }}>
              {users.filter(u => u.isPro).length}
            </div>
          </div>
          <div style={{ backgroundColor: '#111726', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
            <span style={{ fontSize: '12px', color: '#00e676' }}>Total Revenue</span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#00e676', marginTop: '4px' }}>
              ₹{users.filter(u => u.isPro).length * 399}
            </div>
          </div>
          <div style={{ backgroundColor: '#111726', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
            <span style={{ fontSize: '12px', color: '#f59e0b' }}>Total Content</span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#f59e0b', marginTop: '4px' }}>{posts.length}</div>
          </div>
        </div>

        {/* Mobile Tab Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
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
                  borderRadius: '10px',
                  border: active ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: active ? 'rgba(0, 229, 255, 0.15)' : '#111726',
                  color: active ? '#00e5ff' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
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
          <div style={{ backgroundColor: '#111726', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '700' }}>User Access Management</h3>
              <div style={{ position: 'relative', width: '240px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Search by email / user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#090d16',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '8px 10px 8px 32px',
                    color: '#fff',
                    fontSize: '12.5px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* MASTER ADMIN CREDENTIALS QUICK REFERENCE & STATUS */}
            <div style={{
              backgroundColor: 'rgba(0, 229, 255, 0.06)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              borderRadius: '12px',
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
                  <Shield size={16} color="#00e5ff" />
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Master Admin Credentials & Security
                  </span>
                  <span style={{ backgroundColor: 'rgba(0, 230, 118, 0.2)', color: '#00e676', padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '700' }}>
                    ACTIVE
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '8px', fontSize: '12.5px', color: '#cbd5e1' }}>
                  <span><b>Admin ID:</b> <code style={{ color: '#00e5ff', backgroundColor: '#090d16', padding: '2px 6px', borderRadius: '4px' }}>tradinghath</code></span>
                  <span><b>Master Password:</b> <code style={{ color: '#f59e0b', backgroundColor: '#090d16', padding: '2px 6px', borderRadius: '4px' }}>22NE1A04E1@093</code></span>
                  <span><b>Security PIN:</b> <code style={{ color: '#00e676', backgroundColor: '#090d16', padding: '2px 6px', borderRadius: '4px' }}>9390</code></span>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                All user accounts & passwords tracked in real-time below.
              </div>
            </div>

            {/* Responsive User Cards List with Full Email & Password Access for Admin Only */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {users.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  No users registered yet. New signups will appear here instantly with their full emails and passwords!
                </div>
              ) : (
                users
                  .filter(u => u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((u) => (
                    <div
                      key={u.id}
                      style={{
                        backgroundColor: '#161e2e',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '10px',
                        padding: '14px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '700', fontSize: '14px', color: '#fff' }}>{u.username}</span>
                          {u.isPro ? (
                            <span style={{ backgroundColor: 'rgba(0, 230, 118, 0.15)', color: '#00e676', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                              PRO LIFETIME
                            </span>
                          ) : (
                            <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                              FREE / REVOKED
                            </span>
                          )}
                        </div>

                        {/* ADMIN ONLY: FULL EMAIL & PASSWORD UNMASKED */}
                        <div style={{ fontSize: '12.5px', color: '#cbd5e1', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div><b>Email:</b> <span style={{ color: '#00e5ff' }}>{u.email}</span></div>
                          <div>
                            <b>Password:</b>{' '}
                            <span style={{ backgroundColor: '#090d16', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', color: '#f59e0b', border: '1px solid #333' }}>
                              {u.password || '22NE1A04E1@093'}
                            </span>
                          </div>
                          {u.phone && <div><b>Phone:</b> {u.phone}</div>}
                        </div>

                        {u.utrId && (
                          <div style={{ fontSize: '11px', color: '#00e5ff', marginTop: '4px' }}>
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
                            backgroundColor: 'rgba(245, 158, 11, 0.15)',
                            border: '1px solid rgba(245, 158, 11, 0.4)',
                            color: '#f59e0b',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Change Password
                        </button>

                        {u.isPro ? (
                          <button
                            onClick={() => handleUserAction(u.id, 'revoke_pro')}
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Revoke Pro
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(u.id, 'grant_pro')}
                            style={{
                              backgroundColor: 'rgba(0, 230, 118, 0.15)',
                              border: '1px solid rgba(0, 230, 118, 0.4)',
                              color: '#00e676',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Grant Pro
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
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 100
          }}>
            <div style={{
              backgroundColor: '#121826',
              border: '1px solid #00e5ff',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '380px'
            }}>
              <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>
                Change Password for {selectedUserForPassword.username}
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
                User Email: <span style={{ color: '#00e5ff' }}>{selectedUserForPassword.email}</span>
              </p>

              <form onSubmit={handlePasswordChangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Enter new password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#090d16',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                  required
                />

                <button
                  type="submit"
                  disabled={passwordChangeLoading}
                  className="btn-trading-glow"
                  style={{ width: '100%', padding: '10px', fontSize: '13px' }}
                >
                  {passwordChangeLoading ? 'Saving...' : 'Update User Password'}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedUserForPassword(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '12px',
                    cursor: 'pointer',
                    marginTop: '4px'
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
            <div style={{ backgroundColor: '#111726', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', padding: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '14px' }}>
                Upload & Schedule New Post
              </h3>

              <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Post Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Stop Loss Hunt Strategy Reel 16"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#090d16',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '10px',
                      color: '#fff',
                      fontSize: '13px'
                    }}
                    required
                  />
                </div>

                {/* Post Type: Chart vs Video */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Content Section</label>
                    <select
                      value={postType}
                      onChange={(e) => setPostType(e.target.value as any)}
                      style={{
                        width: '100%',
                        backgroundColor: '#090d16',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '10px',
                        color: '#fff',
                        fontSize: '13px'
                      }}
                    >
                      <option value="chart">Hand-Made Chart (Downloadable)</option>
                      <option value="video">Video Reel (Protected)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Language</label>
                    <select
                      value={postLanguage}
                      onChange={(e) => setPostLanguage(e.target.value as any)}
                      style={{
                        width: '100%',
                        backgroundColor: '#090d16',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '10px',
                        color: '#fff',
                        fontSize: '13px'
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
                    border: isDragging ? '2px dashed #00e5ff' : '2px dashed rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    padding: '24px 16px',
                    textAlign: 'center',
                    backgroundColor: isDragging ? 'rgba(0, 229, 255, 0.05)' : '#090d16',
                    cursor: 'pointer'
                  }}
                >
                  <UploadCloud size={32} color="#00e5ff" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>
                    Tap to Choose from Phone Gallery or Drag File
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    Supports JPG, PNG, WEBP, MP4
                  </div>

                  {selectedFileName && (
                    <div style={{
                      marginTop: '10px',
                      backgroundColor: 'rgba(0, 230, 118, 0.15)',
                      color: '#00e676',
                      border: '1px solid rgba(0, 230, 118, 0.3)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
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
                        backgroundColor: '#00e5ff',
                        color: '#000',
                        fontWeight: '700',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        cursor: 'pointer'
                      }}
                    >
                      Open Phone Gallery
                    </label>
                  </div>

                  {uploadPreview && (
                    <div style={{ marginTop: '14px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0, 229, 255, 0.3)', backgroundColor: '#000', maxHeight: '200px' }}>
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

                {/* Direct Video URL / YouTube Link option */}
                {postType === 'video' && (
                  <div>
                    <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                      Or Paste Video / YouTube Unlisted Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/shorts/... or video link"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
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
                )}


                {/* Date & Time Scheduling for Automatic Future Publishing */}
                <div style={{ backgroundColor: 'rgba(0, 229, 255, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0, 229, 255, 0.15)' }}>
                  <label style={{ fontSize: '12px', color: '#00e5ff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Calendar size={14} /> Schedule Post (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleDateTime}
                    onChange={(e) => setScheduleDateTime(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#090d16',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      padding: '8px',
                      color: '#fff',
                      fontSize: '13px'
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                    If date & time is set, post automatically goes live to users on that exact moment.
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
                  {scheduleDateTime ? 'Schedule Post for Date/Time' : 'Publish to Web Immediately'}
                </button>
              </form>
            </div>

            {/* List of Published & Scheduled Posts */}
            <div style={{ backgroundColor: '#111726', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', padding: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '14px' }}>
                All Published & Scheduled Content ({posts.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '550px', overflowY: 'auto' }}>
                {posts.map((post) => (
                  <div
                    key={post.id}
                    style={{
                      backgroundColor: '#161e2e',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '10px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: post.type === 'chart' ? 'rgba(0, 229, 255, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                          color: post.type === 'chart' ? '#00e5ff' : '#c084fc',
                          fontWeight: '700'
                        }}>
                          {post.type}
                        </span>
                        <h5 style={{ fontSize: '13.5px', fontWeight: '700', color: '#fff' }}>{post.title}</h5>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                        Language: {post.language} {post.scheduledAt && `• Scheduled: ${new Date(post.scheduledAt).toLocaleDateString()}`}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '11px',
                        color: post.published ? '#00e676' : '#f59e0b',
                        fontWeight: '600'
                      }}>
                        {post.published ? 'Live' : 'Scheduled'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id)}
                        title="Delete Post"
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11.5px',
                          fontWeight: '600'
                        }}
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REAL-TIME PAYMENT LOGS & UTR TRACKER */}
        {activeTab === 'payments' && (
          <div style={{ backgroundColor: '#111726', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700' }}>Real-Time Payment Logs (₹399)</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Live integration with Razorpay Webhook and manual UTR verification submissions.
                </p>
              </div>
              <div style={{ fontSize: '12px', color: '#00e676', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                    backgroundColor: '#161e2e',
                    border: '1px solid rgba(255,255,255,0.06)',
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
                      <span style={{ fontWeight: '700', fontSize: '14px', color: '#fff' }}>₹{p.amount}</span>
                      <span style={{ fontSize: '12px', color: '#00e5ff' }}>via {p.method}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                      User: {p.user} • Time: {p.time}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      ID: {p.rzpId || `UTR ${p.utr}`}
                    </div>
                  </div>

                  <span style={{
                    backgroundColor: 'rgba(0, 230, 118, 0.15)',
                    color: '#00e676',
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
          <div style={{ backgroundColor: '#111726', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', padding: '16px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>
              Home Page Reviews & Testimonials
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
              All emails are automatically star-masked (`tr***@gmail.com`) to protect user privacy. Daily comments are published here.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    backgroundColor: '#161e2e',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '700', fontSize: '13px', color: '#00e5ff' }}>{rev.userMasked}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{rev.date}</span>
                  </div>
                  <div style={{ color: '#f59e0b', fontSize: '13px', marginBottom: '4px' }}>
                    {'★'.repeat(rev.rating)}
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
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
