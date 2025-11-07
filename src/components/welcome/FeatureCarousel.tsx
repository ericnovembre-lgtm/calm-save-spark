import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { announce } from "@/components/layout/LiveRegion";
import { SaveplusAnimIcon } from "@/components/icons";

export interface Feature {
  id: string;
  icon: string; // SaveplusAnimIcon name
  title: string;
  description: string;
  summary?: string; // Optional summary for carousel display
  details: string;
}

interface FeatureCarouselProps {
  features: Feature[];
  onFeatureClick: (feature: Feature) => void;
  autoInterval?: number;
}


export const FeatureCarousel = ({ 
  features, 
  onFeatureClick,
  autoInterval = 5000 
}: FeatureCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Detect reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const setRM = () => setReduceMotion(!!mq?.matches);
    setRM();
    mq?.addEventListener?.('change', setRM);
    return () => mq?.removeEventListener?.('change', setRM);
  }, []);

  const goTo = useCallback((idx: number) => {
    const next = (idx + features.length) % features.length;
    setCurrentIndex(next);
    announce(`Showing feature ${next + 1} of ${features.length}`, 'polite');
  }, [features.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  }, [features.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
  }, [features.length]);

  const pauseAuto = useCallback(() => {
    setIsAutoPlaying(false);
    if (timerRef.current) window.clearInterval(timerRef.current);
  }, []);

  // Autoplay
  useEffect(() => {
    if (reduceMotion || !isAutoPlaying || features.length <= 1) return;
    timerRef.current = window.setInterval(goNext, autoInterval);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [reduceMotion, isAutoPlaying, autoInterval, features.length, goNext]);

  const current = features[currentIndex];

  return (
    <div
      className="rounded-2xl border p-6 md:p-8 bg-background border-[color:var(--color-border)] 
                 transition-all duration-300 hover:border-[color:var(--color-accent)] 
                 hover:shadow-[0_0_24px_rgba(0,0,0,0.08)]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Feature highlights"
    >

      {/* Slide */}
      <motion.div 
        key={current.id}
        initial={reduceMotion ? false : { opacity: 0, x: 24 }}
        animate={reduceMotion ? false : { opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Icon */}
          <div className="flex-shrink-0">
            <motion.div 
              className="rounded-2xl p-6 border border-[color:var(--color-border)] bg-card
                         transition-all duration-300 hover:border-[color:var(--color-accent)]
                         hover:bg-[color:var(--color-accent)]/10"
              whileHover={reduceMotion ? {} : { scale: 1.05, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-foreground">
                <SaveplusAnimIcon name={current.icon} size={48} decorative />
              </div>
            </motion.div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              {current.title}
            </h3>
            <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
              {current.summary || current.description}
            </p>
            <motion.button
              onClick={() => {
                pauseAuto();
                onFeatureClick(current);
              }}
              whileHover={reduceMotion ? {} : { scale: 1.02 }}
              whileTap={reduceMotion ? {} : { scale: 0.98 }}
              className="px-6 py-3 rounded-xl font-semibold
                         border border-[color:var(--color-border)]
                         text-foreground 
                         hover:bg-[color:var(--color-accent)]/30
                         hover:border-[color:var(--color-accent)]
                         transition-all duration-300 inline-flex items-center gap-2"
              aria-label={`Learn more about ${current.title}`}
            >
              Learn More
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-8 gap-4">
        <button
          onClick={() => { pauseAuto(); goPrev(); }}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[color:var(--color-border)] 
                     flex items-center justify-center 
                     hover:bg-[color:var(--color-accent)]/30
                     hover:border-[color:var(--color-accent)]
                     transition-all duration-300 shrink-0"
          aria-label="Previous feature"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-3 md:gap-4 overflow-x-auto" role="tablist" aria-label="Feature tabs">
          {features.map((_, idx) => {
            const active = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => { pauseAuto(); goTo(idx); }}
                role="tab"
                aria-selected={active}
                aria-label={`Go to feature ${idx + 1}`}
                className={`h-2 md:h-3 rounded-full border transition-all shrink-0 duration-300
                            border-[color:var(--color-border)]
                            ${active 
                              ? 'w-6 md:w-8 bg-[color:var(--color-accent)]' 
                              : 'w-2 md:w-3 bg-transparent hover:bg-[color:var(--color-accent)]/50'
                            }`}
              />
            );
          })}
        </div>

        <button
          onClick={() => { pauseAuto(); goNext(); }}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[color:var(--color-border)] 
                     flex items-center justify-center 
                     hover:bg-[color:var(--color-accent)]/30
                     hover:border-[color:var(--color-accent)]
                     transition-all duration-300 shrink-0"
          aria-label="Next feature"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
        </button>
      </div>

      {/* Autoplay hint */}
      {isAutoPlaying && !reduceMotion && features.length > 1 && (
        <motion.div 
          className="text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs text-muted-foreground">
            Auto-advancing every {Math.round(autoInterval / 1000)}s • Click any control to pause
          </p>
        </motion.div>
      )}
    </div>
  );
};
