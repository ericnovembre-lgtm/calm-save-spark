import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function AIInsightsHubSkeleton() {
  // Matches features array: 1 lg (AI Coach), 2 sm (Agents, Sentiment), 1 sm (Digital Twin), 1 lg (Analytics), 1 sm (Guardian), 1 wide (Archive)
  const cards = [
    { size: 'lg' as const },   // AI Coach
    { size: 'sm' as const },   // AI Agents
    { size: 'sm' as const },   // Social Sentiment
    { size: 'sm' as const },   // Digital Twin
    { size: 'lg' as const },   // Analytics & Insights
    { size: 'sm' as const },   // Guardian
    { size: 'wide' as const }, // AI Insights Archive
  ];

  const sizeClasses = {
    sm: '',
    lg: 'md:col-span-2 md:row-span-2',
    wide: 'md:col-span-2 lg:col-span-3',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header skeleton */}
      <div className="text-center mb-8">
        <Skeleton className="w-14 h-14 rounded-2xl mx-auto mb-4" />
        <Skeleton className="h-10 w-72 mx-auto mb-3" />
        <Skeleton className="h-5 w-96 mx-auto max-w-full" />
      </div>

      {/* Bento grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            className={`p-6 rounded-3xl border border-white/10 bg-card/40 backdrop-blur-sm ${sizeClasses[card.size]}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <Skeleton className="w-10 h-10 rounded-xl mb-4" />
            <Skeleton className={`h-6 ${card.size === 'lg' ? 'w-40' : 'w-28'} mb-2`} />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
