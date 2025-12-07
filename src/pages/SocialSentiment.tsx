import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { useSocialSentiment } from '@/hooks/useSocialSentiment';
import { useSentimentHistory } from '@/hooks/useSentimentHistory';
import { useSentimentWatchlist } from '@/hooks/useSentimentWatchlist';
import {
  SentimentHeroCard,
  SentimentWatchlist,
  SentimentHistoryChart,
  SentimentComparison,
  TrendingTopicsFeed,
} from '@/components/sentiment';

export default function SocialSentiment() {
  const [selectedTicker, setSelectedTicker] = useState('NVDA');
  const [historyRange, setHistoryRange] = useState<'7d' | '30d'>('7d');

  const { data: sentimentData, isLoading: sentimentLoading } = useSocialSentiment({
    ticker: selectedTicker,
  });

  const { data: historyData, isLoading: historyLoading } = useSentimentHistory({
    ticker: selectedTicker,
    range: historyRange,
  });

  const { watchlistData, addTicker, removeTicker } = useSentimentWatchlist();

  return (
    <AppLayout>
      <PageTransition>
        <div className="min-h-screen bg-card p-4 md:p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <Activity className="w-8 h-8 text-amber-500" />
                Social Sentiment
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Real-time market sentiment powered by Grok AI
              </p>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              Powered by <span className="font-bold text-white">𝕏</span>
            </div>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Hero + History */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <SentimentHeroCard
                  data={sentimentData}
                  isLoading={sentimentLoading}
                  onTickerChange={setSelectedTicker}
                  currentTicker={selectedTicker}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SentimentHistoryChart
                  data={historyData}
                  isLoading={historyLoading}
                  ticker={selectedTicker}
                  range={historyRange}
                  onRangeChange={setHistoryRange}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <SentimentComparison watchlistData={watchlistData} />
              </motion.div>
            </div>

            {/* Right Column - Watchlist + Trending */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <SentimentWatchlist
                  watchlistData={watchlistData}
                  onAddTicker={addTicker}
                  onRemoveTicker={removeTicker}
                  onSelectTicker={setSelectedTicker}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <TrendingTopicsFeed
                  topics={sentimentData?.trendingTopics || []}
                  isLoading={sentimentLoading}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
