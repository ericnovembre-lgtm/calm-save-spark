import { Skeleton } from "@/components/ui/skeleton";

export const HubCardSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-8 rounded-3xl border border-border bg-card backdrop-blur-sm">
          <div className="flex justify-between items-start mb-6">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-8 w-3/4 mb-3" />
          <Skeleton className="h-5 w-full mb-6" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
};
