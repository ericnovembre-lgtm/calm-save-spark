import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for chart/analytics-heavy pages (Analytics, Insights, Reports)
 */
export const ChartPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Date range selector */}
        <div className="flex gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-20 rounded-lg" />
          ))}
        </div>

        {/* Main chart */}
        <div className="p-6 rounded-2xl border border-border bg-card mb-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>

        {/* Secondary charts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border border-border bg-card">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
