import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function ActionsSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-3"
    >
      <Skeleton className="h-4 w-32" />
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            className="h-[72px] w-56 rounded-xl flex-shrink-0"
          />
        ))}
      </div>
    </motion.div>
  );
}
