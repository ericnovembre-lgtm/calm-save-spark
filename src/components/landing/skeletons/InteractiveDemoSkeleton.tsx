import { Skeleton } from "@/components/ui/skeleton";

export const InteractiveDemoSkeleton = () => {
  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <Skeleton className="h-12 w-80 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        
        <div className="rounded-3xl border border-border bg-card p-8">
          <Skeleton className="h-[500px] w-full rounded-2xl mb-6" />
          <div className="flex gap-4 justify-center">
            <Skeleton className="h-12 w-32 rounded-full" />
            <Skeleton className="h-12 w-32 rounded-full" />
            <Skeleton className="h-12 w-32 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
};
