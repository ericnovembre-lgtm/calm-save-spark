import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for hub/feature showcase pages (Feature Hubs, AI Agents, Integrations)
 */
export const HubPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <div className="border-b border-border bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <Skeleton className="h-14 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-[600px] mx-auto mb-8" />
          <div className="flex gap-4 justify-center">
            <Skeleton className="h-12 w-40 rounded-lg" />
            <Skeleton className="h-12 w-40 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-8 rounded-3xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-7 w-48 mb-3" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-3/4 mb-6" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA section */}
        <div className="text-center py-12 border-t border-border">
          <Skeleton className="h-10 w-80 mx-auto mb-4" />
          <Skeleton className="h-12 w-48 mx-auto rounded-lg" />
        </div>
      </div>
    </div>
  );
};
