import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

/**
 * WelcomeLoadingSkeleton - Matches exact layout of Welcome page sections
 * Provides better perceived performance during initial load
 */
export const WelcomeLoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-20">
        {/* Hero Section Skeleton */}
        <motion.section 
          className="space-y-8 relative bg-background -mx-4 px-4 lg:-mx-20 lg:px-20 py-12 rounded-2xl border border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Hero Text Skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-16 w-full max-w-lg" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-8 w-full max-w-md" />
              <Skeleton className="h-6 w-full max-w-md" />
              <div className="flex gap-4 pt-4">
                <Skeleton className="h-12 w-48 rounded-lg" />
                <Skeleton className="h-12 w-36 rounded-lg" />
              </div>
            </div>

            {/* Hero Animation Skeleton */}
            <div className="relative w-full max-w-md mx-auto lg:max-w-none">
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
          </div>
        </motion.section>

        {/* Features Section Skeleton */}
        <motion.section 
          className="space-y-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="text-center space-y-4">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          
          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i}
                className="bg-card border border-border rounded-2xl p-6 space-y-4"
              >
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        </motion.section>

        {/* Stats Section Skeleton */}
        <motion.section 
          className="space-y-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="text-center space-y-4">
            <Skeleton className="h-10 w-80 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className="bg-card border border-border rounded-2xl p-8 text-center space-y-4"
              >
                <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                <Skeleton className="h-12 w-24 mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section Skeleton */}
        <motion.section 
          className="bg-card border border-border rounded-3xl p-12 text-center space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Skeleton className="h-12 w-96 mx-auto" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
          <div className="flex justify-center gap-4 pt-4">
            <Skeleton className="h-12 w-48 rounded-lg" />
            <Skeleton className="h-12 w-36 rounded-lg" />
          </div>
        </motion.section>
      </div>

      {/* Footer Skeleton */}
      <footer className="border-t border-border mt-20 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};
