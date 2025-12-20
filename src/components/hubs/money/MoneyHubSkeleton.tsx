import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Shimmer overlay component for premium loading effect
function ShimmerOverlay() {
  return (
    <motion.div
      className="absolute inset-0 -translate-x-full"
      animate={{ x: ['-100%', '200%'] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      style={{
        background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.1), transparent)',
      }}
    />
  );
}

export function MoneyHubSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-7xl animate-fade-in">
      {/* Header Skeleton */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-xl shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-8 md:h-10 w-48 md:w-64 mb-2" />
              <Skeleton className="h-4 w-32 md:w-48" />
            </div>
          </div>
          <div className="flex gap-2 md:gap-3 w-full md:w-auto">
            <Skeleton className="h-16 flex-1 md:flex-none md:w-24 rounded-lg" />
            <Skeleton className="h-16 flex-1 md:flex-none md:w-24 rounded-lg" />
          </div>
        </div>
      </div>

      {/* AI Command Center / HUD Skeleton */}
      <div className={cn(
        "relative overflow-hidden mb-4 md:mb-6 p-4 md:p-5 lg:p-6 rounded-3xl",
        "backdrop-blur-2xl bg-card/20 border border-primary/20"
      )}>
        <ShimmerOverlay />
        
        {/* Corner brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-muted/30 rounded-tl" />
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-muted/30 rounded-tr" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-muted/30 rounded-bl" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-muted/30 rounded-br" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Skeleton className="w-6 h-6 md:w-7 md:h-7 rounded-full" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <Skeleton className="h-5 w-48 md:w-56 mb-2" />
              <Skeleton className="h-3 w-32 md:w-40" />
            </div>
          </div>
          
          {/* Gauge placeholder */}
          <div className="flex items-center gap-3">
            <motion.div
              className="relative"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-[70px] h-[70px] md:w-[90px] md:h-[90px] rounded-full border-4 border-muted/30 flex items-center justify-center">
                <Skeleton className="w-8 h-8 rounded" />
              </div>
            </motion.div>
            <Skeleton className="w-9 h-9 rounded-xl" />
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl [animation-delay:100ms]" />
          <Skeleton className="h-10 w-full rounded-xl [animation-delay:200ms]" />
        </div>
      </div>

      {/* Feature Cards Skeleton - Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: i * 0.05,
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <div className={cn(
              "relative overflow-hidden h-full p-5 md:p-6 lg:p-7 rounded-3xl",
              "backdrop-blur-2xl bg-card/30 border border-white/10"
            )}>
              <ShimmerOverlay />
              <Skeleton className="w-12 h-12 mb-4 md:mb-5 rounded-xl" />
              <Skeleton className="h-5 md:h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
