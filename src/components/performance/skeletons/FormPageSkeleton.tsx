import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for form-heavy pages (Onboarding, Checkout, Applications)
 */
export const FormPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-2 w-16 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-1 w-full rounded-full" />
        </div>

        {/* Form header */}
        <div className="mb-8 text-center">
          <Skeleton className="h-10 w-80 mx-auto mb-4" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>

        {/* Form fields */}
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-8">
          <Skeleton className="h-12 w-24 rounded-lg" />
          <Skeleton className="h-12 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
