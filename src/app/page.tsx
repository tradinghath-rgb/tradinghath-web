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
import { INITIAL_REVIEWS, ReviewItem } from '@/lib/store';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function HomePage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [newComment, setNewComment] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState('');

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

  useEffect(() => {
    // Check if user is logged in
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('tradinghath_user');
        const role = localStorage.getItem('tradinghath_role');
        const proStatus = localStorage.getItem('tradinghath_isPro');
        
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          const emailLower = (parsed?.email || '').toLowerCase();
          const userLower = (parsed?.username || '').toLowerCase();
          const isOwnerAdmin = (
            userLower === 'tradinghath' || 
            emailLower === 'tradinghath@gmail.com' ||
            emailLower === 'abhisheknaidu2005@gmail.com' ||
            userLower === 'abhisheknaidu'
          );
          const adminCheck = isOwnerAdmin && (role === 'admin' || parsed?.role === 'admin');
          setIsAdmin(adminCheck);

          // Check pro status (admins always have pro)
          let pro = adminCheck || proStatus === 'true';
          const storedOverrides = localStorage.getItem('tradinghath_pro_overrides');
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
                    localStorage.removeItem('tradinghath_user');
                    localStorage.removeItem('tradinghath_role');
                    localStorage.removeItem('tradinghath_isPro');
                    setUser(null);
                    setIsPro(false);
                  } else {
                    const livePro = data.isPro === true;
                    setIsPro(livePro);
                    localStorage.setItem('tradinghath_isPro', livePro ? 'true' : 'false');
                  }
                }
              })
              .catch(() => {});
          }
        }
      } catch (e) {}
    }

    fetch('/api/comments')
      .then(res => res.json())
      .then(data => {
        if (data.reviews) setReviews(data.reviews);
      })
      .catch(console.error);
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tradinghath_user');
      localStorage.removeItem('tradinghath_role');
      localStorage.removeItem('tradinghath_isPro');
      setUser(null);
      setIsPro(false);
      setIsAdmin(false);
      window.location.reload();
    }
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
          localStorage.setItem('tradinghath_isPro', 'true');
          localStorage.setItem('tradinghath_utrId', utrInput.trim());
          setUtrStatus('Payment verified via Razorpay! Redirecting to vault...');
          setTimeout(() => {
            setShowUtrModal(false);
            router.push('/dashboard');
          }, 1500);
        } else {
          // Fake / unverified UTR: DO NOT GRANT ACCESS
          localStorage.setItem('tradinghath_isPro', 'false');
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
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: commentEmail || 'trader@gmail.com',
          rating,
          comment: newComment
        })
      });
      const data = await res.json();
      if (data.success) {
        setCommentSuccess('Your review is live! Email is masked to protect your privacy.');
        setReviews(prev => [data.review, ...prev]);
        setNewComment('');
        setCommentEmail('');
        setTimeout(() => setCommentSuccess(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc' }}>
      {/* 24/7 Sticky Top Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '14px 20px'
      }}>
        <div style={{
          maxWidth: '1200px',
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
              style={{ borderRadius: '50%', border: '2px solid #00e5ff' }}
            />
            <div>
              <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff' }}>
                Trading<span style={{ color: '#00e5ff' }}>Hath</span>
              </span>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Smart Money & Price Action</div>
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
                    backgroundColor: 'rgba(0, 229, 255, 0.15)',
                    border: '1px solid #00e5ff',
                    color: '#00e5ff',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={14} /> Open Vault
                </Link>

                {/* Profile Pill & Dropdown Toggle */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    style={{
                      backgroundColor: '#111726',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '24px',
                      padding: '6px 12px',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px'
                    }}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: '#00e5ff',
                      color: '#000',
                      fontSize: '11px',
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
                    <ChevronDown size={14} color="#94a3b8" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {showProfileDropdown && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: '115%',
                      width: '240px',
                      backgroundColor: '#111726',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
                      padding: '12px',
                      zIndex: 100
                    }}>
                      <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px', marginBottom: '10px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{user.username}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', wordBreak: 'break-all' }}>{user.email}</div>
                        <div style={{ marginTop: '6px' }}>
                          {isPro ? (
                            <span style={{ backgroundColor: 'rgba(0, 230, 118, 0.15)', color: '#00e676', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>
                              ✓ PRO LIFETIME
                            </span>
                          ) : (
                            <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>
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
                            backgroundColor: 'rgba(0, 229, 255, 0.08)',
                            color: '#00e5ff',
                            fontSize: '12px',
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
                              backgroundColor: 'rgba(225, 29, 72, 0.15)',
                              color: '#fb7185',
                              fontSize: '12px',
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
                            backgroundColor: 'rgba(239, 68, 68, 0.12)',
                            color: '#ef4444',
                            border: 'none',
                            fontSize: '12px',
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
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '8px',
                    padding: '7px 9px',
                    color: '#ef4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
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
                    fontWeight: '600',
                    color: '#cbd5e1',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  Sign In
                </Link>

                <button
                  onClick={scrollToPricing}
                  className="btn-trading-glow"
                  style={{ fontSize: '13px', padding: '8px 16px' }}
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
          borderRadius: '30px',
          backgroundColor: 'rgba(0, 229, 255, 0.1)',
          border: '1px solid rgba(0, 229, 255, 0.25)',
          color: '#00e5ff',
          fontSize: '12.5px',
          fontWeight: '700',
          marginBottom: '20px'
        }}>
          <Sparkles size={14} /> 24/7 Live Web Platform • Instant Mobile Access
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: '800',
          letterSpacing: '-1px',
          lineHeight: '1.15',
          maxWidth: '860px',
          margin: '0 auto 20px auto',
          color: '#ffffff'
        }}>
          Stop Guessing Trades. Master <span style={{ color: '#00e5ff' }}>Hand-Made Charts</span> & Step-by-Step Video Lessons.
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)',
          color: '#94a3b8',
          maxWidth: '680px',
          margin: '0 auto 32px auto',
          lineHeight: '1.6'
        }}>
          All charts in one section, detailed video explanations right beside them. Download blueprints to your phone anytime. Full Telugu & English commentary included.
        </p>

        {/* Pricing Card Section */}
        <div
          id="pricing-plan-panel"
          style={{
            maxWidth: '480px',
            margin: '0 auto 40px auto',
            backgroundColor: '#111726',
            border: '2px solid #00e5ff',
            borderRadius: '20px',
            padding: '30px 24px',
            textAlign: 'left',
            boxShadow: '0 20px 50px -10px rgba(0, 229, 255, 0.2)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Special Lifetime Deal
            </span>
            <span style={{ backgroundColor: 'rgba(0, 230, 118, 0.15)', color: '#00e676', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
              100% Verified Access
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '42px', fontWeight: '800', color: '#ffffff' }}>₹399</span>
            <span style={{ fontSize: '16px', color: '#64748b', textDecoration: 'line-through' }}>₹2,999</span>
            <span style={{ fontSize: '13px', color: '#00e676', fontWeight: '700' }}>Lifetime Access</span>
          </div>

          {/* Feature List */}
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {[
              'All Hand-Made Charts in dedicated section (Freely Downloadable)',
              'Side-by-Side Video Explanations for every chart pattern',
              'English & Telugu Video Reel Vault (23+ High-Winrate Lessons)',
              'Instant Mobile UPI Redirection (PhonePe, Google Pay, Paytm)',
              'Anti-Download Protection for Proprietary Videos',
              '24/7 Unrestricted Lifetime Access'
            ].map((text, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: '#cbd5e1' }}>
                <CheckCircle2 size={18} color="#00e5ff" style={{ flexShrink: 0, marginTop: '2px' }} />
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
                backgroundColor: '#06281e',
                border: '2px solid #00e676',
                borderRadius: '12px',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0, 230, 118, 0.25)'
              }}
            >
              <CheckCircle2 size={18} color="#00e676" />
              <span>Payment Already Done • Access Vault</span>
            </button>
          ) : !user ? (
            <button
              onClick={handleRazorpayPayment}
              className="btn-trading-glow"
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            >
              Sign In to Unlock Access (₹399)
            </button>
          ) : (
            <button
              onClick={handleRazorpayPayment}
              disabled={paymentLoading}
              className="btn-trading-glow"
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
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
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#94a3b8',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '12.5px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Already Paid? Enter 12-Digit UPI UTR ID
            </button>
          )}

          {/* Explicit No Refund Policy Warning */}
          <div style={{
            marginTop: '16px',
            padding: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11.5px',
            color: '#f87171'
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>
              <b>Strict No Refund Policy:</b> Due to immediate access to intellectual hand-made blueprints and video files, all ₹399 payments are strictly non-refundable.
            </span>
          </div>
        </div>

        {/* Platform Core Highlights (Charts vs Videos) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          textAlign: 'left',
          marginTop: '20px'
        }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(0, 229, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Download size={22} color="#00e5ff" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>
              Hand-Made Chart Section
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
              All chart patterns are cataloged in an exclusive gallery. Users can freely download high-resolution copies directly to phones for live trading desk reference.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(56, 117, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <PlayCircle size={22} color="#3875f6" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>
              Side-by-Side Video Explanations
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
              Whenever a user clicks any chart, its exact matching video explanation appears immediately alongside it. Watch the setup in action without losing your chart view.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(0, 230, 118, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <ShieldCheck size={22} color="#00e676" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>
              Protected Video Streaming
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
              Video downloads and picture-in-picture scraping are completely blocked with anti-download safeguards to maintain community exclusivity.
            </p>
          </div>
        </div>

        {/* LOCKED VAULT PREVIEW SECTION (Visible to visitors with Lock Badges) */}
        <div style={{ marginTop: '50px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#00e5ff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Member Vault Previews
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: '#fff' }}>
                Hand-Made Charts & Videos
              </h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                {isPro || isAdmin ? (
                  <span style={{ color: '#00e676', fontWeight: '600' }}>
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
                  backgroundColor: '#06281e',
                  border: '1.5px solid #00e676',
                  borderRadius: '30px',
                  color: '#ffffff',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(0, 230, 118, 0.2)'
                }}
              >
                <CheckCircle2 size={15} color="#00e676" /> Payment Already Done • Open Vault
              </Link>
            ) : (
              <button
                onClick={scrollToPricing}
                className="btn-trading-glow"
                style={{ fontSize: '13px', padding: '10px 20px' }}
              >
                <Lock size={14} /> Unlock All Content Together (One-Time ₹399)
              </button>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '18px'
          }}>
            {[
              {
                title: 'Why FVG Fails (Reel 15)',
                desc: 'Avoid retail trap fair value gaps that get violated instantly.',
                image: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=80',
                type: 'Hand-Made Chart + Video'
              },
              {
                title: 'Stop Loss Trap (Reel 16)',
                desc: 'How institutional market makers trigger retail stop loss clusters before explosive moves.',
                image: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&auto=format&fit=crop&q=80',
                type: 'Hand-Made Chart + Video'
              },
              {
                title: 'LQT Setup Strategy (Reel 24)',
                desc: 'High probability Liquidity Sweep & Smart Money Setup with risk-reward ratio 1:3+.',
                image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
                type: 'Hand-Made Chart + Video'
              },
              {
                title: 'Head & Shoulders Anatomy (Reel 18)',
                desc: 'True breakout confirmation vs false neckline breaches.',
                image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80',
                type: 'Hand-Made Chart + Video'
              },
              {
                title: 'Break of Structure BOS & CHOCH (Reel 11)',
                desc: 'Market trend shift detection rule book with volume footprint.',
                image: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=800&auto=format&fit=crop&q=80',
                type: 'Hand-Made Chart + Video'
              },
              {
                title: 'Volume Secret Formula (Reel 1)',
                desc: 'Institutional volume anomalies & fake breakout strategy.',
                image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
                type: 'Hand-Made Chart + Video'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (isPro || isAdmin) {
                    router.push('/dashboard');
                  } else {
                    scrollToPricing();
                  }
                }}
                style={{
                  backgroundColor: '#111726',
                  border: isPro || isAdmin ? '1px solid rgba(0, 229, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                {/* Visual Image */}
                <div style={{ position: 'relative', height: '170px', width: '100%', backgroundColor: '#000' }}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    style={{
                      objectFit: 'cover',
                      filter: isPro || isAdmin ? 'brightness(0.95)' : 'blur(3px) brightness(0.7)'
                    }}
                  />
                  {/* Center Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.82)',
                    backdropFilter: 'blur(8px)',
                    border: isPro || isAdmin ? '1px solid rgba(0, 230, 118, 0.5)' : '1px solid rgba(0, 229, 255, 0.4)',
                    borderRadius: '30px',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: isPro || isAdmin ? '#00e676' : '#00e5ff',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    {isPro || isAdmin ? (
                      <>
                        <CheckCircle2 size={14} color="#00e676" /> Unlocked • Ready to View
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
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '10.5px',
                    color: '#fff',
                    fontWeight: '600'
                  }}>
                    {item.type}
                  </div>
                </div>

                <div style={{ padding: '14px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4', marginBottom: '12px' }}>
                    {item.desc}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11.5px',
                    color: isPro || isAdmin ? '#00e676' : '#00e5ff',
                    fontWeight: '600'
                  }}>
                    <span>{isPro || isAdmin ? 'Click to Open Blueprint in Vault' : 'Tap to Unlock Blueprint & Video'}</span>
                    {isPro || isAdmin ? (
                      <Sparkles size={13} color="#00e676" />
                    ) : (
                      <Lock size={12} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Community Comments & Star-Masked Reviews Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '50px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ fontSize: '12px', color: '#00e5ff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Verified Community Feedback
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px' }}>
            What Traders Are Saying (Privacy Protected)
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
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
            <div key={rev.id} className="glass-card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '13px', color: '#00e5ff' }}>
                  {rev.userMasked}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{rev.date}</span>
              </div>
              <div style={{ display: 'flex', gap: '2px', color: '#f59e0b', fontSize: '14px', marginBottom: '8px' }}>
                {'★'.repeat(rev.rating)}
              </div>
              <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>

        {/* Share Experience Form */}
        <div style={{
          maxWidth: '560px',
          margin: '0 auto',
          backgroundColor: '#111726',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>
            Share Your Experience
          </h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
            Your email is encrypted and starred. No personal credentials are ever exposed.
          </p>

          {commentSuccess && (
            <div style={{ backgroundColor: 'rgba(0, 230, 118, 0.15)', color: '#00e676', padding: '10px', borderRadius: '8px', fontSize: '12.5px', marginBottom: '14px' }}>
              {commentSuccess}
            </div>
          )}

          <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="email"
              placeholder="Your email (will be masked e.g. ro****@gmail.com)"
              value={commentEmail}
              onChange={(e) => setCommentEmail(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#fff',
                fontSize: '13px'
              }}
              required
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Rating:</span>
              {[5, 4, 3, 2, 1].map(num => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setRating(num)}
                  style={{
                    background: rating >= num ? '#f59e0b' : '#1e293b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '11px',
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
                backgroundColor: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#fff',
                fontSize: '13px'
              }}
              required
            />

            <button
              type="submit"
              disabled={submittingComment}
              className="btn-trading-glow"
              style={{ padding: '10px 20px', alignSelf: 'flex-start', fontSize: '13px' }}
            >
              {submittingComment ? 'Posting...' : 'Post Verified Comment'}
            </button>
          </form>
        </div>
      </section>

      {/* Footer & Support Redirection */}
      <footer style={{
        backgroundColor: '#060910',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '36px 16px',
        fontSize: '13px',
        color: '#64748b'
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
              <span style={{ fontWeight: '700', color: '#fff' }}>TradingHath</span>
            </div>
            <p>© 2026 TradingHath. All rights reserved. 24/7 Uptime.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* Direct Support Gmail Redirection */}
            <a
              href="mailto:tradinghath@gmail.com?subject=TradingHath%20Query%20or%20Payment%20Assistance"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#00e5ff',
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
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#111726',
            border: '1px solid #00e5ff',
            borderRadius: '16px',
            padding: '28px',
            width: '100%',
            maxWidth: '420px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px', color: '#fff' }}>
              Verify UPI UTR ID (₹399)
            </h3>
            <p style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '16px', lineHeight: '1.5' }}>
              If you paid via PhonePe, Google Pay, Paytm, or direct UPI, paste your 12-digit UTR reference ID below to activate instant access.
            </p>

            {utrStatus && (
              <div style={{
                backgroundColor: 'rgba(0, 229, 255, 0.1)',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#00e5ff',
                marginBottom: '16px'
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
                  backgroundColor: '#090d16',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '13px'
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
                  backgroundColor: '#090d16',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '13px'
                }}
                required
              />

              <button type="submit" className="btn-trading-glow" style={{ width: '100%', padding: '12px' }}>
                Verify & Activate Access
              </button>

              <button
                type="button"
                onClick={() => { setShowUtrModal(false); setUtrStatus(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
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
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#121826',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Terms & Conditions</h3>
            <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p>1. <b>Access:</b> Lifetime access grants unrestricted viewing of hand-made blueprints and video lessons 24/7 on Vercel hosted servers.</p>
              <p>2. <b>Downloads:</b> Charts can be downloaded for educational study. Video downloads and recording are strictly prohibited.</p>
              <p>3. <b>No Refund Policy:</b> Due to the instant delivery of proprietary digital materials, all sales of ₹399 are final and non-refundable.</p>
              <p>4. <b>Privacy:</b> No email addresses or passwords will be shared or publicly displayed to other users.</p>
              <p>5. <b>Support:</b> All queries are processed directly via <code>tradinghath@gmail.com</code>.</p>
            </div>
            <button
              onClick={() => setTermsModal(false)}
              className="btn-trading-glow"
              style={{ width: '100%', marginTop: '20px', padding: '10px' }}
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
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 110
        }}>
          <div style={{
            backgroundColor: '#111726',
            border: '2px solid #00e676',
            borderRadius: '18px',
            padding: '28px 24px',
            maxWidth: '440px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 230, 118, 0.2)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 230, 118, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle2 size={32} color="#00e676" />
            </div>

            <span style={{ fontSize: '11px', color: '#00e676', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Lifetime Access Verified
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginTop: '6px', color: '#fff', marginBottom: '8px' }}>
              Already Payment Done!
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', marginBottom: '22px' }}>
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
                backgroundColor: '#00e676',
                color: '#000',
                fontWeight: '800',
                border: 'none',
                borderRadius: '10px',
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
                color: '#94a3b8',
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
