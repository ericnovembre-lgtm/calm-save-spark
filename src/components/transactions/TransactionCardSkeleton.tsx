import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TransactionCardSkeletonProps {
  className?: string;
}

export function TransactionCardSkeleton({ className }: TransactionCardSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "bg-glass border border-glass-border rounded-2xl p-4",
        className
      )}
    >
      {/* Top section - Logo + Merchant + Amount */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Logo skeleton */}
          <div className="w-16 h-16 bg-muted/30 rounded-full animate-pulse" />
          <div className="space-y-2">
            {/* Merchant name */}
            <div className="h-5 bg-muted/30 rounded w-32 animate-pulse" />
            {/* Description */}
            <div className="h-3 bg-muted/30 rounded w-24 animate-pulse" />
          </div>
        </div>
        <div className="text-right space-y-2">
          {/* Amount */}
          <div className="h-7 bg-muted/30 rounded w-20 animate-pulse" />
          {/* Date */}
          <div className="h-3 bg-muted/30 rounded w-16 animate-pulse" />
        </div>
      </div>

      {/* Badges skeleton */}
      <div className="flex gap-2 mb-3">
        <div className="h-5 bg-muted/30 rounded-full w-16 animate-pulse" />
        <div className="h-5 bg-muted/30 rounded-full w-20 animate-pulse" />
        <div className="h-5 bg-muted/30 rounded-full w-14 animate-pulse" />
      </div>

      {/* Metadata skeleton */}
      <div className="h-3 bg-muted/30 rounded w-32 animate-pulse" />
    </motion.div>
  );
}
