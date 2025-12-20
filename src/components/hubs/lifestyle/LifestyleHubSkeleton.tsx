import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

/**
 * LifestyleHubSkeleton - Loading skeleton that mirrors the bento grid layout
 * Provides accurate perceived loading state matching the actual component structure
 */
export function LifestyleHubSkeleton() {
  // Matches the features array layout in LifestyleHub
  const cards = [
    { size: 'lg' as const },   // Financial Health
    { size: 'sm' as const }, { size: 'sm' as const },   // Family, Student
    { size: 'sm' as const }, { size: 'sm' as const }, { size: 'sm' as const }, { size: 'sm' as const },   // Business, Literacy, Sustainability, Digital Twin
    { size: 'lg' as const },   // Couples
    { size: 'sm' as const },   // Wishlist
    { size: 'sm' as const }, { size: 'sm' as const }, { size: 'sm' as const },   // Diary, Milestones, Mindset
    { size: 'wide' as const },  // Community Forum
  ];

  const sizeClasses = {
    sm: '',
    lg: 'md:col-span-2 md:row-span-2',
    wide: 'md:col-span-2 lg:col-span-3',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header skeleton */}
        <div className="text-center mb-8">
          <Skeleton className="w-14 h-14 rounded-2xl mx-auto mb-4" />
          <Skeleton className="h-10 w-64 mx-auto mb-3" />
          <Skeleton className="h-5 w-80 mx-auto max-w-full" />
        </div>

        {/* Bento grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              className={`p-6 rounded-3xl border border-border/20 bg-card/40 backdrop-blur-sm ${sizeClasses[card.size]}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Skeleton className="w-10 h-10 rounded-xl mb-4" />
              <Skeleton className={`h-6 ${card.size === 'lg' ? 'w-40' : 'w-28'} mb-2`} />
              <Skeleton className="h-4 w-full mb-1" />
              {card.size !== 'sm' && <Skeleton className="h-4 w-3/4" />}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
