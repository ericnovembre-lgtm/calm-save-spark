import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { SocialSentimentData } from '@/hooks/useSocialSentiment';
import { SentimentAlertButton } from './SentimentAlertButton';

interface SentimentHeroCardProps {
  data: SocialSentimentData | undefined;
  isLoading: boolean;
  onTickerChange: (ticker: string) => void;
  currentTicker: string;
}

export function SentimentHeroCard({ data, isLoading, onTickerChange, currentTicker }: SentimentHeroCardProps) {
  const [inputValue, setInputValue] = useState(currentTicker);

  const handleSearch = () => {
    if (inputValue.trim()) {
      onTickerChange(inputValue.toUpperCase().trim());
    }
  };

  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'very_bullish': return 'text-emerald-400';
      case 'bullish': return 'text-green-400';
      case 'neutral': return 'text-slate-400';
      case 'bearish': return 'text-orange-400';
      case 'very_bearish': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getVolumeIcon = (volume: string) => {
    switch (volume) {
      case 'viral': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'high': return <Activity className="w-5 h-5 text-cyan-400" />;
      default: return <Activity className="w-5 h-5 text-slate-500" />;
    }
  };

  const score = data?.sentiment.score ?? 0;
  const gaugeRotation = ((score + 100) / 200) * 180 - 90;

  return (
    <Card className="bg-slate-900/80 border-white/10 backdrop-blur-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter ticker..."
            className="bg-slate-800/50 border-white/10 text-white font-mono text-lg w-32"
          />
          <Button onClick={handleSearch} variant="outline" size="sm" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
            Analyze
          </Button>
          {currentTicker && (
            <SentimentAlertButton ticker={currentTicker} />
          )}
          <span className="ml-auto text-xs text-slate-500 flex items-center gap-1">
            Powered by <span className="font-bold">𝕏</span>
          </span>
        </div>

        {isLoading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Large Sentiment Gauge */}
            <div className="relative flex flex-col items-center">
              <svg viewBox="0 0 200 110" className="w-full max-w-xs">
                {/* Background arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                {/* Gradient arc */}
                <defs>
                  <linearGradient id="heroGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="25%" stopColor="#f97316" />
                    <stop offset="50%" stopColor="#a1a1aa" />
                    <stop offset="75%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#heroGaugeGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  opacity="0.3"
                />
                {/* Needle */}
                <motion.g
                  initial={{ rotate: -90 }}
                  animate={{ rotate: gaugeRotation }}
                  transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                  style={{ transformOrigin: '100px 100px' }}
                >
                  <line x1="100" y1="100" x2="100" y2="30" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="100" cy="100" r="8" fill="white" />
                </motion.g>
                {/* Labels */}
                <text x="15" y="108" fill="#ef4444" fontSize="10" fontFamily="monospace">-100</text>
                <text x="175" y="108" fill="#10b981" fontSize="10" fontFamily="monospace">+100</text>
              </svg>

              <motion.div
                className="text-center mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={`text-4xl font-bold font-mono ${getSentimentColor(data.sentiment.label)}`}>
                  {score > 0 ? '+' : ''}{score}
                </div>
                <div className={`text-lg font-semibold uppercase tracking-wider ${getSentimentColor(data.sentiment.label)}`}>
                  {data.sentiment.label.replace('_', ' ')}
                </div>
              </motion.div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="text-center">
                <div className="text-xs text-slate-500 uppercase tracking-wide">Confidence</div>
                <div className="text-xl font-mono text-white">{Math.round(data.sentiment.confidence * 100)}%</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500 uppercase tracking-wide">Volume</div>
                <div className="flex items-center justify-center gap-1">
                  {getVolumeIcon(data.volume)}
                  <span className="text-sm font-medium text-white capitalize">{data.volume}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500 uppercase tracking-wide">Trend</div>
                <div className="flex items-center justify-center">
                  {score >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-500">
            Enter a ticker to analyze sentiment
          </div>
        )}
      </CardContent>
    </Card>
  );
}
