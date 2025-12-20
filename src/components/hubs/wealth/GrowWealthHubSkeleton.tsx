import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * GrowWealthHubSkeleton - Bento grid skeleton for loading state
 * Mirrors the premium vault layout with staggered card animations
 * Enhanced with gradient shimmer sweep animation
 */
export const GrowWealthHubSkeleton = () => {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }
    },
  };

  // Bento grid layout matching the hub
  const cards = [
    { size: 'lg', hasSparkline: true },
    { size: 'sm', hasSparkline: false },
    { size: 'sm', hasSparkline: false },
    { size: 'md', hasSparkline: true },
    { size: 'sm', hasSparkline: false },
    { size: 'sm', hasSparkline: false },
    { size: 'wide', hasSparkline: false },
    { size: 'sm', hasSparkline: false },
  ];

  const sizeClasses: Record<string, string> = {
    sm: '',
    md: 'md:col-span-1 md:row-span-2',
    lg: 'md:col-span-2 md:row-span-2',
    wide: 'md:col-span-2 lg:col-span-3',
  };

  // Shimmer animation component
  const ShimmerOverlay = () => (
    !prefersReducedMotion ? (
      <motion.div 
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent/10 to-transparent"
        animate={{ x: ['0%', '200%'] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5, ease: 'linear' }}
      />
    ) : null
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header skeleton */}
      <motion.div 
        className="mb-8"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-start gap-4 mb-3">
          <div className="w-12 h-12 rounded-xl bg-accent/10 relative overflow-hidden">
            <ShimmerOverlay />
          </div>
          <div className="flex-1">
            <div className="h-10 w-48 bg-accent/10 rounded-lg mb-2 relative overflow-hidden">
              <ShimmerOverlay />
            </div>
            <div className="h-5 w-72 bg-muted/20 rounded relative overflow-hidden">
              <ShimmerOverlay />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats cards skeleton */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="p-4 rounded-2xl border border-accent/10 bg-card/30 backdrop-blur-sm relative overflow-hidden"
          >
            <ShimmerOverlay />
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10" />
              <div className="w-5 h-5 rounded bg-muted/20" />
            </div>
            <div className="h-3 w-20 bg-muted/20 rounded mb-2" />
            <div className="h-8 w-24 bg-accent/10 rounded" />
          </motion.div>
        ))}
      </motion.div>

      {/* Dashboard summary skeleton */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="mb-8 p-6 rounded-3xl border border-accent/10 bg-card/30 backdrop-blur-sm relative overflow-hidden"
      >
        <ShimmerOverlay />
        <div className="h-6 w-40 bg-accent/10 rounded mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-16 bg-muted/20 rounded" />
              <div className="h-8 w-full bg-accent/10 rounded" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Additional widget skeletons */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={`widget-${i}`}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mb-8 p-6 rounded-3xl border border-accent/10 bg-card/30 backdrop-blur-sm relative overflow-hidden"
        >
          <ShimmerOverlay />
          <div className="h-6 w-48 bg-accent/10 rounded mb-4" />
          <div className="h-40 bg-muted/10 rounded-xl" />
        </motion.div>
      ))}

      {/* Bento grid skeleton */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {cards.map((card, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className={`relative p-6 rounded-3xl border border-white/15 bg-card/50 backdrop-blur-[28px] overflow-hidden ${sizeClasses[card.size]}`}
          >
            <ShimmerOverlay />
            
            {/* Sparkline background */}
            {card.hasSparkline && (
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.05]"
                viewBox="0 0 200 60"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,45 Q20,40 40,35 T80,28 Q100,25 120,22 T160,15 Q180,12 200,10"
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="2"
                />
              </svg>
            )}
            
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-accent/10 mb-4" />
            
            {/* Title */}
            <div className={`h-6 bg-accent/10 rounded mb-2 ${card.size === 'lg' ? 'w-40' : 'w-28'}`} />
            
            {/* Description */}
            <div className="space-y-2 mb-4">
              <div className="h-4 w-full bg-muted/20 rounded" />
              <div className="h-4 w-3/4 bg-muted/20 rounded" />
            </div>
            
            {/* Explore link */}
            <div className="h-4 w-16 bg-accent/10 rounded mt-auto" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
