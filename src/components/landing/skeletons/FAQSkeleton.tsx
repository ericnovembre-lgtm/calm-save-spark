import { Skeleton } from "@/components/ui/skeleton";

export const FAQSkeleton = () => {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12 space-y-4">
          <Skeleton className="h-12 w-96 mx-auto" />
          <Skeleton className="h-6 w-64 mx-auto" />
        </div>
        
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border border-border rounded-2xl p-6">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
