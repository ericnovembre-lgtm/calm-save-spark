import { Skeleton } from "@/components/ui/skeleton";

export const PremiumShowcaseSkeleton = () => {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <Skeleton className="h-12 w-96 mx-auto" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-start justify-between mb-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-7 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Skeleton className="h-12 w-48 mx-auto rounded-full" />
        </div>
      </div>
    </section>
  );
};
