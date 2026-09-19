'use client';

import React, { useState, useEffect } from 'react';
import { resolveMediaUrl } from '@/lib/videoStorage';
import { Play, AlertCircle, RefreshCw } from 'lucide-react';

interface UnifiedVideoPlayerProps {
  src?: string;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  maxHeight?: string;
}

export default function UnifiedVideoPlayer({
  src,
  title = 'Trading Video Lesson',
  style,
  maxHeight = '360px'
}: UnifiedVideoPlayerProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setHasError(false);

    if (!src) {
      setResolvedSrc(undefined);
      return;
    }

    if (src.startsWith('indexeddb://')) {
      setIsLoading(true);
      resolveMediaUrl(src)
        .then((url) => {
          if (isMounted) {
            setResolvedSrc(url);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setHasError(true);
            setIsLoading(false);
          }
        });
    } else {
      try {
        let targetUrl = src;
        
        // If relative /videos/ path and running in cloud/production (or not localhost),
        // stream from GitHub Media LFS CDN directly so Vercel doesn't serve the 134-byte LFS text pointer!
        if (targetUrl.startsWith('/videos/')) {
          if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('192.168.')) {
            targetUrl = `https://media.githubusercontent.com/media/tradinghath-rgb/tradinghath-web/main/public${targetUrl}`;
          }
        }

        if (targetUrl.startsWith('/') || targetUrl.startsWith('http')) {
          // Robust URI normalization:
          // Literal '%' characters in filenames (like reel-9(91% accurcy).mp4) crash decodeURI with URIError!
          // Replace literal % that isn't already a valid hex escape with %25
          const sanitized = targetUrl.replace(/%(?![0-9A-Fa-f]{2})/g, '%25');
          try {
            const clean = encodeURI(decodeURI(sanitized));
            setResolvedSrc(clean);
          } catch (uriErr) {
            // Fallback: encode spaces and parens safely without crashing
            const safeUrl = sanitized.replace(/ /g, '%20');
            setResolvedSrc(safeUrl);
          }
        } else {
          setResolvedSrc(targetUrl);
        }
      } catch (e) {
        setResolvedSrc(src);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [src]);

  if (!src) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: '220px',
          maxHeight,
          backgroundColor: '#111827',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 20px',
          textAlign: 'center',
          borderRadius: '8px',
          ...style
        }}
      >
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          backgroundColor: 'rgba(86, 36, 208, 0.15)',
          border: '1px solid rgba(86, 36, 208, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px'
        }}>
          <Play size={24} color="#a78bfa" style={{ marginLeft: '3px' }} />
        </div>
        <div style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>
          Video Will Be Uploaded Soon
        </div>
        <p style={{ fontSize: '12px', color: '#9ca3af', maxWidth: '300px', lineHeight: '1.5', margin: 0 }}>
          The video breakdown for this setup is being prepared and will be added here shortly.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: '200px',
          maxHeight,
          backgroundColor: '#090d16',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00e5ff',
          fontSize: '13px',
          ...style
        }}
      >
        <RefreshCw size={24} className="animate-spin" style={{ marginBottom: '8px' }} />
        <span>Loading Media...</span>
      </div>
    );
  }

  // Handle YouTube links (Unlisted videos styled like native player)
  const isYouTube = resolvedSrc?.includes('youtube.com') || resolvedSrc?.includes('youtu.be');
  if (isYouTube && resolvedSrc) {
    let videoId = '';
    if (resolvedSrc.includes('youtu.be/')) {
      videoId = resolvedSrc.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (resolvedSrc.includes('watch?v=')) {
      videoId = resolvedSrc.split('watch?v=')[1]?.split('&')[0] || '';
    } else if (resolvedSrc.includes('/embed/')) {
      videoId = resolvedSrc.split('/embed/')[1]?.split('?')[0] || '';
    } else if (resolvedSrc.includes('/shorts/')) {
      videoId = resolvedSrc.split('/shorts/')[1]?.split('?')[0] || '';
    }

    // Stealth parameters to strip YouTube branding, recommendations, titles, and overlays
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&controls=1&iv_load_policy=3&disablekb=0&fs=1&playsinline=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;

    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: '200px',
          maxHeight,
          overflow: 'hidden',
          backgroundColor: '#000000',
          borderRadius: '10px',
          ...style
        }}
      >
        <iframe
          src={embedUrl}
          title={title}
          style={{
            position: 'absolute',
            top: '-55px', // Trims the YouTube top header (title, avatar, watch later icon)
            left: 0,
            width: '100%',
            height: 'calc(100% + 55px)', // Compensates for the offset so full video & controls remain visible
            border: 'none'
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // If playback failed
  if (hasError) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: '200px',
          maxHeight,
          backgroundColor: '#090d16',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f87171',
          padding: '16px',
          textAlign: 'center',
          fontSize: '13px',
          ...style
        }}
      >
        <AlertCircle size={28} style={{ marginBottom: '8px' }} />
        <span style={{ fontWeight: '600' }}>Video playback could not be loaded</span>
        <button
          type="button"
          onClick={() => {
            setHasError(false);
          }}
          style={{
            marginTop: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            borderRadius: '6px',
            padding: '4px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={12} /> Retry Playback
        </button>
      </div>
    );
  }

  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleGlobalPauseOthers = (e: Event) => {
      const customEvent = e as CustomEvent<{ playerId: string }>;
      if (videoRef.current && customEvent.detail?.playerId !== resolvedSrc) {
        if (!videoRef.current.paused) {
          videoRef.current.pause();
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('th_pause_other_videos', handleGlobalPauseOthers as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('th_pause_other_videos', handleGlobalPauseOthers as EventListener);
      }
    };
  }, [resolvedSrc]);

  const handlePlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    // 1. Immediately pause any other video elements present on the page
    if (typeof document !== 'undefined') {
      const allVideos = document.querySelectorAll('video');
      allVideos.forEach((v) => {
        if (v !== e.currentTarget && !v.paused) {
          v.pause();
        }
      });
    }

    // 2. Dispatch global event in case of iframe or separate instances
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('th_pause_other_videos', {
          detail: { playerId: resolvedSrc }
        })
      );
    }
  };

  return (
    <video
      ref={videoRef}
      key={resolvedSrc}
      controls
      playsInline
      preload="metadata"
      autoPlay={false}
      controlsList="nodownload"
      disablePictureInPicture
      onPlay={handlePlay}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        width: '100%',
        height: '100%',
        maxHeight,
        objectFit: 'contain',
        backgroundColor: '#000000',
        ...style
      }}
    >
      <source
        src={resolvedSrc}
        type="video/mp4"
        onError={(e) => {
          // Only flag error if there's a real failure loading
          console.warn('Video source error on:', resolvedSrc, e);
        }}
      />
      Your browser does not support the video tag.
    </video>
  );
}
