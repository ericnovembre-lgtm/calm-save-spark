import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, TrendingUp, TrendingDown, Minus, Activity, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface WatchlistItem {
  ticker: string;
  data: any;
  isLoading: boolean;
  error: any;
}

interface SentimentWatchlistProps {
  watchlistData: WatchlistItem[];
  onAddTicker: (ticker: string) => void;
  onRemoveTicker: (ticker: string) => void;
  onSelectTicker: (ticker: string) => void;
}

export function SentimentWatchlist({ watchlistData, onAddTicker, onRemoveTicker, onSelectTicker }: SentimentWatchlistProps) {
  const [newTicker, setNewTicker] = useState('');

  const handleAdd = () => {
    if (newTicker.trim()) {
      onAddTicker(newTicker);
      setNewTicker('');
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 30) return 'text-emerald-400';
    if (score >= 10) return 'text-green-400';
    if (score >= -10) return 'text-slate-400';
    if (score >= -30) return 'text-orange-400';
    return 'text-red-400';
  };

  const getTrendIcon = (score: number) => {
    if (score >= 10) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (score <= -10) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-slate-500" />;
  };

  const getVolumeIcon = (volume: string) => {
    if (volume === 'viral') return <Zap className="w-3 h-3 text-yellow-400" />;
    if (volume === 'high') return <Activity className="w-3 h-3 text-cyan-400" />;
    return <Activity className="w-3 h-3 text-slate-600" />;
  };

  return (
    <Card className="bg-slate-900/80 border-white/10 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          Watchlist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add ticker input */}
        <div className="flex gap-2">
          <Input
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Add ticker..."
            className="bg-slate-800/50 border-white/10 text-white font-mono text-sm h-8"
          />
          <Button onClick={handleAdd} size="sm" variant="ghost" className="h-8 px-2 hover:bg-cyan-500/10">
            <Plus className="w-4 h-4 text-cyan-400" />
          </Button>
        </div>

        {/* Watchlist items */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          <AnimatePresence>
            {watchlistData.map(({ ticker, data, isLoading }) => (
              <motion.div
                key={ticker}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800/80 cursor-pointer group transition-colors"
                onClick={() => onSelectTicker(ticker)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-white text-sm">{ticker}</span>
                  {isLoading ? (
                    <Skeleton className="w-12 h-4" />
                  ) : data ? (
                    <>
                      <span className={`font-mono text-sm ${getSentimentColor(data.sentiment.score)}`}>
                        {data.sentiment.score > 0 ? '+' : ''}{data.sentiment.score}
                      </span>
                      {getTrendIcon(data.sentiment.score)}
                      {getVolumeIcon(data.volume)}
                    </>
                  ) : (
                    <span className="text-xs text-slate-500">--</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveTicker(ticker);
                  }}
                >
                  <X className="w-3 h-3 text-red-400" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
