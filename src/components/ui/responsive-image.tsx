/**
 * Responsive Image Component
 * Handles WebP with fallback, lazy loading, and responsive srcset
 */

import { ImgHTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  /** Base image path without extension (e.g., "/images/hero") */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Widths for responsive images (generates srcset) */
  widths?: number[];
  /** Fallback format if WebP not supported (default: 'png') */
  fallbackFormat?: 'png' | 'jpg' | 'jpeg';
  /** Sizes attribute for responsive images */
  sizes?: string;
  /** Optional blur-up placeholder */
  placeholder?: string;
  /** Aspect ratio for skeleton (e.g., "16/9") */
  aspectRatio?: string;
}

export function ResponsiveImage({
  src,
  alt,
  widths = [320, 640, 768, 1024, 1280, 1536],
  fallbackFormat = 'png',
  sizes,
  placeholder,
  aspectRatio,
  className,
  loading = 'lazy',
  ...props
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Generate WebP srcset
  const webpSrcSet = widths
    .map(width => `${src}-${width}.webp ${width}w`)
    .join(', ');

  // Generate fallback srcset
  const fallbackSrcSet = widths
    .map(width => `${src}-${width}.${fallbackFormat} ${width}w`)
    .join(', ');

  // Default sizes if not provided
  const defaultSizes = sizes || `
    (max-width: 640px) 100vw,
    (max-width: 1024px) 50vw,
    33vw
  `.replace(/\s+/g, ' ').trim();

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    console.warn(`Failed to load image: ${src}`);
  };

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Blur-up placeholder */}
      {placeholder && !isLoaded && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Skeleton loader */}
      {!isLoaded && !placeholder && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Main image with WebP support */}
      {!hasError && (
        <picture>
          <source 
            type="image/webp" 
            srcSet={webpSrcSet}
            sizes={defaultSizes}
          />
          <source 
            type={`image/${fallbackFormat}`}
            srcSet={fallbackSrcSet}
            sizes={defaultSizes}
          />
          <img
            src={`${src}.${fallbackFormat}`}
            alt={alt}
            loading={loading}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />
        </picture>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-sm text-muted-foreground">Image unavailable</span>
        </div>
      )}
    </div>
  );
}
