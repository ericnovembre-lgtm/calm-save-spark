import { Skeleton } from "@/components/ui/skeleton";

export const FeatureComparisonSkeleton = () => {
  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <Skeleton className="h-12 w-80 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-border rounded-3xl p-8 bg-card">
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-12 w-24 mb-6" />
              <div className="space-y-4">
                {[...Array(8)].map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-12 w-full rounded-full mt-8" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
