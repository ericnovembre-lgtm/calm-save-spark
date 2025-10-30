import { useState, useEffect, ImgHTMLAttributes } from 'react';
import { useAnimationPreference } from '@/hooks/useAnimationPreference';
import { getAnimIconData, SaveplusIconRecord } from './saveplus_anim_map';
import { cn } from '@/lib/utils';

export interface SaveplusAnimIconProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  /** Icon key from saveplus_anim_map */
  icon: string;
  /** Size in pixels (default: 24) */
  size?: number;
  /** Whether the icon is decorative (hides from screen readers) */
  decorative?: boolean;
  /** Custom accessible label (overrides default from icon definition) */
  label?: string;
  /** Force static version even if animations are enabled */
  forceStatic?: boolean;
  /** Callback when image fails to load */
  onError?: () => void;
}

/**
 * $ave+ Animated Icon Component
 * 
 * Features:
 * - Respects system prefers-reduced-motion
 * - Respects user localStorage preference
 * - Smart asset fallback: APNG → GIF → PNG → SVG → Emoji
 * - SSR-safe (no window access during render)
 * - Accessible (proper ARIA labels)
 * 
 * @example
 * ```tsx
 * <SaveplusAnimIcon icon="piggy-bank" size={32} />
 * <SaveplusAnimIcon icon="rocket" decorative />
 * <SaveplusAnimIcon icon="target" label="Custom label" />
 * ```
 */
export function SaveplusAnimIcon({
  icon,
  size = 24,
  decorative = false,
  label,
  forceStatic = false,
  onError,
  className,
  ...imgProps
}: SaveplusAnimIconProps) {
  const shouldAnimate = useAnimationPreference();
  const [iconDef, setIconDef] = useState<SaveplusIconRecord | null>(null);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Load icon definition
  useEffect(() => {
    const def = getAnimIconData(icon);
    if (def) {
      setIconDef(def);
      setFallbackIndex(0);
      setHasError(false);
    } else {
      console.warn(`Icon "${icon}" not found in saveplus_anim_map`);
      setIconDef(null);
    }
  }, [icon]);

  // Determine which asset to use based on animation preference
  useEffect(() => {
    if (!iconDef) return;

    const useAnimation = shouldAnimate && !forceStatic;

    // Build fallback chain
    const fallbackChain: string[] = [];
    
    if (useAnimation) {
      // Animated chain: APNG → GIF
      if (iconDef.apng) fallbackChain.push(iconDef.apng);
      if (iconDef.gif) fallbackChain.push(iconDef.gif);
    }
    
    // Static fallback
    if (iconDef.static) fallbackChain.push(iconDef.static);

    // Set source based on fallback index
    if (fallbackIndex < fallbackChain.length) {
      setCurrentSrc(fallbackChain[fallbackIndex]);
    } else {
      // Ultimate fallback: show nothing and let emoji be displayed
      setCurrentSrc('');
      setHasError(true);
    }
  }, [iconDef, shouldAnimate, forceStatic, fallbackIndex]);

  // Handle image load errors
  const handleImageError = () => {
    console.warn(`Failed to load asset #${fallbackIndex} for icon "${icon}"`);
    setFallbackIndex(prev => prev + 1);
    onError?.();
  };

  // If no icon definition found, show emoji fallback
  if (!iconDef) {
    return (
      <span
        role={decorative ? 'presentation' : 'img'}
        aria-label={decorative ? undefined : (label || 'Icon')}
        className={cn('inline-block', className)}
        style={{ fontSize: size }}
      >
        ❓
      </span>
    );
  }

  // If all image formats failed, show emoji
  if (hasError || !currentSrc) {
    return (
      <span
        role={decorative ? 'presentation' : 'img'}
        aria-label={decorative ? undefined : (label || iconDef.label)}
        className={cn('inline-block', className)}
        style={{ fontSize: size }}
      >
        {iconDef.emoji_static}
      </span>
    );
  }

  // Show image
  return (
    <img
      src={currentSrc}
      alt={decorative ? '' : (label || iconDef.label)}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? 'presentation' : undefined}
      width={size}
      height={size}
      onError={handleImageError}
      className={cn(
        'inline-block select-none',
        shouldAnimate && !forceStatic && 'motion-safe:animate-in',
        className
      )}
      draggable={false}
      {...imgProps}
    />
  );
}

/**
 * Decorative variant (hidden from screen readers)
 */
export function SaveplusAnimIconDecorative(props: Omit<SaveplusAnimIconProps, 'decorative'>) {
  return <SaveplusAnimIcon {...props} decorative />;
}

/**
 * Static variant (never animated)
 */
export function SaveplusAnimIconStatic(props: Omit<SaveplusAnimIconProps, 'forceStatic'>) {
  return <SaveplusAnimIcon {...props} forceStatic />;
}
