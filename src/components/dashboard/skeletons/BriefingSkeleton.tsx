import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function BriefingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="p-6 backdrop-blur-xl bg-card/80 border-border/40">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20 ml-auto" />
        </div>
        
        {/* Content lines */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </Card>
    </motion.div>
  );
}
