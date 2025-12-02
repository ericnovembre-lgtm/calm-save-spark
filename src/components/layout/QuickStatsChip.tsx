import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useNetWorthData } from "@/hooks/useNetWorthData";
import { useGoalsProgress } from "@/hooks/useGoalsProgress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface QuickStatsChipProps {
  netWorth?: number;
  trend?: "up" | "down";
  trendPercent?: number;
  savingsProgress?: number;
}

export const QuickStatsChip = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: netWorthData, isLoading: netWorthLoading, isError: netWorthError, error: netWorthErrorMsg } = useNetWorthData();
  const { data: goalsData, isLoading: goalsLoading, isError: goalsError, error: goalsErrorMsg } = useGoalsProgress();

  const netWorth = netWorthData?.currentNetWorth ?? 0;
  const totalAssets = netWorthData?.totalAssets ?? 0;
  const totalDebts = netWorthData?.totalDebts ?? 0;
  const monthlyChangePercent = netWorthData?.monthlyChangePercent ?? 0;
  const trend = monthlyChangePercent >= 0 ? "up" : "down";
  const trendPercent = Math.abs(monthlyChangePercent);
  
  const savingsProgress = goalsData?.overallProgress ?? 0;
  const totalSaved = goalsData?.totalSaved ?? 0;
  const totalTarget = goalsData?.totalTarget ?? 0;
  const activeGoalsCount = goalsData?.activeGoalsCount ?? 0;

  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  const hasError = netWorthError || goalsError;

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['net-worth-data'] });
    queryClient.invalidateQueries({ queryKey: ['goals-progress'] });
  };

  if (netWorthLoading || goalsLoading) {
    return (
      <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full glass-bg-strong backdrop-blur-xl border border-accent/20 shadow-glass">
        {/* Trend Icon Skeleton */}
        <Skeleton className="w-3.5 h-3.5 rounded-full" />
        
        {/* Net Worth & Trend Skeleton */}
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-2 w-10" />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Progress Ring Skeleton */}
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
    );
  }

  if (hasError) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={handleRetry}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full glass-bg-strong backdrop-blur-xl border border-amber-500/30 shadow-glass cursor-pointer hover:border-amber-500/50 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs text-amber-500 font-medium">Data Error</span>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-semibold">Failed to load financial data</p>
              {netWorthError && (
                <p className="text-xs text-muted-foreground">
                  Net Worth: {netWorthErrorMsg?.message || 'Unknown error'}
                </p>
              )}
              {goalsError && (
                <p className="text-xs text-muted-foreground">
                  Goals: {goalsErrorMsg?.message || 'Unknown error'}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">Click to retry</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/financial-health')}
            className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full glass-bg-strong backdrop-blur-xl border border-accent/20 shadow-glass cursor-pointer"
          >
            {/* Net Worth */}
      <div className="flex items-center gap-1.5">
        <TrendIcon 
          className={cn(
            "w-3.5 h-3.5",
            trend === "up" ? "text-success" : "text-destructive"
          )} 
        />
        <div className="flex flex-col">
          <span className="text-xs font-medium leading-none">
            ${netWorth.toLocaleString()}
          </span>
          <span className={cn(
            "text-[10px] leading-none mt-0.5",
            trend === "up" ? "text-success" : "text-destructive"
          )}>
            {trend === "up" ? "+" : "-"}{trendPercent}%
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-border" />

      {/* Savings Progress Ring */}
      <div className="relative">
        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
          {/* Background circle */}
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted"
            opacity="0.2"
          />
          {/* Progress circle */}
          <motion.circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-accent"
            initial={{ strokeDashoffset: 88 }}
            animate={{ 
              strokeDashoffset: 88 - (88 * savingsProgress) / 100 
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              strokeDasharray: 88,
            }}
          />
        </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
              {savingsProgress}
            </span>
          </div>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="space-y-2 text-sm">
          <div>
            <p className="font-semibold">Net Worth: ${netWorth.toLocaleString()}</p>
            <div className="text-xs text-muted-foreground mt-1 ml-2">
              <p>└ Assets: ${totalAssets.toLocaleString()}</p>
              <p>└ Debts: ${totalDebts.toLocaleString()}</p>
              <p className={cn(
                "└ Monthly Change:",
                trend === "up" ? "text-success" : "text-destructive"
              )}>
                {trend === "up" ? "+" : "-"}{trendPercent.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="border-t border-border pt-2">
            <p className="font-semibold">Savings Goals</p>
            <div className="text-xs text-muted-foreground mt-1 ml-2">
              <p>└ Progress: {savingsProgress}%</p>
              <p>└ Saved: ${totalSaved.toLocaleString()} / ${totalTarget.toLocaleString()}</p>
              <p>└ Active Goals: {activeGoalsCount}</p>
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
  );
};
