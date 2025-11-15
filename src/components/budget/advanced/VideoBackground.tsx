import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoBackgroundProps {
  state: 'success' | 'warning' | 'error' | 'neutral';
  className?: string;
}

const videoUrls = {
  success: 'https://assets.mixkit.co/videos/preview/mixkit-golden-glitter-falling-slowly-32833-large.mp4',
  warning: 'https://assets.mixkit.co/videos/preview/mixkit-yellow-sparks-particles-27715-large.mp4',
  error: 'https://assets.mixkit.co/videos/preview/mixkit-red-light-streaks-1612-large.mp4',
  neutral: 'https://assets.mixkit.co/videos/preview/mixkit-blue-particles-floating-1643-large.mp4',
};

export const VideoBackground = ({ state, className = '' }: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Autoplay failed, user interaction required
      });
    }
  }, [state]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 0.15 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          muted
          playsInline
          onLoadedData={() => setIsLoaded(true)}
        >
          <source src={videoUrls[state]} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </motion.div>
    </AnimatePresence>
  );
};
