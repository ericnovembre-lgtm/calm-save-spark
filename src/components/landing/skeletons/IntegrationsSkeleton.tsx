import { Skeleton } from "@/components/ui/skeleton";

export const IntegrationsSkeleton = () => {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <Skeleton className="h-12 w-96 mx-auto" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-8 mb-8">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
        
        <div className="text-center">
          <Skeleton className="h-6 w-64 mx-auto" />
        </div>
      </div>
    </section>
  );
};
