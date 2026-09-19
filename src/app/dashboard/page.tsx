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
  Phone,
  ShieldAlert,
  Settings,
  Maximize2,
  Minimize2,
  Eye,
  ArrowLeft,
  X,
  Search,
  FileText,
  Loader2
} from 'lucide-react';
import { safeStorage } from '@/lib/storage';
import { INITIAL_POSTS, PostItem } from '@/lib/store';
import UnifiedVideoPlayer from '@/lib/UnifiedVideoPlayer';
import UnifiedChartImage from '@/lib/UnifiedChartImage';
import { resolveMediaUrl } from '@/lib/videoStorage';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'charts' | 'videos'>('charts');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'english' | 'telugu'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<PostItem[]>(INITIAL_POSTS);
  const [selectedChart, setSelectedChart] = useState<PostItem | null>(null);
  const [chartLanguage, setChartLanguage] = useState<'telugu' | 'english'>('telugu');
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isPro, setIsPro] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    // Load auth status strictly
    try {
      const stored = safeStorage.getItem('tradinghath_user');
      const proStatus = safeStorage.getItem('tradinghath_isPro');
      const role = safeStorage.getItem('tradinghath_role');

      if (!stored && role !== 'admin') {
        // Not logged in at all, redirect to login
        window.location.href = '/login';
        return;
      }

      let currentUser: any = null;
      if (stored) {
        try {
          currentUser = JSON.parse(stored);
          setUser(currentUser);
        } catch (e) {}
      }

      // Strictly only tradinghath is the administrator!
      const emailLower = (currentUser?.email || '').toLowerCase();
      const userLower = (currentUser?.username || '').toLowerCase();
      const isOwnerAdmin = (
        userLower === 'tradinghath' || 
        emailLower === 'tradinghath@gmail.com'
      );
      if (!isOwnerAdmin && role === 'admin') {
        safeStorage.setItem('tradinghath_role', 'user');
      }
      const adminRole = isOwnerAdmin && (role === 'admin' || currentUser?.role === 'admin');
      setIsAdmin(adminRole);

      // Initial local pro check (admins always have pro; regular users depend on isPro / server)
      let hasPro = adminRole || (proStatus === 'true' && currentUser?.isPro !== false);
      if (!adminRole && currentUser) {
        try {
          const storedOverrides = safeStorage.getItem('tradinghath_pro_overrides');
          if (storedOverrides) {
            const overrides = JSON.parse(storedOverrides);
            if (overrides[currentUser.id] === false || (currentUser.email && overrides[currentUser.email.toLowerCase()] === false) || (currentUser.username && overrides[currentUser.username.toLowerCase()] === false)) {
              hasPro = false;
              safeStorage.setItem('tradinghath_isPro', 'false');
            } else if (overrides[currentUser.id] === true || (currentUser.email && overrides[currentUser.email.toLowerCase()] === true)) {
              hasPro = true;
              safeStorage.setItem('tradinghath_isPro', 'true');
            }
          }
        } catch (e) {}
      }
      setIsPro(hasPro);

      // 2. REAL-TIME SERVER VERIFICATION:
      // Query server to immediately sync revoke_pro or user deletion!
      const verifyWithServer = () => {
        if (!currentUser || adminRole) return;
        fetch('/api/auth/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            email: currentUser.email,
            username: currentUser.username
          })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              if (data.deleted === true && data.notFound !== true) {
                // User was EXPLICITLY deleted by admin — log out
                safeStorage.removeItem('tradinghath_user');
                safeStorage.removeItem('tradinghath_role');
                safeStorage.removeItem('tradinghath_isPro');
                window.location.href = '/login';
              } else if (!data.deleted) {
                // Live pro status from server
                const livePro = data.isPro === true;
                setIsPro(livePro);
                safeStorage.setItem('tradinghath_isPro', livePro ? 'true' : 'false');
              }
              // If notFound=true (server restart / DB not ready), keep session alive silently
            }
          })
          .catch(console.error);
      };

      verifyWithServer();

      // Heartbeat every 4 seconds to instantly lock/revoke if admin changes status in admin panel
      if (!adminRole) {
        const intervalId = setInterval(verifyWithServer, 4000);
          return () => clearInterval(intervalId);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setCheckingAccess(false);
      }

    // Function to load and sync all published posts (from API, INITIAL_POSTS, and local storage fallback)
    const loadPublishedPosts = () => {
      fetch('/api/admin/posts')
        .then(res => res.json())
        .then(data => {
          let allPosts: PostItem[] = (data.posts || []).filter((p: PostItem) => p.published);

          // Always ensure all 24 default hand-made charts exist
          const existingIds = new Set(allPosts.map(p => p.id));
          const missingDefaults = INITIAL_POSTS.filter(p => !existingIds.has(p.id));
          allPosts = [...allPosts, ...missingDefaults];
          
          try {
            const stored = safeStorage.getItem('tradinghath_dynamic_posts');
            if (stored) {
              const localPosts: PostItem[] = JSON.parse(stored);
              const liveLocal = localPosts.filter(p => p.published);
              const currentIds = new Set(allPosts.map(p => p.id));
              allPosts = [...allPosts, ...liveLocal.filter(p => !currentIds.has(p.id))];
            }
          } catch (e) {}

          // Enforce correct language categorization
          allPosts = allPosts.map(p => {
            if (p.id === 'vid_2' || p.title.toLowerCase().includes('reel 15')) {
              return { ...p, language: 'english' };
            }
            return p;
          });

          if (allPosts.length > 0) {
            setPosts(allPosts);
            const firstChart = allPosts.find(p => p.type === 'chart');
            if (firstChart) setSelectedChart(firstChart);
          }
        })
        .catch(err => {
          console.error(err);
          // Fallback to initial posts & local storage
          let combined = [...INITIAL_POSTS];
          try {
            const stored = safeStorage.getItem('tradinghath_dynamic_posts');
            if (stored) {
              const localPosts: PostItem[] = JSON.parse(stored);
              const liveLocal = localPosts.filter(p => p.published);
              const existing = new Set(combined.map(p => p.id));
              combined = [...combined, ...liveLocal.filter(p => !existing.has(p.id))];
            }
          } catch (e) {}
          setPosts(combined);
          const firstChart = combined.find(p => p.type === 'chart');
          if (firstChart) setSelectedChart(firstChart);
        });
    };

    loadPublishedPosts();
  }, []);


  const filteredPosts = posts.filter(p => {
    if (p.type !== (activeTab === 'charts' ? 'chart' : 'video')) return false;
    if (languageFilter !== 'all' && p.language !== languageFilter && p.language !== 'both') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchTitle = (p.title || '').toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    return true;
  });

  const handleLogout = () => {
    try {
      safeStorage.removeItem('tradinghath_user');
      safeStorage.removeItem('tradinghath_role');
      safeStorage.removeItem('tradinghath_isPro');
    } catch (e) {}
    window.location.href = '/login';
  };

  const handleDownloadChart = async (e: React.MouseEvent, url: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();

    const cleanTitle = (title || 'TradingHath_Chart').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${cleanTitle}.jpg`;

    try {
      let targetUrl = url;
      if (targetUrl.startsWith('indexeddb://')) {
        const resolved = await resolveMediaUrl(targetUrl);
        if (resolved) targetUrl = resolved;
      }

      // If it is already a base64 data url from gallery upload:
      if (targetUrl.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = targetUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      // If remote image (Unsplash or CDN), fetch as blob to force file download dialog instead of browser tab view
      const response = await fetch(targetUrl, { mode: 'cors' });
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

  // 1-Click "Download All Charts as PDF" for Lifetime Pro Users
  const handleDownloadAllChartsPdf = async () => {
    if (!isPro) {
      alert('This exclusive master PDF bundle is reserved for Lifetime Pro members.');
      return;
    }

    const allCharts = posts.filter(p => p.type === 'chart');
    if (allCharts.length === 0) {
      alert('No charts currently available to compile.');
      return;
    }

    setPdfDownloading(true);
    setPdfProgress('Initializing PDF builder...');

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      // Helper function to convert image url to HTMLImageElement / base64
      const loadImageDataUrl = async (imgUrl: string): Promise<{ dataUrl: string; width: number; height: number } | null> => {
        let finalUrl = imgUrl;
        if (finalUrl.startsWith('indexeddb://')) {
          const resolved = await resolveMediaUrl(finalUrl);
          if (resolved) finalUrl = resolved;
        }

        return new Promise((resolve) => {
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth || img.width;
              canvas.height = img.naturalHeight || img.height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                resolve(null);
                return;
              }
              ctx.drawImage(img, 0, 0);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
              resolve({ dataUrl, width: canvas.width, height: canvas.height });
            } catch (err) {
              resolve(null);
            }
          };
          img.onerror = () => resolve(null);
          img.src = imgUrl;
        });
      };

      // 1. COVER PAGE
      doc.setFillColor(9, 13, 22);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Cyan Accent Line
      doc.setFillColor(0, 229, 255);
      doc.rect(20, 25, 8, pageHeight - 50, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.text('TRADINGHATH SECRET VAULT', 36, 48);

      doc.setFontSize(16);
      doc.setTextColor(0, 229, 255);
      doc.text('COMPLETE HAND-MADE CHART BLUEPRINTS', 36, 60);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(148, 163, 184);
      doc.text('Official Institutional Smart Money Price Action & Liquidity Guide', 36, 70);

      // Metadata Box
      doc.setFillColor(17, 23, 38);
      doc.roundedRect(36, 85, pageWidth - 60, 48, 4, 4, 'F');

      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(`Total Setups Included: ${allCharts.length} Blueprints`, 44, 98);
      doc.text(`Edition / Download Date: ${currentDate}`, 44, 108);
      doc.text(`Licensed To: ${user?.email || 'Pro Member'} (${user?.username || 'Trader'})`, 44, 118);
      doc.setTextColor(0, 230, 118);
      doc.text(`Status: Verified Lifetime Pro Vault Access`, 44, 126);

      // Footer note
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Confidential & Proprietary. Created by TradingHath (tradinghath@gmail.com). All rights reserved.', 36, pageHeight - 20);

      // 2. CHART PAGES
      for (let i = 0; i < allCharts.length; i++) {
        const chart = allCharts[i];
        setPdfProgress(`Adding chart ${i + 1} of ${allCharts.length}: ${chart.title.slice(0, 25)}...`);

        doc.addPage('a4', 'landscape');

        // Dark background
        doc.setFillColor(10, 13, 20);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // Top Banner
        doc.setFillColor(17, 24, 39);
        doc.rect(0, 0, pageWidth, 22, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(0, 229, 255);
        doc.text(`CHART #${i + 1}`, 14, 14);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        const titleTrimmed = chart.title.length > 55 ? `${chart.title.slice(0, 55)}...` : chart.title;
        doc.text(titleTrimmed, 46, 14);

        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text(`TradingHath Vault`, pageWidth - 45, 14);

        // Chart Image Processing
        const imgUrl = chart.chartUrl || chart.downloadUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200';
        const imgResult = await loadImageDataUrl(imgUrl);

        const imgX = 14;
        const imgY = 28;
        const maxImgWidth = pageWidth - 28;
        const maxImgHeight = pageHeight - 65;

        if (imgResult) {
          let renderW = maxImgWidth;
          let renderH = (imgResult.height / imgResult.width) * renderW;
          if (renderH > maxImgHeight) {
            renderH = maxImgHeight;
            renderW = (imgResult.width / imgResult.height) * renderH;
          }
          const centeredX = imgX + (maxImgWidth - renderW) / 2;
          doc.addImage(imgResult.dataUrl, 'JPEG', centeredX, imgY, renderW, renderH, undefined, 'FAST');
        } else {
          // Fallback placeholder box
          doc.setFillColor(20, 28, 45);
          doc.rect(imgX, imgY, maxImgWidth, maxImgHeight, 'F');
          doc.setTextColor(148, 163, 184);
          doc.setFontSize(12);
          doc.text(`[${chart.title}]`, pageWidth / 2, imgY + maxImgHeight / 2, { align: 'center' });
        }

        // Bottom Description Box
        const descBoxY = pageHeight - 32;
        doc.setFillColor(15, 20, 32);
        doc.roundedRect(14, descBoxY, pageWidth - 28, 24, 3, 3, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(0, 229, 255);
        doc.text('Key Strategy Rule:', 18, descBoxY + 7);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(226, 232, 240);
        const cleanDesc = (chart.description || 'Master level price action setup and trade management rules.')
          .replace(/\r?\n|\r/g, ' ');
        const wrappedDesc = doc.splitTextToSize(cleanDesc, pageWidth - 65);
        doc.text(wrappedDesc.slice(0, 2), 18, descBoxY + 14);

        // Page Number
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Page ${i + 2} of ${allCharts.length + 1}`, pageWidth - 36, descBoxY + 14);
      }

      setPdfProgress('Finalizing and saving PDF...');
      const cleanDate = new Date().toISOString().slice(0, 10);
      doc.save(`TradingHath_All_Charts_Vault_${cleanDate}.pdf`);
    } catch (pdfErr) {
      console.error('PDF Generation Error:', pdfErr);
      alert('Could not compile PDF. Please try again or download charts individually.');
    } finally {
      setPdfDownloading(false);
      setPdfProgress('');
    }
  };

  if (checkingAccess) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f7f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5624d0', fontWeight: '700' }}>
        Verifying Membership Access...
      </div>
    );
  }

  // STRICT PAYWALL: If user is not Pro, block all charts and videos completely!
  if (!isPro) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f7f9fa', color: '#1c1d1f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d1d7dc', borderRadius: '12px', padding: '36px 28px', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#f3ecfc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <Lock size={30} color="#5624d0" />
          </div>
          <span style={{ fontSize: '11px', color: '#5624d0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Membership Required
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: '800', marginTop: '6px', marginBottom: '8px', color: '#1c1d1f' }}>
            Vault Access Locked
          </h2>
          <p style={{ fontSize: '13px', color: '#6a6f73', lineHeight: '1.5', marginBottom: '24px' }}>
            Hello <b>{user?.username || 'Trader'}</b>! Hand-made charts and side-by-side video explanations require verified <b>₹399 Lifetime Access</b>.
          </p>

          <a
            href="https://rzp.io/rzp/2a3h6cU"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-trading-glow"
            style={{ width: '100%', padding: '14px', fontSize: '14px', textDecoration: 'none', display: 'block', marginBottom: '12px', borderRadius: '6px' }}
          >
            Pay ₹399 via UPI / Razorpay
          </a>

          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              width: '100%',
              backgroundColor: '#f7f9fa',
              border: '1px solid #d1d7dc',
              color: '#1c1d1f',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '700',
              textDecoration: 'none',
              marginBottom: '10px'
            }}
          >
            <ArrowLeft size={16} /> Back to Homepage
          </Link>

          <Link
            href="/"
            style={{
              display: 'block',
              width: '100%',
              backgroundColor: 'transparent',
              border: '1px solid #d1d7dc',
              color: '#6a6f73',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '12px',
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
              color: '#c02424',
              cursor: 'pointer',
              marginTop: '16px',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f9fa', color: '#1c1d1f' }}>

      {/* Top Navigation Bar - Udemy Clean White with crisp border */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
        borderBottom: '1px solid #d1d7dc',
        padding: '12px 24px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Brand Logo & Back to Home */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link
              href="/"
              title="Return to Home"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#f7f9fa',
                border: '1px solid #d1d7dc',
                color: '#1c1d1f',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <ArrowLeft size={18} />
            </Link>

            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <Image
                src="/logo/general-profile-picture.png"
                alt="TradingHath Logo"
                width={38}
                height={38}
                style={{ borderRadius: '50%', border: '2px solid #5624d0' }}
              />
              <div>
                <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.3px', color: '#1c1d1f' }}>
                  Trading<span style={{ color: '#5624d0' }}>Hath</span>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '10.5px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                    backgroundColor: isPro ? '#f3ecfc' : '#fee2e2',
                    color: isPro ? '#5624d0' : '#b91c1c',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: '800'
                  }}>
                    {isPro ? 'Lifetime Pro' : 'Free Account'}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* User Status, Profile & Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* User Profile Pill Button */}
            <button
              onClick={() => setShowProfileModal(true)}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d7dc',
                borderRadius: '8px',
                padding: '7px 14px',
                color: '#1c1d1f',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
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
              <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.username || 'My Profile'}
              </span>
              <ChevronDown size={14} color="#6a6f73" />
            </button>

            {/* Platform Guide / Directions Button */}
            <button
              onClick={() => setShowGuideModal(true)}
              style={{
                background: '#ffffff',
                border: '1px solid #d1d7dc',
                color: '#2d2f31',
                padding: '7px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '600',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <Compass size={15} color="#5624d0" />
              <span>Guide</span>
            </button>

            {/* Admin Panel Direct Button (Visible to admin) */}
            {isAdmin && (
              <Link
                href="/admin"
                style={{
                  background: '#1c1d1f',
                  border: '1px solid #1c1d1f',
                  color: '#fff',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '700'
                }}
              >
                <ShieldAlert size={14} color="#ff7b72" /> Admin Panel
              </Link>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#c02424',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                fontWeight: '600',
                padding: '6px 8px'
              }}
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px 80px 24px' }}>
        
        {/* User Account & Platform Direction Dashboard Banner */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #d1d7dc',
          borderRadius: '8px',
          padding: '24px 28px',
          marginBottom: '28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#f3ecfc',
                border: '2px solid #5624d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                color: '#5624d0',
                fontSize: '18px'
              }}>
                {(user?.username || 'T')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1c1d1f', margin: 0 }}>
                    Welcome back, {user?.username || 'Trader'}!
                  </h2>
                  <span style={{
                    fontSize: '11px',
                    backgroundColor: isPro ? '#ecfdf5' : '#fee2e2',
                    color: isPro ? '#107a3f' : '#c02424',
                    border: isPro ? '1px solid #a7f3d0' : '1px solid #fecaca',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontWeight: '800'
                  }}>
                    {isPro ? '✓ LIFETIME PRO ACTIVE' : 'FREE / REVOKED'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#6a6f73', marginTop: '4px' }}>
                  Enrolled Account: <span style={{ color: '#1c1d1f', fontWeight: '600' }}>{user?.email || 'member@tradinghath.com'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isAdmin && (
                <Link
                  href="/admin"
                  style={{
                    background: '#5624d0',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ShieldAlert size={15} /> Admin Console
                </Link>
              )}

              <button
                onClick={() => setShowProfileModal(true)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #1c1d1f',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  color: '#1c1d1f',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <User size={14} /> Profile & Settings
              </button>
            </div>
          </div>

          {/* Quick Step-by-Step Platform Directions */}
          <div style={{
            backgroundColor: '#f7f9fa',
            border: '1px solid #d1d7dc',
            borderRadius: '8px',
            padding: '14px 18px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#f3ecfc', color: '#5624d0', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>1</span>
              <div style={{ fontSize: '12.5px', color: '#2d2f31' }}>
                <b style={{ color: '#1c1d1f' }}>Hand-Made Charts:</b> Tap any chart card below to view the setup blueprint and download it to your phone gallery.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#f3ecfc', color: '#5624d0', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>2</span>
              <div style={{ fontSize: '12.5px', color: '#2d2f31' }}>
                <b style={{ color: '#1c1d1f' }}>Side-by-Side Video:</b> Each chart has its exact explanation reel running side-by-side on phone or PC.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#f3ecfc', color: '#5624d0', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>3</span>
              <div style={{ fontSize: '12.5px', color: '#2d2f31' }}>
                <b style={{ color: '#1c1d1f' }}>Language Vault:</b> Switch between English and Telugu reels anytime using the language filters.
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
          borderBottom: '1px solid #d1d7dc',
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
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                border: activeTab === 'charts' ? '1.5px solid #1c1d1f' : '1px solid #d1d7dc',
                backgroundColor: activeTab === 'charts' ? '#1c1d1f' : '#ffffff',
                color: activeTab === 'charts' ? '#ffffff' : '#2d2f31',
                boxShadow: activeTab === 'charts' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
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
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                border: activeTab === 'videos' ? '1.5px solid #5624d0' : '1px solid #d1d7dc',
                backgroundColor: activeTab === 'videos' ? '#5624d0' : '#ffffff',
                color: activeTab === 'videos' ? '#ffffff' : '#2d2f31',
                boxShadow: activeTab === 'videos' ? '0 2px 6px rgba(86, 36, 208, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Film size={16} /> Video Library Vault ({posts.filter(p => p.type === 'video').length})
            </button>
          </div>

          {/* Language Selector with Clean Pill Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: '#6a6f73', fontWeight: '600' }}>Filter Language:</span>
            {[
              { id: 'all', label: 'All Reels', count: posts.filter(p => p.type === 'video').length },
              { id: 'telugu', label: 'Telugu', count: posts.filter(p => p.type === 'video' && (p.language === 'telugu' || p.language === 'both')).length },
              { id: 'english', label: 'English', count: posts.filter(p => p.type === 'video' && (p.language === 'english' || p.language === 'both')).length }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setLanguageFilter(item.id as any)}
                style={{
                  fontSize: '12.5px',
                  fontWeight: '700',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: languageFilter === item.id ? '1.5px solid #5624d0' : '1px solid #d1d7dc',
                  cursor: 'pointer',
                  backgroundColor: languageFilter === item.id ? '#f3ecfc' : '#ffffff',
                  color: languageFilter === item.id ? '#5624d0' : '#2d2f31',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{item.label}</span>
                <span style={{
                  fontSize: '11px',
                  backgroundColor: languageFilter === item.id ? '#5624d0' : '#e4e8eb',
                  color: languageFilter === item.id ? '#ffffff' : '#2d2f31',
                  padding: '1px 7px',
                  borderRadius: '10px',
                  fontWeight: '800'
                }}>
                  {item.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar for Vault Charts & Videos - Udemy Pill Style */}
        <div style={{
          marginBottom: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '680px'
          }}>
            <Search
              size={18}
              color={searchQuery ? '#5624d0' : '#6a6f73'}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                transition: 'color 0.15s ease'
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab === 'charts' ? 'charts' : 'videos'} by name or keyword (e.g. "fvg", "liquidity", "secret", "trap")...`}
              style={{
                width: '100%',
                backgroundColor: '#ffffff',
                border: searchQuery ? '1.5px solid #5624d0' : '1px solid #1c1d1f',
                borderRadius: '9999px',
                padding: '13px 44px 13px 46px',
                fontSize: '14px',
                color: '#1c1d1f',
                outline: 'none',
                boxShadow: searchQuery ? '0 0 0 3px rgba(86, 36, 208, 0.15)' : 'none',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                title="Clear search"
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#f0f2f5',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6a6f73',
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {searchQuery.trim() && (
            <div style={{ fontSize: '13px', color: '#6a6f73', display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '6px' }}>
              <span>
                Found <b style={{ color: '#5624d0' }}>{filteredPosts.length}</b> {activeTab === 'charts' ? 'chart(s)' : 'video(s)'} matching "{searchQuery}"
              </span>
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#5624d0',
                  fontWeight: '700',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: 0
                }}
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: CHARTS WITH SIDE-BY-SIDE VIDEO EXPLANATION */}
        {activeTab === 'charts' && (
          <div>
            {/* Active Chart & Side Video Viewer */}
            {selectedChart && (
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d7dc',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '36px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '18px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <span style={{
                      fontSize: '11px',
                      color: '#5624d0',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      ⚡ Active Setup Blueprint & Video Breakdown
                    </span>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', marginTop: '4px', color: '#1c1d1f' }}>
                      {selectedChart.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Back / Close Chart Viewer Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChart(null);
                        const gridElem = document.getElementById('charts-grid-section');
                        if (gridElem) {
                          gridElem.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #1c1d1f',
                        color: '#1c1d1f',
                        padding: '9px 15px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                      title="Close this chart and return to browse all charts"
                    >
                      <ArrowLeft size={16} color="#1c1d1f" /> Back to All Charts
                    </button>

                    {/* Expand Button */}
                    <button
                      type="button"
                      onClick={() => setIsChartExpanded(true)}
                      style={{
                        backgroundColor: '#f7f9fa',
                        border: '1px solid #d1d7dc',
                        color: '#2d2f31',
                        padding: '9px 15px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Maximize2 size={15} /> Expand Fullscreen
                    </button>

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
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #d1d7dc',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      padding: '10px 14px',
                      backgroundColor: '#f7f9fa',
                      borderBottom: '1px solid #d1d7dc',
                      fontSize: '12px',
                      color: '#2d2f31',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontWeight: '700', color: '#1c1d1f' }}>Hand-Made Setup Blueprint</span>
                      <button
                        type="button"
                        onClick={() => setIsChartExpanded(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#5624d0',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: '700'
                        }}
                      >
                        <Maximize2 size={13} /> Click to Expand
                      </button>
                    </div>

                    {/* Visual Chart with Click-to-Expand */}
                    <div 
                      onClick={() => setIsChartExpanded(true)}
                      style={{ 
                        position: 'relative', 
                        height: '380px', 
                        width: '100%', 
                        backgroundColor: '#f7f9fa',
                        cursor: 'zoom-in',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Click to expand chart fullscreen"
                    >
                      <UnifiedChartImage
                        src={selectedChart.chartUrl}
                        alt={selectedChart.title}
                        style={{ maxHeight: '380px', objectFit: 'contain' }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        backgroundColor: 'rgba(28, 29, 31, 0.85)',
                        backdropFilter: 'blur(6px)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#ffffff',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <Eye size={13} /> Tap to Zoom / View Full Dimensions
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Protected Video Explanation Beside the Chart with Telugu & English Switcher */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #d1d7dc',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      padding: '10px 14px',
                      backgroundColor: '#f7f9fa',
                      borderBottom: '1px solid #d1d7dc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <PlayCircle size={15} color="#5624d0" />
                        <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#1c1d1f' }}>Reel Video Breakdown</span>
                      </div>

                      {/* Language Switcher Buttons (Telugu vs English) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setChartLanguage('telugu')}
                          style={{
                            backgroundColor: chartLanguage === 'telugu' ? '#5624d0' : '#ffffff',
                            color: chartLanguage === 'telugu' ? '#ffffff' : '#2d2f31',
                            border: chartLanguage === 'telugu' ? '1px solid #5624d0' : '1px solid #d1d7dc',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: '800',
                            cursor: 'pointer'
                          }}
                        >
                          Telugu
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartLanguage('english')}
                          style={{
                            backgroundColor: chartLanguage === 'english' ? '#5624d0' : '#ffffff',
                            color: chartLanguage === 'english' ? '#ffffff' : '#2d2f31',
                            border: chartLanguage === 'english' ? '1px solid #5624d0' : '1px solid #d1d7dc',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: '800',
                            cursor: 'pointer'
                          }}
                        >
                          English
                        </button>
                      </div>
                    </div>

                    {/* Responsive Video Player Playing the Chosen Language Video */}
                    <div style={{ position: 'relative', height: '380px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UnifiedVideoPlayer
                        key={`${selectedChart.id}_${chartLanguage}`}
                        src={
                          chartLanguage === 'english'
                            ? (selectedChart.videoUrlEnglish || (selectedChart.language === 'english' ? selectedChart.videoUrl : ''))
                            : (selectedChart.videoUrlTelugu || (selectedChart.language === 'telugu' ? selectedChart.videoUrl : ''))
                        }
                        title={`${selectedChart.title} (${chartLanguage})`}
                        maxHeight="380px"
                      />
                    </div>

                    <div style={{
                      padding: '8px 14px',
                      backgroundColor: '#f7f9fa',
                      borderTop: '1px solid #d1d7dc',
                      fontSize: '11px',
                      color: '#6a6f73',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>Language Track: <b style={{ color: '#1c1d1f' }}>{chartLanguage.toUpperCase()}</b></span>
                      <span style={{ color: '#b4690e', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}>
                        <Lock size={11} /> Video protected (charts downloadable)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Setup Strategy Description */}
                <div style={{ marginTop: '16px', padding: '14px', backgroundColor: '#f7f9fa', borderRadius: '8px', border: '1px solid #d1d7dc' }}>
                  <p style={{ fontSize: '13px', color: '#2d2f31', lineHeight: '1.6', margin: 0 }}>
                    <b style={{ color: '#5624d0' }}>Setup Strategy: </b>
                    {selectedChart.description}
                  </p>
                </div>
              </div>
            )}

            {/* Hand-Made Charts Header with 1-Click PDF Download Button */}
            <div id="charts-grid-section" style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div>
                <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#1c1d1f', margin: 0 }}>
                  All Hand-Made Trading Charts
                </h3>
                <span style={{ fontSize: '13px', color: '#6a6f73' }}>
                  Total {posts.filter(p => p.type === 'chart').length} institutional price action blueprints currently in vault
                </span>
              </div>

              {/* 1-Click Master PDF Download Button */}
              <button
                type="button"
                onClick={handleDownloadAllChartsPdf}
                disabled={pdfDownloading}
                className="btn-trading-glow"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: pdfDownloading ? 'wait' : 'pointer',
                  backgroundColor: pdfDownloading ? '#6b46c1' : '#5624d0',
                  color: '#ffffff',
                  border: 'none',
                  boxShadow: '0 2px 6px rgba(86, 36, 208, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                {pdfDownloading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>{pdfProgress || 'Building PDF...'}</span>
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    <span>Download All Charts in 1 PDF (Pro)</span>
                  </>
                )}
              </button>
            </div>
            {filteredPosts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 20px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px dashed #d1d7dc'
              }}>
                <Search size={36} color="#6a6f73" style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1c1d1f', marginBottom: '6px' }}>
                  No charts found matching "{searchQuery}"
                </h4>
                <p style={{ fontSize: '13px', color: '#6a6f73', maxWidth: '400px', margin: '0 auto 16px auto' }}>
                  Try searching for words like "fvg", "liquidity", "secret", "order block", or "trap".
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    backgroundColor: '#f7f9fa',
                    border: '1px solid #1c1d1f',
                    color: '#1c1d1f',
                    padding: '8px 18px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Clear Search Filter
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      setSelectedChart(post);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    style={{
                      backgroundColor: '#ffffff',
                      border: selectedChart?.id === post.id ? '2px solid #5624d0' : '1px solid #d1d7dc',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      boxShadow: selectedChart?.id === post.id ? '0 4px 12px rgba(86, 36, 208, 0.15)' : '0 1px 4px rgba(0,0,0,0.06)'
                    }}
                  >
                    <div style={{ position: 'relative', height: '170px', width: '100%', backgroundColor: '#f7f9fa', overflow: 'hidden' }}>
                      <UnifiedChartImage
                        src={post.chartUrl}
                        alt={post.title}
                        style={{ height: '170px', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        backgroundColor: '#eceb98',
                        color: '#3d3c0a',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '10.5px',
                        fontWeight: '800'
                      }}>
                        Bestseller
                      </div>
                    </div>

                    <div style={{ padding: '14px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px', color: '#1c1d1f', lineHeight: '1.3' }}>
                        {post.title}
                      </h4>
                      <p style={{ fontSize: '12.5px', color: '#6a6f73', lineHeight: '1.4', marginBottom: '12px' }}>
                        {post.description.slice(0, 75)}...
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid #f0f2f5' }}>
                        <span style={{ fontSize: '11.5px', color: '#5624d0', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <PlayCircle size={14} /> View Breakdown
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadChart(e, post.downloadUrl || post.chartUrl || '', post.title);
                          }}
                          style={{
                            backgroundColor: '#f7f9fa',
                            border: '1px solid #d1d7dc',
                            color: '#1c1d1f',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Download size={12} /> Save
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VIDEOS SECTION (23+ Telugu & English Reels) */}
        {activeTab === 'videos' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#1c1d1f', margin: '0 0 4px 0' }}>
                Complete Video Vault (English & Telugu)
              </h3>
              <p style={{ fontSize: '13px', color: '#6a6f73' }}>
                Watch proprietary market structure, trap identification, and volume strategies on demand. Video downloading is strictly restricted.
              </p>
            </div>

            {filteredPosts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 20px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px dashed #d1d7dc'
              }}>
                <Search size={36} color="#6a6f73" style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1c1d1f', marginBottom: '6px' }}>
                  No videos found matching "{searchQuery}"
                </h4>
                <p style={{ fontSize: '13px', color: '#6a6f73', maxWidth: '400px', margin: '0 auto 16px auto' }}>
                  Try searching for words like "fvg", "volume", "secret", "reversal", or "trap".
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    backgroundColor: '#f7f9fa',
                    border: '1px solid #1c1d1f',
                    color: '#1c1d1f',
                    padding: '8px 18px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Clear Search Filter
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                gap: '20px'
              }}>
                {filteredPosts.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #d1d7dc',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                    }}
                  >
                    {/* Protected Video Element Supporting IndexedDB & Local Uploads */}
                    <div style={{ position: 'relative', height: '220px', backgroundColor: '#000000' }}>
                      <UnifiedVideoPlayer
                        src={item.videoUrl}
                        title={item.title}
                        maxHeight="220px"
                      />
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        backgroundColor: '#5624d0',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '10.5px',
                        color: '#ffffff',
                        fontWeight: '700',
                        textTransform: 'capitalize',
                        zIndex: 5
                      }}>
                        {item.language}
                      </div>
                    </div>

                    <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1c1d1f', marginBottom: '4px', lineHeight: '1.3' }}>
                          {item.title}
                        </h4>
                        <p style={{ fontSize: '12.5px', color: '#6a6f73', lineHeight: '1.4' }}>
                          {item.description || 'Master level price action setup and trade management rules.'}
                        </p>
                      </div>

                      <div style={{
                        marginTop: '12px',
                        paddingTop: '8px',
                        borderTop: '1px solid #f0f2f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        color: '#6a6f73'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#137333', fontWeight: '600' }}>
                          <ShieldCheck size={13} color="#137333" /> TradingHath Verified
                        </span>
                        <span style={{ color: '#b4690e', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}>
                          <Lock size={11} /> Protected Reel
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL 1: USER PROFILE DETAILS MODAL */}
        {showProfileModal && (
          <div 
            onClick={() => setShowProfileModal(false)}
            style={{
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
              zIndex: 999999,
              padding: '16px',
              cursor: 'pointer'
            }}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d7dc',
                borderRadius: '12px',
                maxWidth: '460px',
                width: '100%',
                padding: '24px',
                cursor: 'default',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={20} color="#5624d0" />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1c1d1f', margin: 0 }}>My Account Profile</h3>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  style={{ background: 'none', border: 'none', color: '#6a6f73', fontSize: '20px', cursor: 'pointer', padding: '4px' }}
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
                backgroundColor: '#f7f9fa',
                border: '1px solid #d1d7dc',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#5624d0',
                  color: '#ffffff',
                  fontSize: '22px',
                  fontWeight: '900',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {(user?.username || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#1c1d1f', margin: '0 0 4px 0' }}>
                    {user?.username || 'Trader'}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      backgroundColor: '#e6f4ea',
                      color: '#137333',
                      border: '1px solid #ceead6',
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
                <div style={{ padding: '12px', backgroundColor: '#f7f9fa', borderRadius: '8px', border: '1px solid #d1d7dc' }}>
                  <div style={{ fontSize: '11.5px', color: '#6a6f73', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Username</div>
                  <div style={{ fontSize: '14px', color: '#1c1d1f', fontWeight: '600' }}>{user?.username || 'Trader'}</div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#f7f9fa', borderRadius: '8px', border: '1px solid #d1d7dc' }}>
                  <div style={{ fontSize: '11.5px', color: '#6a6f73', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Registered Email (Gmail)</div>
                  <div style={{ fontSize: '14px', color: '#5624d0', fontWeight: '600' }}>{user?.email || 'member@tradinghath.com'}</div>
                </div>

                {user?.phone && (
                  <div style={{ padding: '12px', backgroundColor: '#f7f9fa', borderRadius: '8px', border: '1px solid #d1d7dc' }}>
                    <div style={{ fontSize: '11.5px', color: '#6a6f73', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Phone Number</div>
                    <div style={{ fontSize: '14px', color: '#1c1d1f', fontWeight: '600' }}>{user?.phone}</div>
                  </div>
                )}

                <div style={{ padding: '12px', backgroundColor: '#f7f9fa', borderRadius: '8px', border: '1px solid #d1d7dc' }}>
                  <div style={{ fontSize: '11.5px', color: '#6a6f73', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Membership Status</div>
                  <div style={{ fontSize: '13px', color: '#137333', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} /> ₹399 Lifetime Access Unlocked (All Videos & Charts)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {isAdmin && (
                  <Link
                    href="/admin"
                    style={{
                      padding: '11px 16px',
                      borderRadius: '6px',
                      backgroundColor: '#1c1d1f',
                      border: '1px solid #1c1d1f',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '700',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <ShieldAlert size={15} /> Admin
                  </Link>
                )}
                <button
                  onClick={() => setShowProfileModal(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    backgroundColor: '#5624d0',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '700'
                  }}
                >
                  Close
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '11px 16px',
                    borderRadius: '6px',
                    backgroundColor: '#fce8e6',
                    border: '1px solid #f9dedc',
                    color: '#c5221f',
                    fontSize: '13px',
                    fontWeight: '700',
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
          <div 
            onClick={() => setShowGuideModal(false)}
            style={{
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
              zIndex: 999999,
              padding: '16px',
              cursor: 'pointer'
            }}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d7dc',
                borderRadius: '12px',
                maxWidth: '520px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '24px',
                cursor: 'default',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Compass size={22} color="#5624d0" />
                  <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#1c1d1f', margin: 0 }}>Website Directions & Guide</h3>
                </div>
                <button
                  onClick={() => setShowGuideModal(false)}
                  style={{ background: 'none', border: 'none', color: '#6a6f73', fontSize: '20px', cursor: 'pointer', padding: '4px' }}
                >
                  ✕
                </button>
              </div>

              <p style={{ fontSize: '13px', color: '#6a6f73', lineHeight: '1.5', marginBottom: '20px' }}>
                Welcome to TradingHath! Here are simple, step-by-step directions on how to navigate, study setups, and download blueprints directly to your device:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {/* Step 1 */}
                <div style={{ display: 'flex', gap: '12px', padding: '14px', backgroundColor: '#f7f9fa', borderRadius: '8px', border: '1px solid #d1d7dc' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#f3ecfc', color: '#5624d0', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    1
                  </div>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: '700', color: '#1c1d1f', margin: '0 0 4px 0' }}>Viewing Hand-Made Setup Charts</h5>
                    <p style={{ fontSize: '12.5px', color: '#6a6f73', margin: 0, lineHeight: '1.4' }}>
                      Tap the <b>"Hand-Made Charts"</b> tab. Click on any setup card in the grid to display its high-resolution blueprint in the top view screen.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: '12px', padding: '14px', backgroundColor: '#f7f9fa', borderRadius: '8px', border: '1px solid #d1d7dc' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e6f4ea', color: '#137333', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    2
                  </div>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: '700', color: '#1c1d1f', margin: '0 0 4px 0' }}>Saving Charts to Phone Gallery</h5>
                    <p style={{ fontSize: '12.5px', color: '#6a6f73', margin: 0, lineHeight: '1.4' }}>
                      Click <b>"Save Chart to Gallery"</b>. The high-resolution chart will download straight into your phone's Photos or Downloads folder.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: '12px', padding: '14px', backgroundColor: '#f7f9fa', borderRadius: '8px', border: '1px solid #d1d7dc' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#f3ecfc', color: '#5624d0', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    3
                  </div>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: '700', color: '#1c1d1f', margin: '0 0 4px 0' }}>Side-by-Side Video Explanations</h5>
                    <p style={{ fontSize: '12.5px', color: '#6a6f73', margin: 0, lineHeight: '1.4' }}>
                      Beside each chart blueprint is its video explanation reel. You can watch the full institutional trap formula while referencing the chart simultaneously.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div style={{ display: 'flex', gap: '12px', padding: '14px', backgroundColor: '#f7f9fa', borderRadius: '8px', border: '1px solid #d1d7dc' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fef7e0', color: '#b06000', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    4
                  </div>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: '700', color: '#1c1d1f', margin: '0 0 4px 0' }}>Complete Video Library & Language Filter</h5>
                    <p style={{ fontSize: '12.5px', color: '#6a6f73', margin: 0, lineHeight: '1.4' }}>
                      Click <b>"Video Library"</b> to watch all 23+ institutional reels. Use the <b>All / English / Telugu</b> pills to filter by your preferred language.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowGuideModal(false)}
                className="btn-trading-glow"
                style={{ width: '100%', padding: '12px', fontSize: '14px', cursor: 'pointer', borderRadius: '6px' }}
              >
                Got It, Let's Start Trading!
              </button>
            </div>
          </div>
        )}

        {/* MODAL 3: FULLSCREEN EXPANDED CHART LIGHTBOX (Tap to Zoom & Download to Gallery) */}
        {isChartExpanded && selectedChart && (
          <div
            onClick={() => setIsChartExpanded(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.94)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 9999999,
              padding: '16px'
            }}
          >
            {/* Header bar */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: '#00e5ff', fontWeight: '800', textTransform: 'uppercase' }}>
                  Fullscreen Blueprint View
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: '2px 0 0 0' }}>
                  {selectedChart.title}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={(e) => handleDownloadChart(e, selectedChart.downloadUrl || selectedChart.chartUrl || '', selectedChart.title)}
                  className="btn-trading-glow"
                  style={{ fontSize: '12.5px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={15} /> Save to Gallery
                </button>

                <button
                  type="button"
                  onClick={() => setIsChartExpanded(false)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#fff',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Close Fullscreen"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Expanded Chart Image Container */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: 1,
                position: 'relative',
                width: '100%',
                maxHeight: 'calc(100vh - 120px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              <UnifiedChartImage
                src={selectedChart.chartUrl}
                alt={selectedChart.title}
                style={{ maxHeight: 'calc(100vh - 130px)', objectFit: 'contain' }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
