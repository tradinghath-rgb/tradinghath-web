'use client';

import React, { useState, useEffect } from 'react';
import { resolveMediaUrl } from '@/lib/videoStorage';

interface UnifiedChartImageProps {
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackSrc?: string;
  onClick?: () => void;
}

export default function UnifiedChartImage({
  src,
  alt = 'Trading Setup Chart',
  className,
  style,
  fallbackSrc = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
  onClick
}: UnifiedChartImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string>(src || fallbackSrc);

  useEffect(() => {
    let isMounted = true;

    if (!src) {
      setResolvedSrc(fallbackSrc);
      return;
    }

    if (src.startsWith('indexeddb://')) {
      resolveMediaUrl(src)
        .then((url) => {
          if (isMounted) {
            setResolvedSrc(url || fallbackSrc);
          }
        })
        .catch(() => {
          if (isMounted) {
            setResolvedSrc(fallbackSrc);
          }
        });
    } else {
      setResolvedSrc(src);
    }

    return () => {
      isMounted = false;
    };
  }, [src, fallbackSrc]);

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onClick={onClick}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        display: 'block',
        ...style
      }}
      onError={(e) => {
        // Fallback to stock chart if uploaded image failed to render
        if (e.currentTarget.src !== fallbackSrc) {
          e.currentTarget.src = fallbackSrc;
        }
      }}
    />
  );
}
