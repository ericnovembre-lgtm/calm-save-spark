import { motion } from 'framer-motion';

/**
 * PremiumHubSkeleton - Loading skeleton for Premium Hub
 * 
 * Matches the bento grid layout with diamond sparkle placeholders
 */
export const PremiumHubSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Background shimmer */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, hsl(var(--primary) / 0.08) 0%, transparent 60%),
            hsl(var(--background))
          `
        }}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header skeleton */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              className="w-10 h-10 rounded-xl bg-primary/10"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="h-10 w-64 rounded-xl bg-muted/50"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
            />
          </div>
          <motion.div
            className="h-5 w-80 mx-auto rounded-lg bg-muted/30"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
        </div>

        {/* Bento grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[180px]">
          {/* Large card */}
          <motion.div
            className="md:col-span-2 md:row-span-2 rounded-3xl bg-card/30 border border-primary/10 p-6 relative overflow-hidden"
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="h-12 w-12 rounded-xl bg-primary/10 mb-4" />
            <div className="h-6 w-40 rounded-lg bg-muted/40 mb-2" />
            <div className="h-4 w-full rounded-lg bg-muted/20 mb-1" />
            <div className="h-4 w-3/4 rounded-lg bg-muted/20" />
            
            {/* Diamond sparkle decoration */}
            <motion.div
              className="absolute top-4 right-4"
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg width="16" height="16" viewBox="0 0 10 10">
                <path
                  d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z"
                  fill="hsl(var(--primary) / 0.4)"
                />
              </svg>
            </motion.div>
          </motion.div>

          {/* Medium cards */}
          {[0, 1].map((i) => (
            <motion.div
              key={`md-${i}`}
              className="md:row-span-2 rounded-3xl bg-card/30 border border-primary/10 p-6"
              animate={{ opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 * (i + 1) }}
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 mb-4" />
              <div className="h-5 w-32 rounded-lg bg-muted/40 mb-2" />
              <div className="h-3 w-full rounded-lg bg-muted/20 mb-1" />
              <div className="h-3 w-2/3 rounded-lg bg-muted/20" />
            </motion.div>
          ))}

          {/* Small cards */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={`sm-${i}`}
              className="rounded-3xl bg-card/30 border border-primary/10 p-6"
              animate={{ opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 * (i + 3) }}
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 mb-3" />
              <div className="h-4 w-24 rounded-lg bg-muted/40 mb-2" />
              <div className="h-3 w-full rounded-lg bg-muted/20" />
            </motion.div>
          ))}

          {/* Wide card */}
          <motion.div
            className="md:col-span-2 lg:col-span-4 rounded-3xl bg-card/30 border border-primary/10 p-6"
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.7 }}
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10" />
              <div className="flex-1">
                <div className="h-5 w-40 rounded-lg bg-muted/40 mb-2" />
                <div className="h-3 w-full rounded-lg bg-muted/20" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};