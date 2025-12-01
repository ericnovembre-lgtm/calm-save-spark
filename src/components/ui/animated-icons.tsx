import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { useRef, useEffect } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedIconProps {
  size?: number;
  autoplay?: boolean;
  loop?: boolean;
  onComplete?: () => void;
  className?: string;
}

/**
 * Target Lock Animation - For opportunity targeting
 * Simple crosshair animation that locks onto target
 */
const targetLockAnimationData = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 30,
  w: 48,
  h: 48,
  nm: "Target Lock",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Crosshair",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [{ t: 0, s: 0 }, { t: 30, s: 360 }] },
        p: { a: 0, k: [24, 24] },
        s: { a: 1, k: [{ t: 0, s: [80, 80] }, { t: 15, s: [100, 100] }] },
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              s: { a: 0, k: [2, 12] },
              p: { a: 0, k: [0, -12] },
            },
            {
              ty: "st",
              c: { a: 0, k: [0.02, 0.71, 0.84, 1] },
              w: { a: 0, k: 2 },
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Coin Spin Animation - For financial actions
 */
const coinSpinAnimationData = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 40,
  w: 48,
  h: 48,
  nm: "Coin Spin",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Coin",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [24, 24] },
        s: { a: 1, k: [{ t: 0, s: [100, 100] }, { t: 20, s: [100, 0] }, { t: 40, s: [100, 100] }] },
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              s: { a: 0, k: [20, 20] },
            },
            {
              ty: "fl",
              c: { a: 0, k: [1, 0.84, 0, 1] },
            },
            {
              ty: "st",
              c: { a: 0, k: [1, 0.7, 0, 1] },
              w: { a: 0, k: 2 },
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Success Check Animation - For completed actions
 */
const successCheckAnimationData = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 20,
  w: 48,
  h: 48,
  nm: "Success Check",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Check",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [24, 24] },
        s: { a: 1, k: [{ t: 0, s: [0, 0] }, { t: 20, s: [110, 110] }] },
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "sh",
              ks: {
                a: 0,
                k: {
                  c: false,
                  v: [[-4, 0], [0, 4], [6, -4]],
                },
              },
            },
            {
              ty: "st",
              c: { a: 0, k: [0.06, 0.73, 0.51, 1] },
              w: { a: 0, k: 3 },
              lc: 2,
              lj: 2,
            },
            {
              ty: "tm",
              s: { a: 0, k: 0 },
              e: { a: 1, k: [{ t: 0, s: 0 }, { t: 20, s: 100 }] },
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Radar Scan Animation - For opportunity detection
 */
const radarScanAnimationData = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 48,
  h: 48,
  nm: "Radar Scan",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Sweep",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [{ t: 0, s: 0 }, { t: 60, s: 360 }] },
        p: { a: 0, k: [24, 24] },
        s: { a: 0, k: [100, 100] },
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "sh",
              ks: {
                a: 0,
                k: {
                  c: false,
                  v: [[0, 0], [0, -15]],
                },
              },
            },
            {
              ty: "st",
              c: { a: 0, k: [0.02, 0.71, 0.84, 1] },
              w: { a: 0, k: 2 },
            },
          ],
        },
      ],
    },
  ],
};

export const TargetLockIcon = ({ size = 24, autoplay = true, loop = false, onComplete, className = "" }: AnimatedIconProps) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion && lottieRef.current) {
      lottieRef.current.goToAndStop(29, true);
    }
  }, [prefersReducedMotion]);

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={targetLockAnimationData}
      autoplay={autoplay && !prefersReducedMotion}
      loop={loop}
      onComplete={onComplete}
      style={{ width: size, height: size }}
      className={className}
    />
  );
};

export const CoinSpinIcon = ({ size = 24, autoplay = true, loop = true, onComplete, className = "" }: AnimatedIconProps) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion && lottieRef.current) {
      lottieRef.current.goToAndStop(0, true);
    }
  }, [prefersReducedMotion]);

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={coinSpinAnimationData}
      autoplay={autoplay && !prefersReducedMotion}
      loop={loop}
      onComplete={onComplete}
      style={{ width: size, height: size }}
      className={className}
    />
  );
};

export const SuccessCheckIcon = ({ size = 24, autoplay = true, loop = false, onComplete, className = "" }: AnimatedIconProps) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion && lottieRef.current) {
      lottieRef.current.goToAndStop(19, true);
    }
  }, [prefersReducedMotion]);

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={successCheckAnimationData}
      autoplay={autoplay && !prefersReducedMotion}
      loop={loop}
      onComplete={onComplete}
      style={{ width: size, height: size }}
      className={className}
    />
  );
};

export const RadarScanIcon = ({ size = 24, autoplay = true, loop = true, onComplete, className = "" }: AnimatedIconProps) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion && lottieRef.current) {
      lottieRef.current.goToAndStop(0, true);
    }
  }, [prefersReducedMotion]);

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={radarScanAnimationData}
      autoplay={autoplay && !prefersReducedMotion}
      loop={loop}
      onComplete={onComplete}
      style={{ width: size, height: size }}
      className={className}
    />
  );
};
