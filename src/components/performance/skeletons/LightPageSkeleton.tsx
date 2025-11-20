import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for light pages (Auth, Help, Static content)
 */
export const LightPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <Skeleton className="h-12 w-48 mx-auto mb-4" />
          <Skeleton className="h-6 w-64 mx-auto" />
        </div>
        
        <div className="p-8 rounded-2xl border border-border bg-card">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};
