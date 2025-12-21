/**
 * BentoSkeleton - Loading skeleton states for Bento cards
 */

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BentoSkeletonProps {
  variant?: "metric" | "chart" | "gauge" | "list" | "actions";
  className?: string;
}

export function BentoSkeleton({ variant = "metric", className }: BentoSkeletonProps) {
  const baseClasses = "rounded-3xl border border-border/50 bg-card p-6";
  
  if (variant === "metric") {
    return (
      <div className={cn(baseClasses, className)}>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32 mt-2" />
            <Skeleton className="h-5 w-16 mt-2 rounded-full" />
          </div>
          <Skeleton className="h-11 w-11 rounded-2xl" />
        </div>
      </div>
    );
  }
  
  if (variant === "chart") {
    return (
      <div className={cn(baseClasses, "h-full", className)}>
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <div className="flex justify-between mt-4 pt-4 border-t border-border/50">
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>
    );
  }
  
  if (variant === "gauge") {
    return (
      <div className={cn(baseClasses, "h-full", className)}>
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <div className="flex-1 flex items-center justify-center min-h-[160px]">
          <Skeleton className="h-32 w-32 rounded-full" />
        </div>
        <div className="flex justify-between mt-2">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    );
  }
  
  if (variant === "list") {
    return (
      <div className={cn(baseClasses, "p-0 overflow-hidden", className)}>
        <div className="p-6 pb-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        <div className="px-3 pb-3 space-y-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (variant === "actions") {
    return (
      <div className={cn(baseClasses, className)}>
        <Skeleton className="h-5 w-28 mb-4" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </div>
    );
  }
  
  return null;
}
