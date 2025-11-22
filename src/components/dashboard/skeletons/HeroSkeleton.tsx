import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function HeroSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-8 space-y-6 backdrop-blur-xl bg-card/80 border-border/40">
        {/* Header section */}
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-16 w-16 rounded-xl" />
        </div>

        {/* Content section */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-11 w-36 rounded-lg" />
          <Skeleton className="h-11 w-36 rounded-lg" />
        </div>
      </Card>
    </motion.div>
  );
}
