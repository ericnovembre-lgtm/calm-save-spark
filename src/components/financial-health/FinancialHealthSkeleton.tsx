import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

export const FinancialHealthSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-12 space-y-16 max-w-7xl">
      {/* Header skeleton */}
      <div className="text-center space-y-4">
        <div className="h-16 w-3/4 mx-auto bg-gradient-to-r from-muted via-muted/50 to-muted rounded-lg animate-pulse" />
        <div className="h-6 w-1/2 mx-auto bg-muted/50 rounded-lg animate-pulse" />
      </div>

      {/* Globe skeleton */}
      <Card className="p-8">
        <div className="h-[400px] w-full bg-gradient-to-br from-muted via-muted/50 to-muted rounded-2xl animate-pulse" />
      </Card>

      {/* Timeline skeleton */}
      <Card className="p-6">
        <div className="h-[300px] w-full bg-gradient-to-r from-muted via-muted/50 to-muted rounded-lg animate-pulse" />
      </Card>

      {/* Metrics grid skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 h-48">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 bg-muted rounded-xl animate-pulse" />
                  <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-6 w-1/2 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-2 w-full bg-muted rounded-full animate-pulse" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
