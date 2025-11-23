import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const PotsSkeletonCard = () => {
  return (
    <Card className="relative overflow-hidden rounded-3xl h-[400px] flex flex-col bg-glass-subtle border-border/40">
      <div className="relative z-10 p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <Skeleton className="h-6 w-2/3" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
        
        {/* Notes */}
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/5 mb-4" />
        
        {/* Balance */}
        <Skeleton className="h-4 w-32 mb-2" />
        
        {/* Target */}
        <Skeleton className="h-4 w-36 mb-4" />
        
        {/* Progress section */}
        <div className="mt-auto">
          <Skeleton className="h-2 w-full rounded-full mb-2" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        
        {/* Action button */}
        <Skeleton className="h-10 w-full mt-4 rounded-lg" />
      </div>
    </Card>
  );
};
