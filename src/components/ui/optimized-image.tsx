/**
 * OptimizedImage - Lazy loading image with blur placeholder
 * Optimizes LCP and reduces layout shift
 */
import { useState, useRef, useEffect, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'placeholder'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty' | 'skeleton';
  blurDataURL?: string;
  onLoadComplete?: () => void;
  fallbackSrc?: string;
}

// Default blur placeholder (1x1 transparent)
const DEFAULT_BLUR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlNWU1ZTUiLz48L3N2Zz4=';

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  placeholder = 'skeleton',
  blurDataURL,
  onLoadComplete,
  fallbackSrc,
  className,
  style,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

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
    onLoadComplete?.();
  };

  const handleError = () => {
    setHasError(true);
    if (fallbackSrc && imgRef.current) {
      imgRef.current.src = fallbackSrc;
    }
  };

  const aspectRatio = width && height ? width / height : undefined;

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{
        width: width || '100%',
        height: height || 'auto',
        aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
        ...style,
      }}
    >
      {/* Placeholder */}
      {!isLoaded && placeholder === 'skeleton' && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      
      {!isLoaded && placeholder === 'blur' && (
        <img
          src={blurDataURL || DEFAULT_BLUR}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-lg scale-110"
        />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={hasError && fallbackSrc ? fallbackSrc : src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}

      {/* Invisible placeholder for lazy loading trigger */}
      {!isInView && (
        <div 
          ref={imgRef as React.RefObject<HTMLDivElement>}
          className="absolute inset-0" 
          aria-hidden="true" 
        />
      )}
    </div>
  );
}

/**
 * Avatar optimized for profile images
 */
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  fallback,
  className,
}: {
  src?: string;
  alt: string;
  size?: number;
  fallback?: string;
  className?: string;
}) {
  const initials = alt
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (!src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium',
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {fallback || initials}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      placeholder="skeleton"
      className={cn('rounded-full', className)}
    />
  );
}
