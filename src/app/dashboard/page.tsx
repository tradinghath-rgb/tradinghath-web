'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Download, 
  PlayCircle, 
  Lock, 
  Sparkles, 
  BookOpen, 
  Film, 
  ShieldCheck, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { INITIAL_POSTS, PostItem } from '@/lib/store';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'charts' | 'videos'>('charts');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'english' | 'telugu'>('all');
  const [posts, setPosts] = useState<PostItem[]>(INITIAL_POSTS);
  const [selectedChart, setSelectedChart] = useState<PostItem | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isPro, setIsPro] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    // Load auth status strictly
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tradinghath_user');
      const proStatus = localStorage.getItem('tradinghath_isPro');
      const role = localStorage.getItem('tradinghath_role');

      if (!stored && role !== 'admin') {
        // Not logged in at all, redirect to login
        window.location.href = '/login';
        return;
      }

      if (stored) {
        setUser(JSON.parse(stored));
      }

      // Pro only if role is admin OR isPro is strictly 'true'
      const hasPro = role === 'admin' || proStatus === 'true';
      setIsPro(hasPro);
      setCheckingAccess(false);
    }

    // Set initial selected chart if exists
    const firstChart = INITIAL_POSTS.find(p => p.type === 'chart');
    if (firstChart) setSelectedChart(firstChart);

    // Fetch latest published posts
    fetch('/api/admin/posts')
      .then(res => res.json())
      .then(data => {
        if (data.posts) {
          setPosts(data.posts.filter((p: PostItem) => p.published));
        }
      })
      .catch(console.error);
  }, []);


  const filteredPosts = posts.filter(p => {
    if (p.type !== (activeTab === 'charts' ? 'chart' : 'video')) return false;
    if (languageFilter === 'all') return true;
    return p.language === languageFilter || p.language === 'both';
  });

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tradinghath_user');
      localStorage.removeItem('tradinghath_role');
      localStorage.removeItem('tradinghath_isPro');
      window.location.href = '/login';
    }
  };

  if (checkingAccess) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00e5ff' }}>
        Verifying Membership Access...
      </div>
    );
  }

  // STRICT PAYWALL: If user is not Pro, block all charts and videos completely!
  if (!isPro) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: '#111726', border: '2px solid #00e5ff', borderRadius: '20px', padding: '36px 24px', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(0, 229, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <Lock size={30} color="#00e5ff" />
          </div>
          <span style={{ fontSize: '11px', color: '#00e5ff', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Membership Required
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: '800', marginTop: '6px', marginBottom: '8px' }}>
            Vault Access Locked
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', marginBottom: '24px' }}>
            Hello <b>{user?.username || 'Trader'}</b>! Hand-made charts and side-by-side video explanations require verified <b>₹399 Lifetime Access</b>.
          </p>

          <a
            href="https://rzp.io/rzp/2a3h6cU"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-trading-glow"
            style={{ width: '100%', padding: '14px', fontSize: '14px', textDecoration: 'none', display: 'block', marginBottom: '12px' }}
          >
            Pay ₹399 via UPI / Razorpay
          </a>

          <Link
            href="/"
            style={{
              display: 'block',
              width: '100%',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#94a3b8',
              padding: '10px',
              borderRadius: '10px',
              fontSize: '12.5px',
              textDecoration: 'none'
            }}
          >
            Submit UTR ID on Homepage
          </Link>

          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              marginTop: '16px',
              fontSize: '12px'
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc' }}>

      {/* Top Navigation Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '12px 20px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Brand Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <Image
              src="/logo/general-profile-picture.png"
              alt="TradingHath Logo"
              width={38}
              height={38}
              style={{ borderRadius: '50%', border: '2px solid #00e5ff' }}
            />
            <div>
              <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff' }}>
                Trading<span style={{ color: '#00e5ff' }}>Hath</span>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  backgroundColor: 'rgba(0, 229, 255, 0.15)',
                  color: '#00e5ff',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: '700'
                }}>
                  Lifetime Pro
                </span>
              </div>
            </div>
          </Link>

          {/* User Status / Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px 80px 16px' }}>
        
        {/* Pro Lifetime Welcome Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.12) 0%, rgba(56, 117, 246, 0.08) 100%)',
          border: '1px solid rgba(0, 229, 255, 0.25)',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#00e5ff" />
            <h2 style={{ fontSize: '19px', fontWeight: '700', color: '#ffffff' }}>
              TradingHath Member Vault (24/7 Access)
            </h2>
          </div>
          <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: '1.5' }}>
            Welcome! Click any hand-made chart below to preview it and watch its exact video breakdown side-by-side. 
            Charts are freely downloadable for your study. Video downloading is strictly restricted to protect proprietary setup formulas.
          </p>
        </div>

        {/* Section Tabs & Language Filters */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '16px'
        }}>
          {/* Main Sections */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setActiveTab('charts')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                border: activeTab === 'charts' ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: activeTab === 'charts' ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: activeTab === 'charts' ? '#00e5ff' : '#94a3b8'
              }}
            >
              <BookOpen size={16} /> Hand-Made Charts
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                border: activeTab === 'videos' ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: activeTab === 'videos' ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: activeTab === 'videos' ? '#00e5ff' : '#94a3b8'
              }}
            >
              <Film size={16} /> Video Library (English & Telugu)
            </button>
          </div>

          {/* Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Language:</span>
            {(['all', 'english', 'telugu'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguageFilter(lang)}
                style={{
                  fontSize: '12.5px',
                  fontWeight: '600',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: languageFilter === lang ? '#3875f6' : '#1e293b',
                  color: languageFilter === lang ? '#ffffff' : '#94a3b8',
                  textTransform: 'capitalize'
                }}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: CHARTS WITH SIDE-BY-SIDE VIDEO EXPLANATION */}
        {activeTab === 'charts' && (
          <div>
            {/* Active Chart & Side Video Viewer */}
            {selectedChart && (
              <div style={{
                backgroundColor: '#121826',
                border: '1px solid rgba(0, 229, 255, 0.2)',
                borderRadius: '18px',
                padding: '20px',
                marginBottom: '36px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <span style={{
                      fontSize: '11px',
                      color: '#00e5ff',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Active Chart & Explanation Breakdown
                    </span>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', marginTop: '2px' }}>
                      {selectedChart.title}
                    </h3>
                  </div>

                  {/* Chart Download Action */}
                  <a
                    href={selectedChart.downloadUrl || selectedChart.chartUrl}
                    download={`${selectedChart.title.replace(/\s+/g, '_')}_Chart.jpg`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-trading-glow"
                    style={{ fontSize: '13px', padding: '9px 18px' }}
                  >
                    <Download size={16} /> Download High-Res Chart
                  </a>
                </div>

                {/* Side-by-Side Flex Layout (Responsive Grid) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '20px',
                  alignItems: 'start'
                }}>
                  {/* Left Column: Hand-made Chart Image */}
                  <div style={{
                    backgroundColor: '#0a0d14',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      padding: '8px 14px',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      fontSize: '12px',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>Hand-Made Setup Blueprint</span>
                      <span style={{ color: '#00e676' }}>Click to expand / Downloadable</span>
                    </div>
                    {/* Visual Chart */}
                    <div style={{ position: 'relative', height: '360px', width: '100%', backgroundColor: '#161e2e' }}>
                      <Image
                        src={selectedChart.chartUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80'}
                        alt={selectedChart.title}
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                  </div>

                  {/* Right Column: Protected Video Explanation Beside the Chart */}
                  <div style={{
                    backgroundColor: '#0a0d14',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      padding: '8px 14px',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      fontSize: '12px',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <PlayCircle size={14} color="#00e5ff" />
                        <span>Reel Video Explanation</span>
                      </div>
                      <span style={{ color: '#f59e0b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Lock size={12} /> Download Restricted
                      </span>
                    </div>

                    {/* Protected HTML5 Video Player */}
                    <div style={{ position: 'relative', height: '360px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <video
                        src={selectedChart.videoUrl}
                        controls
                        controlsList="nodownload"
                        disablePictureInPicture
                        onContextMenu={(e) => e.preventDefault()}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '360px' }}
                      >
                        Your browser does not support HTML5 video.
                      </video>
                    </div>
                  </div>
                </div>

                {/* Setup Strategy Description */}
                <div style={{ marginTop: '16px', padding: '14px', backgroundColor: '#0f1420', borderRadius: '10px' }}>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
                    <b style={{ color: '#00e5ff' }}>Setup Strategy: </b>
                    {selectedChart.description}
                  </p>
                </div>
              </div>
            )}

            {/* Hand-Made Charts Grid */}
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#ffffff' }}>
              All Hand-Made Trading Charts
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '18px'
            }}>
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedChart(post)}
                  style={{
                    backgroundColor: selectedChart?.id === post.id ? 'rgba(0, 229, 255, 0.08)' : '#111726',
                    border: selectedChart?.id === post.id ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, border-color 0.2s'
                  }}
                >
                  <div style={{ position: 'relative', height: '170px', width: '100%', backgroundColor: '#000' }}>
                    <Image
                      src={post.chartUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80'}
                      alt={post.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      backdropFilter: 'blur(4px)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#00e5ff',
                      fontWeight: '700'
                    }}>
                      Hand-Made
                    </div>
                  </div>

                  <div style={{ padding: '14px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px', color: '#fff' }}>
                      {post.title}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4', marginBottom: '12px' }}>
                      {post.description.slice(0, 75)}...
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: '#00e5ff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <PlayCircle size={13} /> View Explanation Side-by-Side
                      </span>

                      <a
                        href={post.downloadUrl || post.chartUrl}
                        download
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Download size={12} /> Chart
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: VIDEOS SECTION (23+ Telugu & English Reels) */}
        {activeTab === 'videos' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>
                Complete Video Reel Vault (English & Telugu)
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                Watch proprietary market structure, trap identification, and volume strategies on demand. Video downloading is strictly restricted.
              </p>
            </div>

            {/* Video Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '20px'
            }}>
              {[
                { title: 'Reel 24: High Probability LQT Setup', file: '/videos/telugu/REEL-24(LQT SETUP).mp4', lang: 'Telugu & English' },
                { title: 'Reel 15: Why FVG Fails in Retail Traps', file: '/videos/telugu/REEL-15(WHY FVG FAIL).mp4', lang: 'Telugu' },
                { title: 'Reel 16: Stop Loss Trap (SL Trap)', file: '/videos/telugu/REEL-16(SL TRAP).mp4', lang: 'Telugu' },
                { title: 'Reel 17: Support & Resistance Truth', file: '/videos/telugu/REEL-17(SUPPORT AND RESISTANCE).mp4', lang: 'Telugu' },
                { title: 'Reel 18: Head & Shoulder True Pattern', file: '/videos/telugu/REEL-18(HEAD AND SHOULDE).mp4', lang: 'Telugu' },
                { title: 'Reel 19: Liquidity Grab & Sweep Mechanics', file: '/videos/telugu/REEL-19(LQT GRAB AND SWEEP).mp4', lang: 'Telugu' },
                { title: 'Reel 20: Fake Breakout Anatomy', file: '/videos/telugu/REEL-20(FAKE BREAKOUT).mp4', lang: 'Telugu' },
                { title: 'Reel 21: Perfect Sniper Entry Strategy', file: '/videos/telugu/REEL-21(PERFECT ENTRY).mp4', lang: 'Telugu' },
                { title: 'Reel 22: Double Top Institutional Rules', file: '/videos/telugu/REEL-22(DOUBLE TOP).mp4', lang: 'Telugu' },
                { title: 'Reel 23: Double Bottom Trap Avoidance', file: '/videos/telugu/REEL-23(DOUBLE BOTTOM).mp4', lang: 'Telugu' },
                { title: 'Reel 1: Volume Secret Formula', file: '/videos/english/reel-1(volume secret).mp4', lang: 'English' },
                { title: 'Reel 11: BOS & CHOCH Trend Shifts', file: '/videos/english/reel-11(BOS&CHOCH).mp4', lang: 'English' },
                { title: 'Reel 5: Institutional Liquidity Concepts', file: '/videos/english/reel-5(liquiduty).mp4', lang: 'English' },
                { title: 'Reel 6: High Win-Rate Order Block Strategy', file: '/videos/english/reel-6(order block).mp4', lang: 'English' },
                { title: 'Reel 4: Professional Trading Psychology', file: '/videos/english/reel-4(trading psychology).mp4', lang: 'English' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#121826',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Protected Video Element */}
                  <div style={{ position: 'relative', height: '220px', backgroundColor: '#000000' }}>
                    <video
                      src={item.file}
                      controls
                      controlsList="nodownload"
                      disablePictureInPicture
                      onContextMenu={(e) => e.preventDefault()}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '10.5px',
                      color: '#00e5ff',
                      fontWeight: '700'
                    }}>
                      {item.lang}
                    </div>
                  </div>

                  <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                        Master level price action setup and trade management rules.
                      </p>
                    </div>

                    <div style={{
                      marginTop: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: '#64748b'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={13} color="#00e676" /> Verified TradingHath Content
                      </span>
                      <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Lock size={11} /> Anti-Download Active
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
