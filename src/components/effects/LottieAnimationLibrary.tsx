import { useEffect, useRef, useState, useCallback } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export type LottieAnimationType =
  | 'confetti-burst'
  | 'coin-rain'
  | 'loading-coins'
  | 'empty-wallet'
  | 'trophy-sparkle'
  | 'rocket-launch'
  | 'warning-bell'
  | 'success-checkmark';

// Inline Lottie animation data (lightweight versions)
const animationData: Record<LottieAnimationType, object> = {
  'confetti-burst': {
    v: '5.5.7',
    fr: 60,
    ip: 0,
    op: 60,
    w: 200,
    h: 200,
    layers: [
      {
        ty: 4,
        nm: 'confetti',
        sr: 1,
        ks: {
          o: { a: 1, k: [{ t: 0, s: [100] }, { t: 60, s: [0] }] },
          p: { a: 1, k: [{ t: 0, s: [100, 100] }, { t: 60, s: [100, 50] }] },
          s: { a: 1, k: [{ t: 0, s: [0, 0] }, { t: 15, s: [100, 100] }] },
        },
        shapes: [
          {
            ty: 'rc',
            p: { a: 0, k: [0, 0] },
            s: { a: 0, k: [10, 10] },
            r: { a: 0, k: 2 },
          },
          { ty: 'fl', c: { a: 0, k: [0.2, 0.8, 0.4, 1] } },
        ],
      },
    ],
  },
  'coin-rain': {
    v: '5.5.7',
    fr: 30,
    ip: 0,
    op: 90,
    w: 200,
    h: 200,
    layers: [
      {
        ty: 4,
        nm: 'coin',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          p: { a: 1, k: [{ t: 0, s: [100, 0] }, { t: 90, s: [100, 220] }] },
          r: { a: 1, k: [{ t: 0, s: [0] }, { t: 90, s: [360] }] },
        },
        shapes: [
          {
            ty: 'el',
            p: { a: 0, k: [0, 0] },
            s: { a: 0, k: [20, 20] },
          },
          { ty: 'fl', c: { a: 0, k: [1, 0.84, 0, 1] } },
        ],
      },
    ],
  },
  'loading-coins': {
    v: '5.5.7',
    fr: 30,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    layers: [
      {
        ty: 4,
        nm: 'spinner',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          p: { a: 0, k: [50, 50] },
          r: { a: 1, k: [{ t: 0, s: [0] }, { t: 60, s: [360] }] },
        },
        shapes: [
          {
            ty: 'el',
            p: { a: 0, k: [0, -30] },
            s: { a: 0, k: [12, 12] },
          },
          { ty: 'fl', c: { a: 0, k: [1, 0.84, 0, 1] } },
        ],
      },
    ],
  },
  'empty-wallet': {
    v: '5.5.7',
    fr: 24,
    ip: 0,
    op: 48,
    w: 100,
    h: 100,
    layers: [
      {
        ty: 4,
        nm: 'wallet',
        sr: 1,
        ks: {
          o: { a: 0, k: 80 },
          p: { a: 0, k: [50, 50] },
          s: { a: 1, k: [{ t: 0, s: [100, 100] }, { t: 24, s: [95, 105] }, { t: 48, s: [100, 100] }] },
        },
        shapes: [
          {
            ty: 'rc',
            p: { a: 0, k: [0, 0] },
            s: { a: 0, k: [50, 35] },
            r: { a: 0, k: 5 },
          },
          { ty: 'fl', c: { a: 0, k: [0.6, 0.6, 0.6, 1] } },
        ],
      },
    ],
  },
  'trophy-sparkle': {
    v: '5.5.7',
    fr: 30,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    layers: [
      {
        ty: 4,
        nm: 'trophy',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          p: { a: 0, k: [50, 50] },
          s: { a: 1, k: [{ t: 0, s: [90, 90] }, { t: 30, s: [100, 100] }, { t: 60, s: [90, 90] }] },
        },
        shapes: [
          {
            ty: 'rc',
            p: { a: 0, k: [0, 10] },
            s: { a: 0, k: [20, 30] },
            r: { a: 0, k: 3 },
          },
          { ty: 'fl', c: { a: 0, k: [1, 0.84, 0, 1] } },
        ],
      },
    ],
  },
  'rocket-launch': {
    v: '5.5.7',
    fr: 30,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    layers: [
      {
        ty: 4,
        nm: 'rocket',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          p: { a: 1, k: [{ t: 0, s: [50, 80] }, { t: 60, s: [50, 20] }] },
          r: { a: 0, k: -45 },
        },
        shapes: [
          {
            ty: 'rc',
            p: { a: 0, k: [0, 0] },
            s: { a: 0, k: [10, 25] },
            r: { a: 0, k: 5 },
          },
          { ty: 'fl', c: { a: 0, k: [0.9, 0.3, 0.3, 1] } },
        ],
      },
    ],
  },
  'warning-bell': {
    v: '5.5.7',
    fr: 24,
    ip: 0,
    op: 48,
    w: 100,
    h: 100,
    layers: [
      {
        ty: 4,
        nm: 'bell',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          p: { a: 0, k: [50, 45] },
          r: { a: 1, k: [{ t: 0, s: [0] }, { t: 12, s: [15] }, { t: 24, s: [-15] }, { t: 36, s: [10] }, { t: 48, s: [0] }] },
        },
        shapes: [
          {
            ty: 'rc',
            p: { a: 0, k: [0, 0] },
            s: { a: 0, k: [25, 30] },
            r: { a: 0, k: 8 },
          },
          { ty: 'fl', c: { a: 0, k: [1, 0.7, 0, 1] } },
        ],
      },
    ],
  },
  'success-checkmark': {
    v: '5.5.7',
    fr: 30,
    ip: 0,
    op: 45,
    w: 100,
    h: 100,
    layers: [
      {
        ty: 4,
        nm: 'check',
        sr: 1,
        ks: {
          o: { a: 1, k: [{ t: 0, s: [0] }, { t: 15, s: [100] }] },
          p: { a: 0, k: [50, 50] },
          s: { a: 1, k: [{ t: 0, s: [0, 0] }, { t: 30, s: [100, 100] }] },
        },
        shapes: [
          {
            ty: 'el',
            p: { a: 0, k: [0, 0] },
            s: { a: 0, k: [60, 60] },
          },
          { ty: 'fl', c: { a: 0, k: [0.2, 0.8, 0.4, 1] } },
        ],
      },
    ],
  },
};

interface LottieAnimationProps {
  type: LottieAnimationType;
  size?: number;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  onComplete?: () => void;
}

/**
 * LottieAnimation - Pre-built animation component
 */
export function LottieAnimation({
  type,
  size = 100,
  loop = false,
  autoplay = true,
  className,
  onComplete,
}: LottieAnimationProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData[type]}
      loop={loop}
      autoplay={autoplay}
      style={{ width: size, height: size }}
      className={className}
      onComplete={onComplete}
    />
  );
}

/**
 * Hook for triggering Lottie animations programmatically
 */
export function useLottieAnimation(type: LottieAnimationType) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [key, setKey] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const play = useCallback(() => {
    if (prefersReducedMotion) return;
    setKey((k) => k + 1);
    setIsPlaying(true);
  }, [prefersReducedMotion]);

  const stop = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const Animation = useCallback(
    ({ size = 100, className }: { size?: number; className?: string }) => {
      if (!isPlaying || prefersReducedMotion) return null;

      return (
        <LottieAnimation
          key={key}
          type={type}
          size={size}
          className={className}
          onComplete={() => setIsPlaying(false)}
        />
      );
    },
    [isPlaying, key, type, prefersReducedMotion]
  );

  return { play, stop, isPlaying, Animation };
}

/**
 * Celebration overlay that shows fullscreen Lottie
 */
export function CelebrationOverlay({
  type,
  isVisible,
  onComplete,
}: {
  type: LottieAnimationType;
  isVisible: boolean;
  onComplete?: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (!isVisible || prefersReducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <LottieAnimation
        type={type}
        size={300}
        onComplete={onComplete}
      />
    </div>
  );
}
