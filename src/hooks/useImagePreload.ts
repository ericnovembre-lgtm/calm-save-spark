/**
 * Image Preloading Hooks
 * Preload critical images for faster LCP
 */
import { useEffect, useState, useCallback } from 'react';

interface PreloadStatus {
  loaded: string[];
  failed: string[];
  pending: string[];
  isComplete: boolean;
}

/**
 * Preload multiple images
 */
export function useImagePreload(
  urls: string[],
  priority: 'high' | 'low' = 'low'
): PreloadStatus {
  const [status, setStatus] = useState<PreloadStatus>({
    loaded: [],
    failed: [],
    pending: urls,
    isComplete: false,
  });

  useEffect(() => {
    if (urls.length === 0) {
      setStatus({ loaded: [], failed: [], pending: [], isComplete: true });
      return;
    }

    const loaded: string[] = [];
    const failed: string[] = [];
    let completed = 0;

    const checkComplete = () => {
      completed++;
      if (completed === urls.length) {
        setStatus({
          loaded,
          failed,
          pending: [],
          isComplete: true,
        });
      }
    };

    urls.forEach(url => {
      // Use link preload for high priority
      if (priority === 'high') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        link.onload = () => {
          loaded.push(url);
          checkComplete();
        };
        link.onerror = () => {
          failed.push(url);
          checkComplete();
        };
        document.head.appendChild(link);
        return;
      }

      // Use Image constructor for low priority
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loaded.push(url);
        checkComplete();
      };
      img.onerror = () => {
        failed.push(url);
        checkComplete();
      };
    });
  }, [urls.join(','), priority]);

  return status;
}

/**
 * Preload a single LCP image with high priority
 */
export function useLCPImagePreload(url: string | undefined): boolean {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!url) {
      setIsLoaded(true);
      return;
    }

    // Add preload link to head
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.fetchPriority = 'high';
    
    link.onload = () => setIsLoaded(true);
    link.onerror = () => setIsLoaded(true); // Still mark as loaded to unblock
    
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [url]);

  return isLoaded;
}

/**
 * Lazy preload images when idle
 */
export function useIdleImagePreload(urls: string[]): void {
  useEffect(() => {
    if (urls.length === 0) return;

    const preloadImages = () => {
      urls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    };

    // Use requestIdleCallback if available
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(preloadImages, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    } else {
      // Fallback to setTimeout
      const id = setTimeout(preloadImages, 200);
      return () => clearTimeout(id);
    }
  }, [urls.join(',')]);
}

/**
 * Progressive image loading with blur-up effect
 */
export function useProgressiveImage(
  lowQualitySrc: string,
  highQualitySrc: string
): { src: string; isHighQuality: boolean } {
  const [src, setSrc] = useState(lowQualitySrc);
  const [isHighQuality, setIsHighQuality] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = highQualitySrc;
    img.onload = () => {
      setSrc(highQualitySrc);
      setIsHighQuality(true);
    };
  }, [highQualitySrc]);

  return { src, isHighQuality };
}
