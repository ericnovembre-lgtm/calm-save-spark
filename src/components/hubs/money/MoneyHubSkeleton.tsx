import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function MoneyHubSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-7xl">
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

      {/* AI Command Center Skeleton */}
      <Card className="p-3 md:p-4 lg:p-5 mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <Skeleton className="w-5 h-5 md:w-6 md:h-6 rounded-full shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-5 w-40 md:w-48 mb-2" />
              <Skeleton className="h-3 w-24 md:w-32" />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="w-12 h-14 md:w-16 md:h-16 rounded-lg" />
            <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-md" />
          </div>
        </div>
        <div className="space-y-1.5 md:space-y-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </Card>

      {/* Feature Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-4 md:p-5 lg:p-6 h-full">
              <Skeleton className="w-10 h-10 md:w-12 md:h-12 mb-3 md:mb-4 rounded-xl" />
              <Skeleton className="h-5 md:h-6 w-32 mb-1.5 md:mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-4/5" />
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
