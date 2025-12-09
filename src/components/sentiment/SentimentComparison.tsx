import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WatchlistItem {
  ticker: string;
  data: any;
  isLoading: boolean;
  error: any;
}

interface SentimentComparisonProps {
  watchlistData: WatchlistItem[];
}

export function SentimentComparison({ watchlistData }: SentimentComparisonProps) {
  const sortedData = [...watchlistData]
    .filter(item => item.data)
    .sort((a, b) => (b.data?.sentiment.score || 0) - (a.data?.sentiment.score || 0));

  const getBarColor = (score: number) => {
    if (score >= 30) return 'bg-emerald-500';
    if (score >= 10) return 'bg-green-500';
    if (score >= -10) return 'bg-stone-500';
    if (score >= -30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getBarWidth = (score: number) => {
    return Math.abs(score);
  };

  const getTrendIcon = (score: number) => {
    if (score >= 10) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (score <= -10) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-slate-500" />;
  };

  return (
    <Card className="bg-stone-900/80 border-white/10 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-stone-300 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-yellow-400" />
          Sentiment Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {watchlistData.some(item => item.isLoading) ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : sortedData.length > 0 ? (
          sortedData.map(({ ticker, data }, index) => (
            <motion.div
              key={ticker}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3"
            >
              <span className="font-mono font-bold text-white text-sm w-12">{ticker}</span>
              <div className="flex-1 h-6 bg-slate-800/50 rounded-full overflow-hidden relative">
                {/* Center line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />
                
                {/* Bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getBarWidth(data.sentiment.score) / 2}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`absolute top-0 bottom-0 ${getBarColor(data.sentiment.score)} ${
                    data.sentiment.score >= 0 ? 'left-1/2' : 'right-1/2'
                  }`}
                  style={{
                    transformOrigin: data.sentiment.score >= 0 ? 'left' : 'right',
                  }}
                />
              </div>
              <div className="flex items-center gap-2 w-20 justify-end">
                <span className={`font-mono text-sm ${
                  data.sentiment.score >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {data.sentiment.score > 0 ? '+' : ''}{data.sentiment.score}
                </span>
                {getTrendIcon(data.sentiment.score)}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center text-slate-500 text-sm py-4">
            Add tickers to compare sentiment
          </div>
        )}
      </CardContent>
    </Card>
  );
}
