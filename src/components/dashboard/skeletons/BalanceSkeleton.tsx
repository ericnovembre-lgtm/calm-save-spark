import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BalanceSkeleton() {
  return (
    <Card className="p-8 space-y-6 backdrop-blur-xl bg-card/80 border-border/40">
      {/* Header with balance */}
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-6 w-40 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>

      {/* Chart */}
      <Skeleton className="h-32 w-full rounded-lg" />

      {/* Action buttons */}
      <div className="grid md:grid-cols-2 gap-4 pt-2">
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    </Card>
  );
}
