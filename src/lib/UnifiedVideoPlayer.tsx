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
          // If already encoded or unencoded, decode then encodeURI to prevent double-encoding
          const clean = encodeURI(decodeURI(targetUrl));
          setResolvedSrc(clean);
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
          minHeight: '200px',
          maxHeight,
          backgroundColor: '#090d16',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          fontSize: '13px',
          ...style
        }}
      >
        <Play size={28} color="#64748b" style={{ marginBottom: '8px' }} />
        <span>No video file provided</span>
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

  // Handle YouTube links
  const isYouTube = resolvedSrc?.includes('youtube.com') || resolvedSrc?.includes('youtu.be');
  if (isYouTube && resolvedSrc) {
    let cleanUrl = resolvedSrc.includes('/embed/')
      ? resolvedSrc
      : resolvedSrc.replace('/shorts/', '/embed/').replace('watch?v=', 'embed/');
    cleanUrl = cleanUrl.replace(/([?&])autoplay=1(&|$)/g, '$1autoplay=0$2');
    if (!cleanUrl.includes('autoplay=')) {
      cleanUrl += (cleanUrl.includes('?') ? '&' : '?') + 'autoplay=0';
    }

    return (
      <iframe
        src={cleanUrl}
        title={title}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '200px',
          maxHeight,
          border: 'none',
          ...style
        }}
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
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

  return (
    <video
      key={resolvedSrc}
      controls
      playsInline
      preload="metadata"
      autoPlay={false}
      controlsList="nodownload"
      disablePictureInPicture
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
