import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { InsightCard } from '@/components/insights-archive/InsightCard';
import { InsightFilters } from '@/components/insights-archive/InsightFilters';
import { InsightImpactSummary } from '@/components/insights-archive/InsightImpactSummary';
import { useInsightsArchive, InsightImpactLevel } from '@/hooks/useInsightsArchive';
import { Lightbulb, Archive } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface InsightFilterState {
  insightType?: string;
  impactLevel?: InsightImpactLevel;
  actionTaken?: boolean;
  dismissed?: boolean;
  sourceAgent?: string;
}

export default function AIInsightsArchive() {
  const [filters, setFilters] = useState<InsightFilterState>({ dismissed: false });
  const { insights, isLoading, markActionTaken, dismissInsight } = useInsightsArchive(filters);

  return (
    <AppLayout>
      <div 
        className="container max-w-6xl mx-auto px-4 py-8 space-y-6"
        data-copilot-id="ai-insights-archive-page"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Archive className="w-6 h-6" />
            AI Insights Archive
          </h1>
          <p className="text-muted-foreground">
            Review and act on AI-generated financial insights
          </p>
        </div>

        <InsightImpactSummary />

        <InsightFilters filters={filters} onFiltersChange={setFilters} />

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-12">
              <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No insights found</h3>
              <p className="text-sm text-muted-foreground">
                {Object.values(filters).some(v => v !== undefined && v !== false)
                  ? 'Try adjusting your filters'
                  : 'AI insights will appear here as you use $ave+'}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {insights.map(insight => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onMarkActionTaken={id => markActionTaken.mutate({ id })}
                  onDismiss={id => dismissInsight.mutate(id)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </AppLayout>
  );
}