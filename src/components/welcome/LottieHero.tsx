import { useEffect, useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

interface LottieHeroProps {
  animationData: any;
  autoplay?: boolean;
  loop?: boolean;
  className?: string;
  onComplete?: () => void;
  authState?: 'authenticated' | 'unauthenticated' | 'checking';
}

export const LottieHero = ({ 
  animationData, 
  autoplay = true, 
  loop = true,
  className = "",
  onComplete,
  authState = 'checking'
}: LottieHeroProps) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    const handleMotionPreference = () => {
      if (mediaQuery.matches && lottieRef.current) {
        lottieRef.current.pause();
        console.log('[LottieHero] Animation paused due to reduced motion preference');
      } else if (lottieRef.current && autoplay) {
        lottieRef.current.play();
        console.log('[LottieHero] Animation playing');
      }
    };

    handleMotionPreference();
    mediaQuery.addEventListener("change", handleMotionPreference);

    return () => mediaQuery.removeEventListener("change", handleMotionPreference);
  }, [autoplay]);

  // Detect stuck animations
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (lottieRef.current) {
        const isPaused = lottieRef.current.animationItem?.isPaused;
        if (!isPaused) {
          console.log('[LottieHero] Animation playing normally');
        } else {
          console.warn('[LottieHero] Animation may be stuck, attempting restart');
          lottieRef.current.play();
        }
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  const handleComplete = () => {
    console.log('[LottieHero] Animation complete', { authState });
    onComplete?.();
  };

  const handleLoopComplete = () => {
    console.log('[LottieHero] Animation loop complete', { authState });
  };

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      className={className}
      onComplete={handleComplete}
      onLoopComplete={handleLoopComplete}
    />
  );
};
