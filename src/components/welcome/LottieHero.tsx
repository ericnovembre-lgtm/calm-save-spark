import { useEffect, useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

interface LottieHeroProps {
  animationData: any;
  autoplay?: boolean;
  loop?: boolean;
  className?: string;
}

export const LottieHero = ({ 
  animationData, 
  autoplay = true, 
  loop = true,
  className = ""
}: LottieHeroProps) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    const handleMotionPreference = () => {
      if (mediaQuery.matches && lottieRef.current) {
        lottieRef.current.pause();
      } else if (lottieRef.current && autoplay) {
        lottieRef.current.play();
      }
    };

    handleMotionPreference();
    mediaQuery.addEventListener("change", handleMotionPreference);

    return () => mediaQuery.removeEventListener("change", handleMotionPreference);
  }, [autoplay]);

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      className={className}
    />
  );
};
