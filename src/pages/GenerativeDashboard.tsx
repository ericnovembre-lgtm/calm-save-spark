import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Sparkles, AlertCircle, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useClaudeGenerativeDashboard } from '@/hooks/useClaudeGenerativeDashboard';
import { AIThemeProvider } from '@/components/dashboard/generative/AIThemeProvider';
import { GenerativeLayoutGrid } from '@/components/dashboard/generative/GenerativeLayoutGrid';
import { GenerativeBriefing } from '@/components/dashboard/generative/GenerativeBriefing';
import { GenerativeDashboardSkeleton } from '@/components/dashboard/generative/GenerativeDashboardSkeleton';
import { DashboardVersionToggle } from '@/components/dashboard/DashboardVersionToggle';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function GenerativeDashboard() {
  const {
    layout,
    widgets,
    theme,
    briefing,
    reasoning,
    isLoading,
    error,
    context,
    meta,
    lastRefresh,
    refresh
  } = useClaudeGenerativeDashboard();

  return (
    <AIThemeProvider theme={theme}>
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: isLoading ? 360 : 0 }}
                  transition={{ duration: 2, repeat: isLoading ? Infinity : 0, ease: 'linear' }}
                >
                  <Sparkles className="h-6 w-6 text-violet-400" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">$ave+ Dashboard</h1>
                  <p className="text-xs text-muted-foreground">
                    AI-Generated • {meta?.model || 'Claude Opus 4.5'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DashboardVersionToggle />
                {lastRefresh && (
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    Updated {lastRefresh.toLocaleTimeString()}
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refresh}
                  disabled={isLoading}
                  className="border-white/10"
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                  Regenerate
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-9 w-9"
                >
                  <Link to="/settings">
                    <Settings2 className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {/* Error State */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}. Showing default dashboard layout.
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading ? (
            <GenerativeDashboardSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* AI Briefing */}
              <GenerativeBriefing
                briefing={briefing}
                theme={theme}
                reasoning={reasoning}
                meta={meta}
              />

              {/* Generative Widget Grid */}
              <GenerativeLayoutGrid
                layout={layout}
                widgets={widgets}
              />

              {/* Context Summary (Debug) */}
              {context && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground py-4"
                >
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {context.timeOfDay}
                  </span>
                  <span>•</span>
                  <span>${context.totalSavings?.toLocaleString() || '0'} saved</span>
                  <span>•</span>
                  <span>{context.goalsCount || 0} goals</span>
                  <span>•</span>
                  <span>{context.streak || 0} day streak</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-4 mt-8">
          <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <Sparkles className="h-3 w-3 text-violet-400" />
              Dashboard personalized by Claude Opus 4.5
            </p>
          </div>
        </footer>
      </div>
    </AIThemeProvider>
  );
}
