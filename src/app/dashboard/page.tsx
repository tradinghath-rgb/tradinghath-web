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
  AlertTriangle,
  User,
  HelpCircle,
  Compass,
  ChevronDown,
  Mail,
  Phone
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

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

    // Function to load and sync all published posts (from API and local storage fallback)
    const loadPublishedPosts = () => {
      fetch('/api/admin/posts')
        .then(res => res.json())
        .then(data => {
          let allPosts: PostItem[] = (data.posts || []).filter((p: PostItem) => p.published);
          
          if (typeof window !== 'undefined') {
            try {
              const stored = localStorage.getItem('tradinghath_dynamic_posts');
              if (stored) {
                const localPosts: PostItem[] = JSON.parse(stored);
                const liveLocal = localPosts.filter(p => p.published);
                const existingIds = new Set(liveLocal.map(p => p.id));
                allPosts = [...liveLocal, ...allPosts.filter(p => !existingIds.has(p.id))];
              }
            } catch (e) {}
          }

          if (allPosts.length > 0) {
            setPosts(allPosts);
            const firstChart = allPosts.find(p => p.type === 'chart');
            if (firstChart) setSelectedChart(firstChart);
          }
        })
        .catch(err => {
          console.error(err);
          // Fallback to local storage if API is slow or offline
          if (typeof window !== 'undefined') {
            try {
              const stored = localStorage.getItem('tradinghath_dynamic_posts');
              if (stored) {
                const localPosts: PostItem[] = JSON.parse(stored);
                const liveLocal = localPosts.filter(p => p.published);
                const combined = [...liveLocal, ...INITIAL_POSTS];
                setPosts(combined);
                const firstChart = combined.find(p => p.type === 'chart');
                if (firstChart) setSelectedChart(firstChart);
              }
            } catch (e) {}
          }
        });
    };

    loadPublishedPosts();
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

  const handleDownloadChart = async (e: React.MouseEvent, url: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();

    const cleanTitle = (title || 'TradingHath_Chart').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${cleanTitle}.jpg`;

    try {
      // If it is already a base64 data url from gallery upload:
      if (url.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      // If remote image (Unsplash or CDN), fetch as blob to force file download dialog instead of browser tab view
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('Fetch failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback: create download anchor
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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

          {/* User Status, Profile & Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* User Profile Pill Button */}
            <button
              onClick={() => setShowProfileModal(true)}
              style={{
                backgroundColor: 'rgba(0, 229, 255, 0.12)',
                border: '1px solid rgba(0, 229, 255, 0.35)',
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
              <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.username || 'My Profile'}
              </span>
              <ChevronDown size={14} color="#00e5ff" />
            </button>

            {/* Platform Guide / Directions Button */}
            <button
              onClick={() => setShowGuideModal(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                padding: '6px 11px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              <Compass size={14} color="#00e5ff" />
              <span style={{ display: 'inline' }}>Guide</span>
            </button>

            {/* Logout Button */}
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
                fontSize: '12.5px',
                fontWeight: '600',
                padding: '4px 6px'
              }}
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px 80px 16px' }}>
        
        {/* User Account & Platform Direction Dashboard Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.12) 0%, rgba(56, 117, 246, 0.08) 100%)',
          border: '1px solid rgba(0, 229, 255, 0.25)',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 229, 255, 0.2)',
                border: '1px solid #00e5ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                color: '#00e5ff',
                fontSize: '15px'
              }}>
                {(user?.username || 'T')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                    Welcome, {user?.username || 'Trader'}!
                  </h2>
                  <span style={{
                    fontSize: '10px',
                    backgroundColor: 'rgba(0, 230, 118, 0.2)',
                    color: '#00e676',
                    border: '1px solid rgba(0, 230, 118, 0.4)',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontWeight: '700'
                  }}>
                    LIFETIME PRO ACTIVE
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '3px' }}>
                  Logged in as: <span style={{ color: '#00e5ff', fontWeight: '600' }}>{user?.email || 'member@tradinghath.com'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(true)}
              style={{
                backgroundColor: '#111726',
                border: '1px solid rgba(0, 229, 255, 0.4)',
                borderRadius: '8px',
                padding: '6px 12px',
                color: '#00e5ff',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <User size={13} /> View Full Profile
            </button>
          </div>

          {/* Quick Step-by-Step Platform Directions */}
          <div style={{
            backgroundColor: 'rgba(9, 13, 22, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>1</span>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                <b style={{ color: '#fff' }}>Hand-Made Charts:</b> Tap any chart card below to view the setup blueprint and download it to your phone gallery.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>2</span>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                <b style={{ color: '#fff' }}>Side-by-Side Video:</b> Each chart has its exact explanation reel running side-by-side on phone or PC.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(0, 230, 118, 0.15)', color: '#00e676', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>3</span>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                <b style={{ color: '#fff' }}>Language Vault:</b> Switch between English and Telugu reels anytime using the language filters.
              </div>
            </div>
          </div>
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
              <BookOpen size={16} /> Hand-Made Charts ({posts.filter(p => p.type === 'chart').length})
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
                border: activeTab === 'videos' ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: activeTab === 'videos' ? 'rgba(192, 132, 252, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: activeTab === 'videos' ? '#c084fc' : '#94a3b8'
              }}
            >
              <Film size={16} /> Video Library Vault ({posts.filter(p => p.type === 'video').length})
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
                  <button
                    type="button"
                    onClick={(e) => handleDownloadChart(e, selectedChart.downloadUrl || selectedChart.chartUrl || '', selectedChart.title)}
                    className="btn-trading-glow"
                    style={{ fontSize: '13px', padding: '9px 18px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={16} /> Save Chart to Gallery
                  </button>
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
                        unoptimized
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

                    {/* Responsive Video Player Supporting YouTube Embeds & Direct Video */}
                    <div style={{ position: 'relative', height: '360px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {selectedChart.videoUrl?.includes('youtube.com') || selectedChart.videoUrl?.includes('youtu.be') ? (
                        <iframe
                          src={
                            selectedChart.videoUrl.includes('/embed/')
                              ? selectedChart.videoUrl
                              : selectedChart.videoUrl.replace('/shorts/', '/embed/').replace('watch?v=', 'embed/')
                          }
                          title={selectedChart.title}
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
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
                      )}
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
                      unoptimized
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

                      <button
                        type="button"
                        onClick={(e) => handleDownloadChart(e, post.downloadUrl || post.chartUrl || '', post.title)}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: '#fff',
                          border: 'none',
                          padding: '5px 9px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Download size={12} /> Save to Gallery
                      </button>
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
              {filteredPosts.map((item) => (
                <div
                  key={item.id}
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
                    {item.videoUrl && (item.videoUrl.includes('youtube.com') || item.videoUrl.includes('youtu.be')) ? (
                      <iframe
                        src={
                          item.videoUrl.includes('/embed/')
                            ? item.videoUrl
                            : item.videoUrl.replace('/shorts/', '/embed/').replace('watch?v=', 'embed/')
                        }
                        title={item.title}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={item.videoUrl}
                        controls
                        controlsList="nodownload"
                        disablePictureInPicture
                        onContextMenu={(e) => e.preventDefault()}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    )}
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '10.5px',
                      color: '#00e5ff',
                      fontWeight: '700',
                      textTransform: 'capitalize'
                    }}>
                      {item.language}
                    </div>
                  </div>

                  <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {item.description || 'Master level price action setup and trade management rules.'}
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

        {/* MODAL 1: USER PROFILE DETAILS MODAL */}
        {showProfileModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px'
          }}>
            <div style={{
              backgroundColor: '#111726',
              border: '1px solid #00e5ff',
              borderRadius: '20px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0, 229, 255, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={20} color="#00e5ff" />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0 }}>My Account Profile</h3>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer', padding: '4px' }}
                >
                  ✕
                </button>
              </div>

              {/* Profile Avatar Card */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                backgroundColor: 'rgba(0, 229, 255, 0.05)',
                border: '1px solid rgba(0, 229, 255, 0.15)',
                borderRadius: '14px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#00e5ff',
                  color: '#000',
                  fontSize: '22px',
                  fontWeight: '900',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {(user?.username || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#fff', margin: '0 0 4px 0' }}>
                    {user?.username || 'Trader'}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      backgroundColor: 'rgba(0, 230, 118, 0.2)',
                      color: '#00e676',
                      border: '1px solid rgba(0, 230, 118, 0.4)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      ✓ LIFETIME PRO MEMBER
                    </span>
                  </div>
                </div>
              </div>

              {/* Credentials & Details Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div style={{ padding: '12px', backgroundColor: '#090d16', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Username</div>
                  <div style={{ fontSize: '14px', color: '#fff', fontWeight: '600' }}>{user?.username || 'Trader'}</div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#090d16', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Registered Email (Gmail)</div>
                  <div style={{ fontSize: '14px', color: '#00e5ff', fontWeight: '600' }}>{user?.email || 'member@tradinghath.com'}</div>
                </div>

                {user?.phone && (
                  <div style={{ padding: '12px', backgroundColor: '#090d16', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Phone Number</div>
                    <div style={{ fontSize: '14px', color: '#fff', fontWeight: '600' }}>{user?.phone}</div>
                  </div>
                )}

                <div style={{ padding: '12px', backgroundColor: '#090d16', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Membership Status</div>
                  <div style={{ fontSize: '13px', color: '#00e676', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} /> ₹399 Lifetime Access Unlocked (All Videos & Charts)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="btn-trading-glow"
                  style={{ flex: 1, padding: '11px', fontSize: '13px', cursor: 'pointer' }}
                >
                  Close
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '11px 16px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: STEP-BY-STEP PLATFORM DIRECTIONS & TUTORIAL */}
        {showGuideModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px'
          }}>
            <div style={{
              backgroundColor: '#111726',
              border: '1px solid #00e5ff',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0, 229, 255, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Compass size={22} color="#00e5ff" />
                  <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#fff', margin: 0 }}>Website Directions & Guide</h3>
                </div>
                <button
                  onClick={() => setShowGuideModal(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer', padding: '4px' }}
                >
                  ✕
                </button>
              </div>

              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', marginBottom: '20px' }}>
                Welcome to TradingHath! Here are simple, step-by-step directions on how to navigate, study setups, and download blueprints directly to your device:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {/* Step 1 */}
                <div style={{ display: 'flex', gap: '12px', padding: '14px', backgroundColor: '#090d16', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    1
                  </div>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '0 0 4px 0' }}>Viewing Hand-Made Setup Charts</h5>
                    <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>
                      Tap the <b>"Hand-Made Charts"</b> tab. Click on any setup card in the grid to display its high-resolution blueprint in the top view screen.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: '12px', padding: '14px', backgroundColor: '#090d16', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(0, 230, 118, 0.15)', color: '#00e676', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    2
                  </div>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '0 0 4px 0' }}>Saving Charts to Phone Gallery</h5>
                    <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>
                      Click <b>"Save Chart to Gallery"</b>. The high-resolution chart will download straight into your phone's Photos or Downloads folder.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: '12px', padding: '14px', backgroundColor: '#090d16', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    3
                  </div>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '0 0 4px 0' }}>Side-by-Side Video Explanations</h5>
                    <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>
                      Beside each chart blueprint is its video explanation reel. You can watch the full institutional trap formula while referencing the chart simultaneously.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div style={{ display: 'flex', gap: '12px', padding: '14px', backgroundColor: '#090d16', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    4
                  </div>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '0 0 4px 0' }}>Complete Video Library & Language Filter</h5>
                    <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>
                      Click <b>"Video Library"</b> to watch all 23+ institutional reels. Use the <b>All / English / Telugu</b> pills to filter by your preferred language.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowGuideModal(false)}
                className="btn-trading-glow"
                style={{ width: '100%', padding: '12px', fontSize: '13px', cursor: 'pointer' }}
              >
                Got It, Let's Start Trading!
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
