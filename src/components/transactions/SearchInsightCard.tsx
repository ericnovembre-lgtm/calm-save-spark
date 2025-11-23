import { motion } from "framer-motion";
import { Sparkles, TrendingDown, TrendingUp, Calendar } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CountUp from "react-countup";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";

interface SearchInsightCardProps {
  query: string;
  totalAmount: number;
  transactionCount: number;
  dateRange?: { start: Date; end: Date };
  insights?: string;
  onRefineSearch?: () => void;
  onSaveReport?: () => void;
  isLoading?: boolean;
}

export function SearchInsightCard({
  query,
  totalAmount,
  transactionCount,
  dateRange,
  insights,
  onRefineSearch,
  onSaveReport,
  isLoading = false,
}: SearchInsightCardProps) {
  const isPositive = totalAmount >= 0;
  const dateRangeText = dateRange
    ? `${format(dateRange.start, 'MMM dd')} - ${format(dateRange.end, 'MMM dd, yyyy')}`
    : 'All time';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <GlassPanel variant="strong" className="p-6 border-accent/30 mb-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  Search Results
                  <Badge variant="secondary" className="text-xs">
                    {transactionCount} {transactionCount === 1 ? 'transaction' : 'transactions'}
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">"{query}"</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onRefineSearch && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    onRefineSearch();
                  }}
                >
                  Refine
                </Button>
              )}
              {onSaveReport && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    onSaveReport();
                  }}
                >
                  Save Report
                </Button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Amount */}
            <div className="p-4 bg-background/50 border border-border rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                )}
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Total Amount
                </span>
              </div>
              <div className={`text-3xl font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {isPositive ? '+' : '-'}$
                <CountUp end={Math.abs(totalAmount)} decimals={2} duration={1} />
              </div>
            </div>

            {/* Average Per Transaction */}
            <div className="p-4 bg-background/50 border border-border rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Avg Per Transaction
                </span>
              </div>
              <div className="text-3xl font-bold text-foreground">
                ${transactionCount > 0 ? (Math.abs(totalAmount) / transactionCount).toFixed(2) : '0.00'}
              </div>
            </div>

            {/* Date Range */}
            <div className="p-4 bg-background/50 border border-border rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-foreground/60" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Time Period
                </span>
              </div>
              <div className="text-lg font-bold text-foreground">
                {dateRangeText}
              </div>
              {dateRange && (
                <div className="text-xs text-muted-foreground mt-1">
                  {differenceInDays(dateRange.end, dateRange.start)} days
                </div>
              )}
            </div>
          </div>

          {/* AI Insights */}
          {isLoading ? (
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-accent/30 animate-pulse" />
                <div className="h-4 bg-accent/20 rounded flex-1 animate-pulse" />
              </div>
            </div>
          ) : insights ? (
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
              <p className="text-sm text-foreground leading-relaxed">
                💡 {insights}
              </p>
            </div>
          ) : null}
        </div>
      </GlassPanel>
    </motion.div>
  );
}
