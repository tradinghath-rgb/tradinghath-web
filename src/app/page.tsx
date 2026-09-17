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
  Sparkles,
  Zap,
  AlertCircle,
  UploadCloud,
  ImageIcon,
  Check
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

  // Payment states
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showUtrModal, setShowUtrModal] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [utrEmail, setUtrEmail] = useState('');
  const [utrStatus, setUtrStatus] = useState('');
  const [termsModal, setTermsModal] = useState(false);
  const [previewTab, setPreviewTab] = useState<'charts' | 'videos'>('charts');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [isScreenshotDragging, setIsScreenshotDragging] = useState(false);

  useEffect(() => {
    fetch('/api/comments')
      .then(res => res.json())
      .then(data => {
        if (data.reviews) setReviews(data.reviews);
      })
      .catch(console.error);
  }, []);

  // Razorpay Checkout Trigger (Direct UPI App link & Gateway)
  const DIRECT_PAYMENT_LINK = 'https://rzp.io/rzp/2a3h6cU';

  const handleRazorpayPayment = async () => {
    // If mobile phone or user preferred link, open direct payment link directly
    // This immediately opens PhonePe / GPay / Paytm on phones
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              onClick={handleRazorpayPayment}
              disabled={paymentLoading}
              className="btn-trading-glow"
              style={{ fontSize: '13px', padding: '8px 16px' }}
            >
              Get Access ₹399
            </button>
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
        <div style={{
          maxWidth: '480px',
          margin: '0 auto 40px auto',
          backgroundColor: '#111726',
          border: '2px solid #00e5ff',
          borderRadius: '20px',
          padding: '30px 24px',
          textAlign: 'left',
          boxShadow: '0 20px 50px -10px rgba(0, 229, 255, 0.2)'
        }}>
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
          <button
            onClick={handleRazorpayPayment}
            disabled={paymentLoading}
            className="btn-trading-glow"
            style={{ width: '100%', padding: '14px', fontSize: '15px' }}
          >
            {paymentLoading ? 'Connecting Razorpay...' : 'Unlock Lifetime Access (₹399)'}
          </button>

          {/* Already Paid / Fill UTR ID Button */}
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

        {/* LOCKED VAULT PREVIEW SECTION (Separated Cleanly into Charts and Videos) */}
        <div style={{ marginTop: '50px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#00e5ff', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Separated Member Vault Previews
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: '#fff' }}>
                Hand-Made Charts & Video Reel Vault (Locked)
              </h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                Dedicated sections for downloadable blueprints and high-definition video walkthroughs.
              </p>
            </div>
            <button
              onClick={handleRazorpayPayment}
              className="btn-trading-glow"
              style={{ fontSize: '13px', padding: '10px 20px' }}
            >
              <Lock size={14} /> Unlock All 47 Setups (₹399)
            </button>
          </div>

          {/* Section Separation Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
            <button
              type="button"
              onClick={() => setPreviewTab('charts')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                border: previewTab === 'charts' ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: previewTab === 'charts' ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: previewTab === 'charts' ? '#00e5ff' : '#94a3b8'
              }}
            >
              Hand-Made Charts (Downloadable)
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('videos')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                border: previewTab === 'videos' ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: previewTab === 'videos' ? 'rgba(192, 132, 252, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: previewTab === 'videos' ? '#c084fc' : '#94a3b8'
              }}
            >
              Video Library (English & Telugu)
            </button>
          </div>

          {/* Grid Render for Hand-Made Charts */}
          {previewTab === 'charts' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '18px'
            }}>
              {[
                {
                  title: 'LQT Setup Strategy (Reel 24)',
                  desc: 'High probability Liquidity Sweep & Smart Money Setup with risk-reward ratio 1:3+.',
                  image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
                  badge: 'Hand-Made Chart',
                  badgeColor: '#00e5ff'
                },
                {
                  title: 'Why FVG Fails (Reel 15)',
                  desc: 'Avoid retail trap fair value gaps that get violated instantly.',
                  image: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=80',
                  badge: 'Hand-Made Chart',
                  badgeColor: '#00e5ff'
                },
                {
                  title: 'Stop Loss Trap Identification (Reel 16)',
                  desc: 'How institutional market makers trigger retail stop loss clusters before explosive moves.',
                  image: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&auto=format&fit=crop&q=80',
                  badge: 'Hand-Made Chart',
                  badgeColor: '#00e5ff'
                },
                {
                  title: 'Head & Shoulders Anatomy (Reel 18)',
                  desc: 'True breakout confirmation vs false neckline breaches.',
                  image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80',
                  badge: 'Hand-Made Chart',
                  badgeColor: '#00e5ff'
                },
                {
                  title: 'Break of Structure (BOS) & CHOCH (Reel 11)',
                  desc: 'Market trend shift detection rule book with volume footprint.',
                  image: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=800&auto=format&fit=crop&q=80',
                  badge: 'Hand-Made Chart',
                  badgeColor: '#00e5ff'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={handleRazorpayPayment}
                  style={{
                    backgroundColor: '#111726',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <div style={{ position: 'relative', height: '170px', width: '100%', backgroundColor: '#000' }}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      style={{ objectFit: 'cover', filter: 'blur(3px) brightness(0.7)' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid #00e5ff',
                      borderRadius: '30px',
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#00e5ff',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      <Lock size={14} /> Locked (₹399)
                    </div>

                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(0, 229, 255, 0.2)',
                      border: '1px solid rgba(0, 229, 255, 0.4)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '10.5px',
                      color: '#00e5ff',
                      fontWeight: '700'
                    }}>
                      {item.badge}
                    </div>
                  </div>

                  <div style={{ padding: '14px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4', marginBottom: '12px' }}>
                      {item.desc}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#00e5ff', fontWeight: '600' }}>
                      <span>Tap to Unlock Blueprint & Video</span>
                      <Lock size={12} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid Render for Video Reels */}
          {previewTab === 'videos' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '18px'
            }}>
              {[
                {
                  title: 'Reel 24: High Probability LQT Setup',
                  desc: 'Master institutional liquidity sweep & trade execution rules.',
                  image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
                  badge: 'Telugu & English Video',
                  badgeColor: '#c084fc'
                },
                {
                  title: 'Reel 15: Why FVG Fails in Retail Traps',
                  desc: 'Learn why retail fair value gaps fail and how smart money enters.',
                  image: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=80',
                  badge: 'Telugu Reel',
                  badgeColor: '#c084fc'
                },
                {
                  title: 'Reel 16: Stop Loss Trap (SL Trap)',
                  desc: 'How retail stop losses are hunted before massive directional moves.',
                  image: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&auto=format&fit=crop&q=80',
                  badge: 'Telugu Reel',
                  badgeColor: '#c084fc'
                },
                {
                  title: 'Reel 1: Volume Secret Formula',
                  desc: 'Master institutional volume anomalies to capture explosive moves.',
                  image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80',
                  badge: 'English Reel',
                  badgeColor: '#c084fc'
                },
                {
                  title: 'Reel 11: BOS & CHOCH Trend Shifts',
                  desc: 'Market trend shift detection rule book with volume footprint in English.',
                  image: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=800&auto=format&fit=crop&q=80',
                  badge: 'English Reel',
                  badgeColor: '#c084fc'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={handleRazorpayPayment}
                  style={{
                    backgroundColor: '#111726',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <div style={{ position: 'relative', height: '170px', width: '100%', backgroundColor: '#000' }}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      style={{ objectFit: 'cover', filter: 'blur(3px) brightness(0.7)' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid #c084fc',
                      borderRadius: '30px',
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#c084fc',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      <Lock size={14} /> Locked Video (₹399)
                    </div>

                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(192, 132, 252, 0.2)',
                      border: '1px solid rgba(192, 132, 252, 0.4)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '10.5px',
                      color: '#c084fc',
                      fontWeight: '700'
                    }}>
                      {item.badge}
                    </div>
                  </div>

                  <div style={{ padding: '14px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4', marginBottom: '12px' }}>
                      {item.desc}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#c084fc', fontWeight: '600' }}>
                      <span>Tap to Unlock Complete Video Reel</span>
                      <Lock size={12} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

              {/* Professional Drag-and-Drop / Gallery Upload for Payment Screenshot */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsScreenshotDragging(true); }}
                onDragLeave={() => setIsScreenshotDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsScreenshotDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    setScreenshotName(file.name);
                    const reader = new FileReader();
                    reader.onload = (event) => setScreenshotPreview(event.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                style={{
                  border: isScreenshotDragging ? '2px dashed #00e5ff' : '2px dashed rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '16px',
                  textAlign: 'center',
                  backgroundColor: isScreenshotDragging ? 'rgba(0, 229, 255, 0.05)' : '#090d16',
                  cursor: 'pointer'
                }}
              >
                <UploadCloud size={24} color="#00e5ff" style={{ margin: '0 auto 6px auto' }} />
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>
                  Upload Payment Screenshot (Optional)
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                  Drag and drop or tap to choose from gallery (JPG, PNG)
                </div>

                {screenshotName && (
                  <div style={{
                    marginTop: '8px',
                    backgroundColor: 'rgba(0, 230, 118, 0.15)',
                    color: '#00e676',
                    border: '1px solid rgba(0, 230, 118, 0.3)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    display: 'inline-block'
                  }}>
                    ✓ Attached: {screenshotName}
                  </div>
                )}

                <input
                  type="file"
                  id="utr-screenshot-input"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setScreenshotName(file.name);
                      const reader = new FileReader();
                      reader.onload = (event) => setScreenshotPreview(event.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                <div>
                  <label
                    htmlFor="utr-screenshot-input"
                    style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      padding: '6px 14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#00e5ff',
                      fontWeight: '600',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      cursor: 'pointer'
                    }}
                  >
                    Select Screenshot
                  </label>
                </div>

                {screenshotPreview && (
                  <div style={{ marginTop: '10px', maxHeight: '120px', overflow: 'hidden', borderRadius: '6px', border: '1px solid #333' }}>
                    <img src={screenshotPreview} alt="Payment proof" style={{ width: '100%', maxHeight: '120px', objectFit: 'contain' }} />
                  </div>
                )}
              </div>

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
    </div>
  );
}
