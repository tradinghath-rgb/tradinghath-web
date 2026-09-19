'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  ShieldCheck,
  Download,
  PlayCircle,
  Lock,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Mail,
  Smartphone,
  Star,
  Sparkles,
  Zap,
  AlertCircle,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { safeStorage } from '@/lib/storage';
import { INITIAL_REVIEWS, ReviewItem, PostItem, INITIAL_POSTS, isRecentlyAdded, sortPostsDescending, getRotatingReviews } from '@/lib/store';
import UnifiedChartImage from '@/lib/UnifiedChartImage';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function HomePage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewItem[]>(() => getRotatingReviews());
  const [newComment, setNewComment] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState('');
  const [commentError, setCommentError] = useState('');

  // Auth & Profile states
  const [user, setUser] = useState<any>(null);
  const [isPro, setIsPro] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Payment states
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showUtrModal, setShowUtrModal] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [utrEmail, setUtrEmail] = useState('');
  const [utrStatus, setUtrStatus] = useState('');
  const [termsModal, setTermsModal] = useState(false);
  const [vaultCharts, setVaultCharts] = useState<PostItem[]>([]);

  useEffect(() => {
    // Check if user is logged in
    try {
      const storedUser = safeStorage.getItem('tradinghath_user');
      const role = safeStorage.getItem('tradinghath_role');
      const proStatus = safeStorage.getItem('tradinghath_isPro');
      
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        const emailLower = (parsed?.email || '').toLowerCase();
        const userLower = (parsed?.username || '').toLowerCase();
        const isOwnerAdmin = (
          userLower === 'tradinghath' || 
          emailLower === 'tradinghath@gmail.com'
        );
        if (!isOwnerAdmin && role === 'admin') {
          safeStorage.setItem('tradinghath_role', 'user');
        }
        const adminCheck = isOwnerAdmin && (role === 'admin' || parsed?.role === 'admin');
        setIsAdmin(adminCheck);

        // Check pro status (admins always have pro)
        let pro = adminCheck || proStatus === 'true';
        const storedOverrides = safeStorage.getItem('tradinghath_pro_overrides');
        if (storedOverrides && !adminCheck) {
          const overrides = JSON.parse(storedOverrides);
          if (overrides[parsed.id] === false || (parsed.email && overrides[parsed.email.toLowerCase()] === false)) {
            pro = false;
          } else if (overrides[parsed.id] === true || (parsed.email && overrides[parsed.email.toLowerCase()] === true)) {
            pro = true;
          }
        }
        setIsPro(pro);

        // Real-time server status check for homepage
        if (!adminCheck) {
          fetch('/api/auth/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: parsed.id,
              email: parsed.email,
              username: parsed.username
            })
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                if (data.deleted) {
                  safeStorage.removeItem('tradinghath_user');
                  safeStorage.removeItem('tradinghath_role');
                  safeStorage.removeItem('tradinghath_isPro');
                  setUser(null);
                  setIsPro(false);
                } else {
                  const livePro = data.isPro === true;
                  setIsPro(livePro);
                  safeStorage.setItem('tradinghath_isPro', livePro ? 'true' : 'false');
                }
              }
            })
            .catch(() => {});
        }
      }
    } catch (e) {}

    fetch('/api/comments')
      .then(res => res.json())
      .then(data => {
        if (data.reviews) setReviews(data.reviews);
      })
      .catch(console.error);

    const DEFAULT_CHART = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80';

    // Sanitize a post's chartUrl — remove browser-local or broken references
    const sanitizePost = (p: PostItem): PostItem => {
      if (!p.chartUrl || p.chartUrl.startsWith('indexeddb://') || p.chartUrl.startsWith('data:image/')) {
        return { ...p, chartUrl: DEFAULT_CHART, downloadUrl: DEFAULT_CHART };
      }
      return p;
    };

    // Function to load and sync all live charts in descending order so new charts appear first on the homepage
    const loadCharts = () => {
      fetch('/api/admin/posts')
        .then(res => res.json())
        .then(data => {
          const apiPosts: PostItem[] = (data.posts || []).filter((p: PostItem) => p.published && p.type === 'chart');
          const postMap = new Map<string, PostItem>();

          // 1. Defaults as base
          INITIAL_POSTS.filter(p => p.type === 'chart').forEach(p => postMap.set(p.id, sanitizePost(p)));

          // 2. Local dynamic posts — sanitize broken URLs before merging
          try {
            const stored = safeStorage.getItem('tradinghath_dynamic_posts');
            if (stored) {
              const localPosts: PostItem[] = JSON.parse(stored);
              localPosts
                .filter(p => p.published && p.type === 'chart')
                .map(sanitizePost)
                .forEach(p => postMap.set(p.id, p));
            }
          } catch (e) {}

          // 3. API server posts (takes highest priority) — already sanitized server-side
          apiPosts.map(sanitizePost).forEach(p => postMap.set(p.id, p));

          const all = sortPostsDescending(Array.from(postMap.values()));

          if (all.length > 0) {
            setVaultCharts(all.slice(0, 6)); // Display top 6 newest charts on homepage
          }
        })
        .catch(() => {
          const postMap = new Map<string, PostItem>();
          INITIAL_POSTS.filter(p => p.type === 'chart').forEach(p => postMap.set(p.id, sanitizePost(p)));

          try {
            const stored = safeStorage.getItem('tradinghath_dynamic_posts');
            if (stored) {
              const localPosts: PostItem[] = JSON.parse(stored);
              localPosts
                .filter(p => p.published && p.type === 'chart')
                .map(sanitizePost)
                .forEach(p => postMap.set(p.id, p));
            }
          } catch (e) {}

          const fallback = sortPostsDescending(Array.from(postMap.values()));
          setVaultCharts(fallback.slice(0, 6));
        });
    };

    loadCharts();

    const chartsInterval = setInterval(loadCharts, 4000);
    const handleWindowFocus = () => loadCharts();
    window.addEventListener('focus', handleWindowFocus);

    // Rotate reviews every 12 hours while page is open
    const reviewsInterval = setInterval(() => {
      setReviews(getRotatingReviews());
    }, 12 * 60 * 60 * 1000);

    return () => {
      clearInterval(chartsInterval);
      clearInterval(reviewsInterval);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const handleLogout = () => {
    try {
      safeStorage.removeItem('tradinghath_user');
      safeStorage.removeItem('tradinghath_role');
      safeStorage.removeItem('tradinghath_isPro');
    } catch (e) {}
    setUser(null);
    setIsPro(false);
    setIsAdmin(false);
    window.location.reload();
  };

  const [alreadyPaidNotice, setAlreadyPaidNotice] = useState(false);

  // Razorpay Checkout Trigger (Direct UPI App link & Gateway)
  const DIRECT_PAYMENT_LINK = 'https://rzp.io/rzp/2a3h6cU';

  const scrollToPricing = () => {
    if (isPro || isAdmin) {
      router.push('/dashboard');
      return;
    }
    const el = document.getElementById('pricing-plan-panel');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a subtle highlight flash effect
      el.style.transition = 'box-shadow 0.3s ease';
      el.style.boxShadow = '0 0 30px rgba(0, 229, 255, 0.8), 0 20px 50px -10px rgba(0, 229, 255, 0.4)';
      setTimeout(() => {
        el.style.boxShadow = '0 20px 50px -10px rgba(0, 229, 255, 0.2)';
      }, 1500);
    }
  };

  const handleRazorpayPayment = async () => {
    // 1. If not logged in, require user to create account or log in first!
    if (!user) {
      alert('Please log in or create an account first so your lifetime access can be linked to your email.');
      router.push('/login');
      return;
    }

    // 2. If user is already pro or admin, don't ask to pay! Notify them payment is already done and route to vault.
    if (isPro || isAdmin) {
      setAlreadyPaidNotice(true);
      return;
    }

    // 3. Logged in user proceeding to payment
    // Opens PhonePe / GPay / Paytm on phones or Razorpay gateway
    try {
      window.open(DIRECT_PAYMENT_LINK, '_blank');
    } catch (e) {
      window.location.href = DIRECT_PAYMENT_LINK;
    }
  };


  // UTR ID Verification
  const handleUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrInput.trim()) return;

    setUtrStatus('Verifying UTR with Razorpay records...');
    try {
      const res = await fetch('/api/razorpay/utr-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utrId: utrInput.trim(),
          email: utrEmail.trim() || 'member@gmail.com'
        })
      });

      const data = await res.json();
      if (data.success) {
        if (data.isPro) {
          // Only if verified strictly by Razorpay
          safeStorage.setItem('tradinghath_isPro', 'true');
          safeStorage.setItem('tradinghath_utrId', utrInput.trim());
          setUtrStatus('Payment verified via Razorpay! Redirecting to vault...');
          setTimeout(() => {
            setShowUtrModal(false);
            router.push('/dashboard');
          }, 1500);
        } else {
          // Fake / unverified UTR: DO NOT GRANT ACCESS
          safeStorage.setItem('tradinghath_isPro', 'false');
          setUtrStatus('⚠️ Payment not found in Razorpay records. Your UTR has been sent to admin for manual review. Access will remain locked until verified.');
        }
      } else {
        setUtrStatus(data.error || 'Failed to verify UTR.');
      }
    } catch (err) {
      setUtrStatus('Submission failed. Please try again.');
    }
  };


  // User Comment Submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');
    setCommentSuccess('');

    // Check if user is logged in
    const activeEmail = (user?.email || commentEmail || '').trim().toLowerCase();
    if (!user && !activeEmail) {
      router.push('/login');
      return;
    }

    if (!newComment.trim()) {
      setCommentError('Please enter a comment.');
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: activeEmail,
          rating,
          comment: newComment.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setCommentSuccess('Thank you for sharing your experience! Your review is now live.');
        setReviews(prev => [data.review, ...prev.filter(r => r.id !== data.review?.id)]);
        setNewComment('');
        if (!user) setCommentEmail('');
        setTimeout(() => setCommentSuccess(''), 5000);
      } else {
        if (data.requireAuth) {
          setCommentError(data.error || 'Only registered members can comment.');
          setTimeout(() => {
            router.push('/login');
          }, 1500);
        } else {
          setCommentError(data.error || 'Failed to post comment. Please try again.');
        }
      }
    } catch (err: any) {
      setCommentError('Network error. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#1c1d1f' }}>
      {/* 24/7 Sticky Top Bar - Udemy Clean Light Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #d1d7dc',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
        padding: '12px 24px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <Image
              src="/logo/general-profile-picture.png"
              alt="TradingHath Logo"
              width={40}
              height={40}
              style={{ borderRadius: '50%', border: '2px solid #5624d0' }}
            />
            <div>
              <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px', color: '#1c1d1f' }}>
                Trading<span style={{ color: '#5624d0' }}>Hath</span>
              </span>
              <div style={{ fontSize: '11px', color: '#6a6f73', fontWeight: '500' }}>Smart Money & Price Action</div>
            </div>
          </Link>

          {/* Header Action: User Profile if logged in, or Sign In / Get Access if guest */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user ? (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Direct Vault Access Button */}
                <Link
                  href="/dashboard"
                  style={{
                    backgroundColor: '#5624d0',
                    border: '1px solid #5624d0',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(86, 36, 208, 0.25)'
                  }}
                >
                  <Sparkles size={14} /> Open Vault
                </Link>

                {/* Profile Pill & Dropdown Toggle */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d7dc',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      color: '#1c1d1f',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#5624d0',
                      color: '#ffffff',
                      fontSize: '11.5px',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {(user?.username || 'U')[0].toUpperCase()}
                    </div>
                    <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.username || 'Profile'}
                    </span>
                    <ChevronDown size={14} color="#6a6f73" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {showProfileDropdown && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: '115%',
                      width: '240px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d7dc',
                      borderRadius: '8px',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                      padding: '12px',
                      zIndex: 100
                    }}>
                      <div style={{ borderBottom: '1px solid #f0f2f5', paddingBottom: '10px', marginBottom: '10px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1c1d1f' }}>{user.username}</div>
                        <div style={{ fontSize: '11px', color: '#6a6f73', wordBreak: 'break-all' }}>{user.email}</div>
                        <div style={{ marginTop: '6px' }}>
                          {isPro ? (
                            <span style={{ backgroundColor: '#e6f4ea', color: '#137333', padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '700', border: '1px solid #ceead6' }}>
                              ✓ PRO LIFETIME
                            </span>
                          ) : (
                            <span style={{ backgroundColor: '#fce8e6', color: '#c5221f', padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '700', border: '1px solid #fad2cf' }}>
                              FREE / UNPAID
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <Link
                          href="/dashboard"
                          onClick={() => setShowProfileDropdown(false)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#f7f9fa',
                            color: '#5624d0',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Sparkles size={14} /> Go to Dashboard Vault
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setShowProfileDropdown(false)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#f7f9fa',
                              color: '#1c1d1f',
                              fontSize: '12.5px',
                              fontWeight: '600',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <ShieldCheck size={14} /> Admin Console
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#fce8e6',
                            color: '#c5221f',
                            border: 'none',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            textAlign: 'left'
                          }}
                        >
                          <LogOut size={14} /> Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Logout Icon Button */}
                <button
                  onClick={handleLogout}
                  title="Log Out"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d7dc',
                    borderRadius: '6px',
                    padding: '7px 10px',
                    color: '#c02424',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12.5px',
                    fontWeight: '600'
                  }}
                >
                  <LogOut size={15} />
                  <span style={{ display: 'inline-block' }}>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#1c1d1f',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    border: '1px solid #1c1d1f',
                    backgroundColor: '#ffffff'
                  }}
                >
                  Sign In
                </Link>

                <button
                  onClick={scrollToPricing}
                  className="btn-trading-glow"
                  style={{ fontSize: '13px', padding: '9px 18px' }}
                >
                  Get Access ₹399
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 16px 40px 16px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '20px',
          backgroundColor: '#f3ecfc',
          border: '1px solid #d8b4fe',
          color: '#5624d0',
          fontSize: '12.5px',
          fontWeight: '700',
          marginBottom: '20px'
        }}>
          <Sparkles size={14} /> 24/7 Live Web Platform • Instant Mobile Access
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 54px)',
          fontWeight: '800',
          letterSpacing: '-0.8px',
          lineHeight: '1.18',
          maxWidth: '860px',
          margin: '0 auto 20px auto',
          color: '#1c1d1f'
        }}>
          Stop Guessing Trades. Master <span style={{ color: '#5624d0' }}>Hand-Made Charts</span> & Step-by-Step Video Lessons.
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)',
          color: '#6a6f73',
          maxWidth: '680px',
          margin: '0 auto 36px auto',
          lineHeight: '1.6'
        }}>
          All charts in one section, detailed video explanations right beside them. Download blueprints to your phone anytime. Full Telugu & English commentary included.
        </p>

        {/* Pricing Card Section - Udemy Clean Course Package Style */}
        <div
          id="pricing-plan-panel"
          style={{
            maxWidth: '500px',
            margin: '0 auto 40px auto',
            backgroundColor: '#ffffff',
            border: '1px solid #d1d7dc',
            borderRadius: '12px',
            padding: '32px 28px',
            textAlign: 'left',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#5624d0', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Special Lifetime Deal
            </span>
            <span style={{ backgroundColor: '#eceb98', color: '#3d3c0a', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>
              Bestseller • Verified
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '40px', fontWeight: '800', color: '#1c1d1f' }}>₹399</span>
            <span style={{ fontSize: '16px', color: '#6a6f73', textDecoration: 'line-through' }}>₹2,999</span>
            <span style={{ fontSize: '13px', color: '#137333', fontWeight: '700' }}>87% off • Lifetime Access</span>
          </div>

          {/* Feature List */}
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', padding: 0 }}>
            {[
              'All Hand-Made Charts in dedicated section (Freely Downloadable)',
              'Side-by-Side Video Explanations for every chart pattern',
              'English & Telugu Video Reel Vault (23+ High-Winrate Lessons)',
              'Instant Mobile UPI Redirection (PhonePe, Google Pay, Paytm)',
              'Anti-Download Protection for Proprietary Videos',
              '24/7 Unrestricted Lifetime Access'
            ].map((text, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: '#2d2f31' }}>
                <CheckCircle2 size={18} color="#5624d0" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{text}</span>
              </li>
            ))}
          </ul>

          {/* Action Trigger */}
          {isPro || isAdmin ? (
            <button
              onClick={() => {
                setAlreadyPaidNotice(true);
              }}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                fontWeight: '700',
                backgroundColor: '#137333',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(19, 115, 51, 0.25)'
              }}
            >
              <CheckCircle2 size={18} color="#ffffff" />
              <span>Payment Already Done • Access Vault</span>
            </button>
          ) : !user ? (
            <button
              onClick={handleRazorpayPayment}
              className="btn-trading-glow"
              style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: '6px' }}
            >
              Sign In to Unlock Access (₹399)
            </button>
          ) : (
            <button
              onClick={handleRazorpayPayment}
              disabled={paymentLoading}
              className="btn-trading-glow"
              style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: '6px' }}
            >
              {paymentLoading ? 'Connecting Razorpay...' : 'Unlock Lifetime Access (₹399)'}
            </button>
          )}

          {/* Already Paid / Fill UTR ID Button */}
          {!isPro && !isAdmin && (
            <button
              onClick={() => setShowUtrModal(true)}
              style={{
                width: '100%',
                marginTop: '10px',
                backgroundColor: '#ffffff',
                border: '1px solid #1c1d1f',
                color: '#1c1d1f',
                padding: '11px',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: '700'
              }}
            >
              Already Paid? Enter 12-Digit UPI UTR ID
            </button>
          )}

          {/* Explicit No Refund Policy Warning */}
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#fef7e0',
            border: '1px solid #f9ab00',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11.5px',
            color: '#733c00'
          }}>
            <AlertCircle size={15} color="#b06000" style={{ flexShrink: 0 }} />
            <span>
              <b>Strict No Refund Policy:</b> Due to immediate access to intellectual hand-made blueprints and video files, all ₹399 payments are strictly non-refundable.
            </span>
          </div>
        </div>

        {/* Platform Core Highlights (Charts vs Videos) - Udemy Clean Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          textAlign: 'left',
          marginTop: '20px'
        }}>
          <div className="glass-card" style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid #d1d7dc', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: '#f3ecfc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Download size={22} color="#5624d0" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#1c1d1f' }}>
              Hand-Made Chart Section
            </h3>
            <p style={{ fontSize: '13px', color: '#6a6f73', lineHeight: '1.6' }}>
              All chart patterns are cataloged in an exclusive gallery. Users can freely download high-resolution copies directly to phones for live trading desk reference.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid #d1d7dc', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: '#f3ecfc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <PlayCircle size={22} color="#5624d0" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#1c1d1f' }}>
              Side-by-Side Video Explanations
            </h3>
            <p style={{ fontSize: '13px', color: '#6a6f73', lineHeight: '1.6' }}>
              Whenever a user clicks any chart, its exact matching video explanation appears immediately alongside it. Watch the setup in action without losing your chart view.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid #d1d7dc', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: '#e6f4ea', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <ShieldCheck size={22} color="#137333" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#1c1d1f' }}>
              Protected Video Streaming
            </h3>
            <p style={{ fontSize: '13px', color: '#6a6f73', lineHeight: '1.6' }}>
              Video downloads and picture-in-picture scraping are completely blocked with anti-download safeguards to maintain community exclusivity.
            </p>
          </div>
        </div>

        {/* LOCKED VAULT PREVIEW SECTION (Visible to visitors with Lock Badges) */}
        <div style={{ marginTop: '50px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#5624d0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Member Vault Previews
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: '#1c1d1f' }}>
                Hand-Made Charts & Videos
              </h2>
              <p style={{ fontSize: '13px', color: '#6a6f73', margin: '4px 0 0 0' }}>
                {isPro || isAdmin ? (
                  <span style={{ color: '#137333', fontWeight: '600' }}>
                    ✓ You have full Lifetime Access! Click any chart below to open directly in your Vault.
                  </span>
                ) : (
                  <>One-time ₹399 unlocks <b>ALL charts and ALL videos together</b>. No per-post charges.</>
                )}
              </p>
            </div>
            {isPro || isAdmin ? (
              <Link
                href="/dashboard"
                style={{
                  fontSize: '13px',
                  padding: '10px 20px',
                  textDecoration: 'none',
                  backgroundColor: '#137333',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(19, 115, 51, 0.2)'
                }}
              >
                <CheckCircle2 size={15} color="#ffffff" /> Payment Already Done • Open Vault
              </Link>
            ) : (
              <button
                onClick={scrollToPricing}
                className="btn-trading-glow"
                style={{ fontSize: '13px', padding: '10px 20px', borderRadius: '6px' }}
              >
                <Lock size={14} /> Unlock All Content Together (One-Time ₹399)
              </button>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {(vaultCharts.length > 0 ? vaultCharts : INITIAL_POSTS.filter(p => p.type === 'chart').slice(0, 6)).map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => {
                  if (isPro || isAdmin) {
                    router.push('/dashboard');
                  } else {
                    scrollToPricing();
                  }
                }}
                style={{
                  backgroundColor: '#ffffff',
                  border: isPro || isAdmin ? '1.5px solid #5624d0' : '1px solid #d1d7dc',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'box-shadow 0.15s ease',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                }}
              >
                {/* Visual Image */}
                <div style={{ position: 'relative', height: '170px', width: '100%', backgroundColor: '#f7f9fa', overflow: 'hidden' }}>
                  <UnifiedChartImage
                    src={item.chartUrl}
                    alt={item.title}
                    style={{
                      height: '170px',
                      objectFit: 'cover',
                      filter: isPro || isAdmin ? 'none' : 'blur(5px) grayscale(35%)'
                    }}
                  />
                  {/* Center Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: isPro || isAdmin ? 'rgba(19, 115, 51, 0.92)' : 'rgba(28, 29, 31, 0.85)',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    {isPro || isAdmin ? (
                      <>
                        <CheckCircle2 size={14} color="#ffffff" /> Unlocked • Ready to View
                      </>
                    ) : (
                      <>
                        <Lock size={14} /> Member Vault Setup
                      </>
                    )}
                  </div>

                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: isRecentlyAdded(item.createdAt, item.id) ? '#5624d0' : '#eceb98',
                    color: isRecentlyAdded(item.createdAt, item.id) ? '#ffffff' : '#3d3c0a',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '10.5px',
                    fontWeight: '800',
                    boxShadow: isRecentlyAdded(item.createdAt, item.id) ? '0 2px 4px rgba(86, 36, 208, 0.3)' : 'none'
                  }}>
                    {isRecentlyAdded(item.createdAt, item.id) ? '✨ Recently Added' : 'Bestseller'}
                  </div>
                </div>

                <div style={{ padding: '14px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1c1d1f', marginBottom: '4px', lineHeight: '1.3' }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '12.5px', color: '#6a6f73', lineHeight: '1.4', marginBottom: '12px' }}>
                    {item.description ? (item.description.length > 80 ? `${item.description.slice(0, 80)}...` : item.description) : 'Master institutional trap formula and execution criteria.'}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: isPro || isAdmin ? '#137333' : '#5624d0',
                    fontWeight: '700',
                    paddingTop: '6px',
                    borderTop: '1px solid #f0f2f5'
                  }}>
                    <span>{isPro || isAdmin ? 'Click to Open' : 'Hand-Made Chart + Video'}</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Community Comments & Star-Masked Reviews Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '50px 16px', borderTop: '1px solid #d1d7dc' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ fontSize: '11px', color: '#5624d0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Verified Community Feedback
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: '#1c1d1f' }}>
            What Traders Are Saying (Privacy Protected)
          </h2>
          <p style={{ fontSize: '13px', color: '#6a6f73', marginTop: '6px' }}>
            To safeguard member privacy, all emails are automatically masked (e.g. <code>tr*****th@gmail.com</code>).
          </p>
        </div>

        {/* Review Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '40px'
        }}>
          {reviews.map((rev) => (
            <div key={rev.id} style={{ padding: '18px', backgroundColor: '#ffffff', border: '1px solid #d1d7dc', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '13px', color: '#1c1d1f' }}>
                  {rev.userMasked}
                </span>
                <span style={{ fontSize: '11px', color: '#6a6f73' }}>{rev.date}</span>
              </div>
              <div style={{ display: 'flex', gap: '2px', color: '#b4690e', fontSize: '14px', marginBottom: '8px' }}>
                {'★'.repeat(rev.rating)}
              </div>
              <p style={{ fontSize: '12.5px', color: '#2d2f31', lineHeight: '1.5' }}>
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>

        {/* Share Experience Form */}
        <div style={{
          maxWidth: '560px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #d1d7dc',
          padding: '28px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px', color: '#1c1d1f' }}>
            Share Your Experience
          </h3>
          <p style={{ fontSize: '12.5px', color: '#6a6f73', marginBottom: '18px' }}>
            Your email is encrypted and starred. No personal credentials are ever exposed.
          </p>

          {commentError && (
            <div style={{ backgroundColor: '#fce8e6', border: '1px solid #fad2cf', color: '#c5221f', padding: '10px 14px', borderRadius: '6px', fontSize: '12.5px', marginBottom: '14px', fontWeight: '600' }}>
              {commentError}
            </div>
          )}

          {commentSuccess && (
            <div style={{ backgroundColor: '#e6f4ea', border: '1px solid #ceead6', color: '#137333', padding: '10px 14px', borderRadius: '6px', fontSize: '12.5px', marginBottom: '14px', fontWeight: '600' }}>
              {commentSuccess}
            </div>
          )}

          {!user ? (
            <div style={{
              backgroundColor: '#f7f9fa',
              border: '1px solid #d1d7dc',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '13px', color: '#2d2f31', marginBottom: '14px', lineHeight: '1.5' }}>
                Only registered members can post comments. Please sign up or log in with your Gmail to leave feedback!
              </p>
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="btn-trading-glow"
                style={{ padding: '9px 20px', fontSize: '13px', borderRadius: '6px' }}
              >
                Log In / Sign Up to Comment
              </button>
            </div>
          ) : (
            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: '#f7f9fa',
                borderRadius: '6px',
                border: '1px solid #d1d7dc',
                fontSize: '12.5px',
                color: '#6a6f73'
              }}>
                <span>Posting as: <b style={{ color: '#1c1d1f' }}>{user.email || user.username}</b></span>
                <span style={{ fontSize: '11px', color: '#137333', fontWeight: '600' }}>Privacy Masked</span>
              </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12.5px', color: '#6a6f73', fontWeight: '600' }}>Rating:</span>
              {[5, 4, 3, 2, 1].map(num => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setRating(num)}
                  style={{
                    backgroundColor: rating >= num ? '#b4690e' : '#f7f9fa',
                    color: rating >= num ? '#ffffff' : '#6a6f73',
                    border: rating >= num ? 'none' : '1px solid #d1d7dc',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  ★ {num}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              placeholder="Write your review or experience with our hand-made setups..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
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
              disabled={submittingComment}
              className="btn-trading-glow"
              style={{ padding: '10px 22px', alignSelf: 'flex-start', fontSize: '13px', borderRadius: '6px' }}
            >
              {submittingComment ? 'Posting...' : 'Post Verified Comment'}
            </button>
          </form>
        )}
      </div>
    </section>

      {/* Footer & Support Redirection - Udemy Clean Dark Slate Footer */}
      <footer style={{
        backgroundColor: '#1c1d1f',
        borderTop: '1px solid #3e4143',
        padding: '36px 20px',
        fontSize: '13px',
        color: '#94a3b8'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Image
                src="/logo/general-profile-picture.png"
                alt="Logo"
                width={24}
                height={24}
                style={{ borderRadius: '50%' }}
              />
              <span style={{ fontWeight: '700', color: '#ffffff' }}>TradingHath</span>
            </div>
            <p style={{ margin: 0 }}>© 2026 TradingHath. All rights reserved. 24/7 Uptime.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* Direct Support Gmail Redirection */}
            <a
              href="mailto:tradinghath@gmail.com?subject=TradingHath%20Query%20or%20Payment%20Assistance"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              <Mail size={16} /> Support: tradinghath@gmail.com
            </a>

            <button
              onClick={() => setTermsModal(true)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}
            >
              Terms & Conditions
            </button>
          </div>
        </div>
      </footer>
      {/* UTR Verification Modal */}
      {showUtrModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(28, 29, 31, 0.65)',
          backdropFilter: 'blur(4px)',
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
            maxWidth: '440px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ fontSize: '19px', fontWeight: '800', marginBottom: '6px', color: '#1c1d1f' }}>
              Verify UPI UTR ID (₹399)
            </h3>
            <p style={{ fontSize: '13px', color: '#6a6f73', marginBottom: '18px', lineHeight: '1.5' }}>
              If you paid via PhonePe, Google Pay, Paytm, or direct UPI, paste your 12-digit UTR reference ID below to activate instant access.
            </p>

            {utrStatus && (
              <div style={{
                backgroundColor: '#f3ecfc',
                border: '1px solid #d8b4fe',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                color: '#5624d0',
                marginBottom: '16px',
                fontWeight: '600'
              }}>
                {utrStatus}
              </div>
            )}

            <form onSubmit={handleUtrSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="12-digit UPI UTR / Reference ID"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #1c1d1f',
                  borderRadius: '6px',
                  padding: '12px',
                  color: '#1c1d1f',
                  fontSize: '13px',
                  outline: 'none'
                }}
                required
              />
              <input
                type="email"
                placeholder="Your Email for access activation"
                value={utrEmail}
                onChange={(e) => setUtrEmail(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d7dc',
                  borderRadius: '6px',
                  padding: '12px',
                  color: '#1c1d1f',
                  fontSize: '13px',
                  outline: 'none'
                }}
                required
              />

              <button type="submit" className="btn-trading-glow" style={{ width: '100%', padding: '12px', borderRadius: '6px' }}>
                Verify & Activate Access
              </button>

              <button
                type="button"
                onClick={() => { setShowUtrModal(false); setUtrStatus(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6a6f73',
                  fontSize: '13px',
                  cursor: 'pointer',
                  marginTop: '6px'
                }}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {termsModal && (
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
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ fontSize: '19px', fontWeight: '800', marginBottom: '12px', color: '#1c1d1f' }}>Terms & Conditions</h3>
            <div style={{ fontSize: '13px', color: '#6a6f73', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p>1. <b>Access:</b> Lifetime access grants unrestricted viewing of hand-made blueprints and video lessons 24/7 on Vercel hosted servers.</p>
              <p>2. <b>Downloads:</b> Charts can be downloaded for educational study. Video downloads and recording are strictly prohibited.</p>
              <p>3. <b>No Refund Policy:</b> Due to the instant delivery of proprietary digital materials, all sales of ₹399 are final and non-refundable.</p>
              <p>4. <b>Privacy:</b> No email addresses or passwords will be shared or publicly displayed to other users.</p>
              <p>5. <b>Support:</b> All queries are processed directly via <code>tradinghath@gmail.com</code>.</p>
            </div>
            <button
              onClick={() => setTermsModal(false)}
              className="btn-trading-glow"
              style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: '6px' }}
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      )}

      {/* Already Paid Notice Modal */}
      {alreadyPaidNotice && (
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
          zIndex: 110
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #d1d7dc',
            borderRadius: '12px',
            padding: '28px 24px',
            maxWidth: '440px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#e6f4ea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle2 size={32} color="#137333" />
            </div>

            <span style={{ fontSize: '11px', color: '#137333', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Lifetime Access Verified
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginTop: '6px', color: '#1c1d1f', marginBottom: '8px' }}>
              Already Payment Done!
            </h3>
            <p style={{ fontSize: '13px', color: '#6a6f73', lineHeight: '1.5', marginBottom: '22px' }}>
              {isAdmin ? (
                <>You are logged in as <b>Administrator</b>. You have full lifetime access to all 24 hand-made charts and Telugu & English video reels.</>
              ) : (
                <>Your account already has <b>active Lifetime Pro Access</b>! You do not need to pay ₹399 again. All 24 hand-made charts and Telugu & English video lessons are unlocked for you.</>
              )}
            </p>

            <button
              onClick={() => {
                setAlreadyPaidNotice(false);
                router.push('/dashboard');
              }}
              className="btn-trading-glow"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '14px',
                fontWeight: '800',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={16} /> Open Member Vault
            </button>

            <button
              onClick={() => setAlreadyPaidNotice(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#6a6f73',
                fontSize: '12.5px',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
