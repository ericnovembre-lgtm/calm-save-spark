/**
 * CloudinaryImage - Optimized image component with Cloudinary
 * 
 * Features:
 * - Automatic WebP/AVIF conversion
 * - Responsive srcset generation
 * - Blur-up placeholder loading
 * - Lazy loading with intersection observer
 */

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  getCloudinaryUrl, 
  getResponsiveSrcSet, 
  getBlurPlaceholder,
  getPotImageUrl,
  getAvatarUrl,
  getStoryImageUrl
} from '@/lib/cloudinary';

type ImageVariant = 'pot' | 'avatar' | 'story' | 'default';

interface CloudinaryImageProps {
  publicId: string;
  alt: string;
  variant?: ImageVariant;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const variantSizes: Record<ImageVariant, string> = {
  pot: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px',
  avatar: '100px',
  story: '(max-width: 640px) 100vw, 1080px',
  default: '100vw',
};

export function CloudinaryImage({
  publicId,
  alt,
  variant = 'default',
  width,
  height,
  priority = false,
  className,
  sizes,
  onLoad,
  onError,
}: CloudinaryImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate URLs based on variant
  const getOptimizedUrl = () => {
    switch (variant) {
      case 'pot':
        return getPotImageUrl(publicId, width || 400, height || 300);
      case 'avatar':
        return getAvatarUrl(publicId, width || 100);
      case 'story':
        return getStoryImageUrl(publicId);
      default:
        return getCloudinaryUrl(publicId, { width, height });
    }
  };

  const srcSet = getResponsiveSrcSet(publicId, undefined, {
    height,
    crop: variant === 'avatar' ? 'fill' : undefined,
    gravity: variant === 'avatar' ? 'face' : 'auto',
  });

  const blurPlaceholder = getBlurPlaceholder(publicId);
  const optimizedUrl = getOptimizedUrl();

  // Intersection observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div 
      ref={imgRef}
      className={cn("relative overflow-hidden", className)}
      style={{ width, height }}
    >
      {/* Blur placeholder */}
      {!isLoaded && (
        <img
          src={blurPlaceholder}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-lg"
        />
      )}

      {/* Main image */}
      {isInView && (
        <img
          src={optimizedUrl}
          srcSet={srcSet}
          sizes={sizes || variantSizes[variant]}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
}
