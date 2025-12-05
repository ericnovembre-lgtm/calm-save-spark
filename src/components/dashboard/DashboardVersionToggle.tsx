import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function DashboardVersionToggle() {
  const location = useLocation();
  const isAIMode = location.pathname === '/dashboard-v2';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative flex items-center rounded-full bg-muted/50 p-0.5 border border-border/50">
            {/* Animated background pill */}
            <motion.div
              className="absolute h-[calc(100%-4px)] rounded-full bg-background shadow-sm"
              initial={false}
              animate={{
                x: isAIMode ? '100%' : '0%',
                width: isAIMode ? 'calc(50% - 2px)' : 'calc(50% - 2px)',
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              style={{ left: 2 }}
            />

            {/* Classic Option */}
            <Link
              to="/dashboard"
              className={cn(
                'relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors',
                !isAIMode
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground/80'
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Classic</span>
            </Link>

            {/* AI-Powered Option */}
            <Link
              to="/dashboard-v2"
              className={cn(
                'relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors',
                isAIMode
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground/80'
              )}
            >
              <Sparkles className={cn("h-3.5 w-3.5", isAIMode && "text-violet-400")} />
              <span className="hidden sm:inline">AI</span>
              <span className="hidden md:inline text-violet-400">✨</span>
            </Link>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <p className="text-xs">
            {isAIMode 
              ? 'AI-powered dashboard with Claude Opus 4.5 personalization'
              : 'Switch to AI-powered dashboard for personalized insights'
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
