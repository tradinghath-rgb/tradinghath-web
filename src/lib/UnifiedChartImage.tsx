'use client';

import React, { useState, useEffect, useRef } from 'react';
import { resolveMediaUrl } from '@/lib/videoStorage';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UnifiedChartImageProps {
  src?: string;
  chartUrls?: string[];
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackSrc?: string;
  onClick?: () => void;
  onActiveIndexChange?: (index: number) => void;
  showNavigationControls?: boolean;
}

export default function UnifiedChartImage({
  src,
  chartUrls,
  alt = 'Trading Setup Chart',
  className,
  style,
  fallbackSrc = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
  onClick,
  onActiveIndexChange,
  showNavigationControls = true
}: UnifiedChartImageProps) {
  // Determine full list of images
  const imagesList = React.useMemo(() => {
    let list: string[] = [];
    if (chartUrls && chartUrls.length > 0) {
      list = chartUrls.filter(Boolean);
    } else if (src) {
      list = [src];
    }
    return list.length > 0 ? list : [fallbackSrc];
  }, [src, chartUrls, fallbackSrc]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [resolvedUrls, setResolvedUrls] = useState<string[]>(imagesList);

  // Touch handling for swipe gestures
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Keep index within bounds and reset to 0 when new chart/reel is loaded
  useEffect(() => {
    setCurrentIndex(0);
    onActiveIndexChange?.(0);
  }, [src, chartUrls]);

  useEffect(() => {
    if (currentIndex >= imagesList.length) {
      setCurrentIndex(0);
      onActiveIndexChange?.(0);
    }
  }, [imagesList.length, currentIndex, onActiveIndexChange]);

  // Resolve media URLs
  useEffect(() => {
    let isMounted = true;

    Promise.all(
      imagesList.map(async (imgSrc) => {
        if (!imgSrc) return fallbackSrc;

        if (imgSrc.startsWith('indexeddb://')) {
          try {
            const url = await resolveMediaUrl(imgSrc);
            return url || fallbackSrc;
          } catch {
            return fallbackSrc;
          }
        } else if (imgSrc.includes('youtube.com') || imgSrc.includes('youtu.be')) {
          let videoId = '';
          if (imgSrc.includes('youtu.be/')) videoId = imgSrc.split('youtu.be/')[1]?.split('?')[0] || '';
          else if (imgSrc.includes('watch?v=')) videoId = imgSrc.split('watch?v=')[1]?.split('&')[0] || '';
          else if (imgSrc.includes('/embed/')) videoId = imgSrc.split('/embed/')[1]?.split('?')[0] || '';
          else if (imgSrc.includes('/shorts/')) videoId = imgSrc.split('/shorts/')[1]?.split('?')[0] || '';

          return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : fallbackSrc;
        } else if (imgSrc.startsWith('/charts/')) {
          // If in production or cloud, or if local file is missing, GitHub raw repository serves the permanent copy
          if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('192.168.')) {
            return `https://raw.githubusercontent.com/tradinghath-rgb/tradinghath-web/main/public${imgSrc}`;
          }
        }
        return imgSrc;
      })
    ).then((resolved) => {
      if (isMounted) {
        setResolvedUrls(resolved);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [imagesList, fallbackSrc]);

  const goToNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentIndex < imagesList.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      onActiveIndexChange?.(nextIdx);
    }
  };

  const goToPrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      onActiveIndexChange?.(prevIdx);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45; // 45px minimum threshold for swipe

    if (diff > minSwipeDistance) {
      // Swiped Left -> show next chart
      goToNext();
    } else if (diff < -minSwipeDistance) {
      // Swiped Right -> show previous chart
      goToPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentSrc = resolvedUrls[currentIndex] || fallbackSrc;
  const hasMultiple = imagesList.length > 1;

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        overflow: 'hidden'
      }}
    >
      <img
        src={currentSrc}
        alt={`${alt} ${hasMultiple ? `(Chart ${currentIndex + 1} of ${imagesList.length})` : ''}`}
        onClick={onClick}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          ...style
        }}
        onError={(e) => {
          const currentUrl = e.currentTarget.src;
          if (currentUrl.includes('/charts/') && !currentUrl.includes('raw.githubusercontent.com')) {
            const chartPath = currentUrl.split('/charts/')[1];
            if (chartPath) {
              e.currentTarget.src = `https://raw.githubusercontent.com/tradinghath-rgb/tradinghath-web/main/public/charts/${chartPath}`;
              return;
            }
          }
          if (e.currentTarget.src !== fallbackSrc) {
            e.currentTarget.src = fallbackSrc;
          }
        }}
      />

      {/* Multiple Charts Indicator Pill */}
      {hasMultiple && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(28, 29, 31, 0.88)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            padding: '3px 9px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '700',
            zIndex: 10,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
          }}
        >
          <span>Chart {currentIndex + 1}/{imagesList.length}</span>
          <span style={{ fontSize: '9px', opacity: 0.8 }}>(Swipe ⇄)</span>
        </div>
      )}

      {/* Navigation Arrow Controls */}
      {hasMultiple && showNavigationControls && (
        <>
          {currentIndex > 0 && (
            <button
              type="button"
              onClick={goToPrev}
              title="Previous Chart"
              aria-label="Previous Chart"
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(28, 29, 31, 0.8)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                transition: 'background-color 0.15s ease'
              }}
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {currentIndex < imagesList.length - 1 && (
            <button
              type="button"
              onClick={goToNext}
              title="Next Chart"
              aria-label="Next Chart"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(28, 29, 31, 0.8)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                transition: 'background-color 0.15s ease'
              }}
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Dots Indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '6px',
              zIndex: 10,
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '4px 8px',
              borderRadius: '10px'
            }}
          >
            {imagesList.map((_, idx) => (
              <span
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                  onActiveIndexChange?.(idx);
                }}
                style={{
                  width: idx === currentIndex ? '16px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: idx === currentIndex ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

