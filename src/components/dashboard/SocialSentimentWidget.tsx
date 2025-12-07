import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Activity, Flame, Search, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSocialSentiment, SocialSentimentData } from '@/hooks/useSocialSentiment';
import { cn } from '@/lib/utils';

interface SocialSentimentWidgetProps {
  className?: string;
}

const SentimentGauge: React.FC<{ score: number; label: string }> = ({ score, label }) => {
  const normalizedPosition = ((score + 100) / 200) * 100;
  
  const getGaugeColor = () => {
    if (score <= -40) return 'from-rose-500 to-rose-600';
    if (score <= -10) return 'from-orange-500 to-orange-600';
    if (score <= 10) return 'from-slate-400 to-slate-500';
    if (score <= 40) return 'from-emerald-400 to-emerald-500';
    return 'from-emerald-500 to-emerald-600';
  };

  return (
    <div className="space-y-2">
      <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-muted/50 to-emerald-500/20" />
        
        {/* Score indicator */}
        <motion.div
          className={cn(
            "absolute top-0 h-full w-4 rounded-full bg-gradient-to-b shadow-lg",
            getGaugeColor()
          )}
          initial={{ left: '50%' }}
          animate={{ left: `calc(${normalizedPosition}% - 8px)` }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>-100</span>
        <motion.span 
          className={cn(
            "font-semibold text-sm",
            score > 20 ? 'text-emerald-400' : score < -20 ? 'text-rose-400' : 'text-slate-400'
          )}
          key={score}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {score > 0 ? '+' : ''}{score} • {label.replace('_', ' ').toUpperCase()}
        </motion.span>
        <span>+100</span>
      </div>
    </div>
  );
};

const VolumeIndicator: React.FC<{ volume: SocialSentimentData['volume'] }> = ({ volume }) => {
  const volumeConfig = {
    low: { color: 'text-muted-foreground', bars: 1, label: 'Low' },
    moderate: { color: 'text-amber-600', bars: 2, label: 'Moderate' },
    high: { color: 'text-orange-500', bars: 3, label: 'High' },
    viral: { color: 'text-rose-500', bars: 4, label: 'Viral' },
  };

  const config = volumeConfig[volume];

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-end gap-0.5 h-4">
        {[1, 2, 3, 4].map((bar) => (
          <motion.div
            key={bar}
            className={cn(
              "w-1 rounded-sm",
              bar <= config.bars ? config.color : 'bg-slate-700'
            )}
            style={{ 
              height: `${bar * 25}%`,
              backgroundColor: bar <= config.bars ? undefined : undefined,
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: bar * 0.1 }}
          />
        ))}
      </div>
      <span className={cn("text-xs font-medium", config.color)}>
        {config.label}
      </span>
      {volume === 'viral' && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Flame className="h-3 w-3 text-rose-400" />
        </motion.div>
      )}
    </div>
  );
};

const TrendingTopicsList: React.FC<{ topics: string[] }> = ({ topics }) => {
  if (!topics.length) return null;

  return (
    <div className="space-y-1.5">
      <span className="text-xs text-muted-foreground font-medium">Trending</span>
      <div className="space-y-1">
        {topics.slice(0, 3).map((topic, index) => (
          <motion.div
            key={topic}
            className="flex items-start gap-2 text-xs"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <span className="text-amber-600 mt-0.5">•</span>
            <span className="text-foreground/80 line-clamp-1">{topic}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const SocialSentimentWidget: React.FC<SocialSentimentWidgetProps> = ({ className }) => {
  const [searchTicker, setSearchTicker] = useState('');
  const [activeTicker, setActiveTicker] = useState('market');
  
  const { data, isLoading, error, refetch } = useSocialSentiment({ 
    ticker: activeTicker,
    enabled: true,
  });

  const handleSearch = () => {
    if (searchTicker.trim()) {
      setActiveTicker(searchTicker.trim().toUpperCase());
      setSearchTicker('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getSentimentIcon = () => {
    if (!data) return <Activity className="h-4 w-4" />;
    if (data.sentiment.score > 20) return <TrendingUp className="h-4 w-4 text-emerald-400" />;
    if (data.sentiment.score < -20) return <TrendingDown className="h-4 w-4 text-rose-400" />;
    return <Minus className="h-4 w-4 text-slate-400" />;
  };

  if (isLoading) {
    return (
      <Card className={cn("bg-card/50 backdrop-blur-sm border-border/50", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-4 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden",
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getSentimentIcon()}
            <span>
              {activeTicker === 'market' ? 'Market Sentiment' : `${activeTicker} Sentiment`}
            </span>
          </CardTitle>
          <Badge 
            variant="outline" 
            className="text-[10px] px-1.5 py-0 bg-secondary border-border text-foreground"
          >
            <ExternalLink className="h-2.5 w-2.5 mr-1" />
            Grok
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4"
            >
              <p className="text-xs text-muted-foreground">Unable to fetch sentiment</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => refetch()}
                className="mt-2 text-xs"
              >
                Retry
              </Button>
            </motion.div>
          ) : data ? (
            <motion.div
              key="data"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Sentiment Gauge */}
              <SentimentGauge 
                score={data.sentiment.score} 
                label={data.sentiment.label} 
              />
              
              {/* Confidence & Volume Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Confidence:</span>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-[10px] px-1.5 py-0",
                      data.sentiment.confidence > 0.7 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-slate-500/20 text-slate-400'
                    )}
                  >
                    {Math.round(data.sentiment.confidence * 100)}%
                  </Badge>
                </div>
                <VolumeIndicator volume={data.volume} />
              </div>
              
              {/* Trending Topics */}
              <TrendingTopicsList topics={data.trendingTopics} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Ticker Search */}
        <div className="flex gap-2 pt-2 border-t border-border/50">
          <Input
            placeholder="Check ticker..."
            value={searchTicker}
            onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            className="h-7 text-xs bg-background/50"
          />
          <Button 
            size="sm" 
            variant="secondary"
            onClick={handleSearch}
            disabled={!searchTicker.trim()}
            className="h-7 px-2"
          >
            <Search className="h-3 w-3" />
          </Button>
        </div>

        {/* Last Updated */}
        {data && (
          <p className="text-[10px] text-muted-foreground/60 text-right">
            Updated {new Date(data.lastUpdated).toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialSentimentWidget;
