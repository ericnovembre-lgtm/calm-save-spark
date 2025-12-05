/**
 * Image Presets Configuration
 * Predefined configurations for responsive images throughout the app
 */

export interface ImagePreset {
  name: string;
  sizes: number[];
  quality: number;
  format: 'webp' | 'png' | 'jpg';
  fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  blurPlaceholder: boolean;
}

export const IMAGE_PRESETS: Record<string, ImagePreset> = {
  // User avatars
  avatar: {
    name: 'avatar',
    sizes: [48, 96, 128, 256, 512],
    quality: 85,
    format: 'webp',
    fit: 'cover',
    blurPlaceholder: true,
  },
  
  // Small thumbnails
  thumbnail: {
    name: 'thumbnail',
    sizes: [160, 320, 480],
    quality: 80,
    format: 'webp',
    fit: 'cover',
    blurPlaceholder: true,
  },
  
  // Card images
  card: {
    name: 'card',
    sizes: [320, 480, 640],
    quality: 80,
    format: 'webp',
    fit: 'cover',
    blurPlaceholder: true,
  },
  
  // Feature/marketing images
  feature: {
    name: 'feature',
    sizes: [640, 768, 1024],
    quality: 85,
    format: 'webp',
    fit: 'contain',
    blurPlaceholder: true,
  },
  
  // Hero/banner images
  hero: {
    name: 'hero',
    sizes: [768, 1024, 1280, 1536, 1920],
    quality: 85,
    format: 'webp',
    fit: 'cover',
    blurPlaceholder: true,
  },
  
  // Full-width backgrounds
  background: {
    name: 'background',
    sizes: [1024, 1280, 1536, 1920, 2560],
    quality: 80,
    format: 'webp',
    fit: 'cover',
    blurPlaceholder: false, // Backgrounds usually don't need blur
  },
  
  // App icons
  icon: {
    name: 'icon',
    sizes: [48, 72, 96, 144, 192, 512],
    quality: 100, // Icons need to be crisp
    format: 'png', // Better for small sizes with hard edges
    fit: 'contain',
    blurPlaceholder: false,
  },
  
  // Logo
  logo: {
    name: 'logo',
    sizes: [64, 128, 256, 512],
    quality: 100,
    format: 'webp',
    fit: 'contain',
    blurPlaceholder: false,
  },
  
  // Open Graph / Social sharing
  og: {
    name: 'og',
    sizes: [1200], // Standard OG image size
    quality: 90,
    format: 'jpg', // Better compatibility for social
    fit: 'cover',
    blurPlaceholder: false,
  },
};

/**
 * Get srcSet string for responsive image
 */
export function getSrcSet(basePath: string, preset: ImagePreset): string {
  const ext = preset.format === 'webp' ? 'webp' : preset.format;
  const filename = basePath.replace(/\.[^.]+$/, '');
  
  return preset.sizes
    .map(size => `${filename}-${size}w.${ext} ${size}w`)
    .join(', ');
}

/**
 * Get sizes attribute for responsive image
 */
export function getSizes(preset: ImagePreset, containerWidth?: string): string {
  // Default responsive sizes
  const defaultSizes: Record<string, string> = {
    avatar: '(max-width: 640px) 48px, (max-width: 1024px) 96px, 128px',
    thumbnail: '(max-width: 640px) 160px, (max-width: 1024px) 320px, 480px',
    card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    feature: '(max-width: 640px) 100vw, (max-width: 1024px) 640px, 1024px',
    hero: '100vw',
    background: '100vw',
    icon: '48px',
    logo: '(max-width: 640px) 128px, 256px',
    og: '1200px',
  };
  
  return containerWidth || defaultSizes[preset.name] || '100vw';
}

/**
 * Generate picture element sources
 */
export function getPictureSources(basePath: string, preset: ImagePreset): {
  webp?: string;
  fallback: string;
  sizes: string;
} {
  const filename = basePath.replace(/\.[^.]+$/, '');
  const ext = basePath.split('.').pop() || 'png';
  
  return {
    webp: preset.format === 'webp' ? undefined : getSrcSet(basePath, { ...preset, format: 'webp' }),
    fallback: getSrcSet(basePath, preset),
    sizes: getSizes(preset),
  };
}

/**
 * Get optimal image size for viewport
 */
export function getOptimalSize(preset: ImagePreset, viewportWidth: number, dpr: number = 1): number {
  const targetWidth = viewportWidth * dpr;
  
  // Find smallest size that covers the target
  const sizes = [...preset.sizes].sort((a, b) => a - b);
  
  for (const size of sizes) {
    if (size >= targetWidth) {
      return size;
    }
  }
  
  // Return largest if none cover
  return sizes[sizes.length - 1];
}

/**
 * Blur placeholder data URL (inline SVG)
 */
export function getBlurPlaceholder(width: number, height: number, color: string = '#e5e7eb'): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <filter id="blur" filterUnits="userSpaceOnUse">
        <feGaussianBlur stdDeviation="20" />
      </filter>
      <rect width="100%" height="100%" fill="${color}" filter="url(#blur)" />
    </svg>
  `.trim();
  
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Loading skeleton placeholder
 */
export function getSkeletonPlaceholder(aspectRatio: string = '16/9'): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect fill='%23e5e7eb' width='16' height='9'/%3E%3C/svg%3E`;
}
