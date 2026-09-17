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
      setResolvedSrc(src);
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
        <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
          Format may be unsupported or file expired.
        </span>
      </div>
    );
  }

  return (
    <video
      key={resolvedSrc}
      src={resolvedSrc}
      controls
      preload="metadata"
      autoPlay={false}
      controlsList="nodownload"
      disablePictureInPicture
      onContextMenu={(e) => e.preventDefault()}
      onError={() => setHasError(true)}
      style={{
        width: '100%',
        height: '100%',
        maxHeight,
        objectFit: 'contain',
        backgroundColor: '#000000',
        ...style
      }}
    >
      <source src={resolvedSrc} type="video/mp4" />
      <source src={resolvedSrc} type="video/webm" />
      Your browser does not support the video tag.
    </video>
  );
}
