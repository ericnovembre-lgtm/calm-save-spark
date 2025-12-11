/**
 * Cloudinary Media Optimization Utilities
 * 
 * Provides URL generation helpers for responsive, optimized images
 * using Cloudinary's transformation API.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dwpidx6nf';

type ImageFormat = 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
type ImageQuality = 'auto' | 'auto:low' | 'auto:eco' | 'auto:good' | 'auto:best' | number;

interface TransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'crop' | 'pad';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  format?: ImageFormat;
  quality?: ImageQuality;
  blur?: number;
  effect?: string;
  radius?: number | 'max';
}

/**
 * Generate a Cloudinary URL with transformations
 */
export function getCloudinaryUrl(
  publicId: string,
  options: TransformOptions = {}
): string {
  const {
    width,
    height,
    crop = 'fill',
    gravity = 'auto',
    format = 'auto',
    quality = 'auto',
    blur,
    effect,
    radius,
  } = options;

  const transforms: string[] = [];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop) transforms.push(`c_${crop}`);
  if (gravity) transforms.push(`g_${gravity}`);
  if (format) transforms.push(`f_${format}`);
  if (quality) transforms.push(`q_${quality}`);
  if (blur) transforms.push(`e_blur:${blur}`);
  if (effect) transforms.push(`e_${effect}`);
  if (radius) transforms.push(`r_${radius === 'max' ? 'max' : radius}`);

  const transformString = transforms.join(',');

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformString}/${publicId}`;
}

/**
 * Generate responsive image srcset for different screen sizes
 */
export function getResponsiveSrcSet(
  publicId: string,
  widths: number[] = [320, 640, 960, 1280, 1920],
  options: Omit<TransformOptions, 'width'> = {}
): string {
  return widths
    .map(w => `${getCloudinaryUrl(publicId, { ...options, width: w })} ${w}w`)
    .join(', ');
}

/**
 * Generate a blur placeholder URL for lazy loading
 */
export function getBlurPlaceholder(
  publicId: string,
  options: TransformOptions = {}
): string {
  return getCloudinaryUrl(publicId, {
    ...options,
    width: 20,
    quality: 'auto:low',
    blur: 1000,
  });
}

/**
 * Optimized avatar URL with circular crop
 */
export function getAvatarUrl(
  publicId: string,
  size: number = 100
): string {
  return getCloudinaryUrl(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    gravity: 'face',
    radius: 'max',
    format: 'webp',
    quality: 'auto:good',
  });
}

/**
 * Optimized pot/goal image URL
 */
export function getPotImageUrl(
  publicId: string,
  width: number = 400,
  height: number = 300
): string {
  return getCloudinaryUrl(publicId, {
    width,
    height,
    crop: 'fill',
    gravity: 'auto',
    format: 'webp',
    quality: 'auto:good',
  });
}

/**
 * Optimized story/card image URL
 */
export function getStoryImageUrl(
  publicId: string
): string {
  return getCloudinaryUrl(publicId, {
    width: 1080,
    height: 1920,
    crop: 'fill',
    format: 'webp',
    quality: 'auto:good',
  });
}

/**
 * Upload configuration for direct browser uploads
 */
export function getUploadConfig() {
  return {
    cloudName: CLOUD_NAME,
    uploadPreset: 'save_plus_unsigned', // Create this preset in Cloudinary dashboard
  };
}
