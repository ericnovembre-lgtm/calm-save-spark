import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Sparkles, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GenerativeDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Loading Header */}
      <div className="flex items-center justify-center py-8">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-3 text-muted-foreground"
        >
          <Brain className="h-6 w-6 text-amber-500" />
          <span className="text-sm font-medium">Claude Opus is designing your dashboard...</span>
          <Sparkles className="h-4 w-4 text-amber-400" />
        </motion.div>
      </div>

      {/* Briefing Skeleton */}
      <Card className="border-white/10 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>

      {/* Hero Skeleton */}
      <Card className="border-white/10 bg-card/50 backdrop-blur-sm min-h-[280px]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-48 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>

      {/* Featured Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-white/10 bg-card/50 backdrop-blur-sm min-h-[200px]">
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-white/10 bg-card/50 backdrop-blur-sm min-h-[200px]">
          <CardHeader>
            <Skeleton className="h-5 w-20" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-white/10 bg-card/50 backdrop-blur-sm min-h-[140px]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-16 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Processing indicator */}
      <div className="flex justify-center py-4">
        <motion.div
          className="flex items-center gap-2"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </motion.div>
      </div>
    </div>
  );
}
