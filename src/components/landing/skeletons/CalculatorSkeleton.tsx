import { Skeleton } from "@/components/ui/skeleton";

export const CalculatorSkeleton = () => {
  return (
    <section className="py-20 px-4 md:px-20" id="calculator">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 space-y-4">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        
        <div className="p-8 rounded-3xl border border-border bg-card">
          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div>
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div>
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-32 w-full rounded-2xl mt-8" />
          </div>
        </div>
      </div>
    </section>
  );
};
