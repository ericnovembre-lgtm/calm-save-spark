import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { NaturalLanguageCommander } from '@/components/dashboard/NaturalLanguageCommander';
import { AdHocChartPanel } from '@/components/dashboard/AdHocChartPanel';
import { EphemeralWidgetRenderer } from '@/components/dashboard/widgets/EphemeralWidgetRenderer';
import { GenerativeBriefing } from '@/components/dashboard/generative/GenerativeBriefing';
import { GenerativeDashboardSkeleton } from '@/components/dashboard/generative/GenerativeDashboardSkeleton';
import { UnifiedGenerativeGrid } from '@/components/dashboard/generative/UnifiedGenerativeGrid';
import { NLQResponse } from '@/lib/ephemeral-widgets';

interface AIContext {
  timeOfDay: string;
  totalSavings: number;
  goalsCount: number;
  streak: number;
}

interface DashboardMeta {
  model: string;
  processingTimeMs: number;
  generatedAt: string;
}

interface DashboardContentProps {
  isGenerating: boolean;
  generationError?: string | null;
  layout: any;
  widgets: Record<string, any>;
  theme: any;
  briefing?: any;
  reasoning?: string;
  meta?: DashboardMeta | null;
  streamingText?: string;
  aiContext?: AIContext;
  isChatOpen: boolean;
  isMobile: boolean;
  onModalOpen: (modalId: string) => void;
  // NLQ props
  nlqQuery: string;
  nlqIsProcessing: boolean;
  nlqShowChart: boolean;
  nlqChartData: Array<{ name: string; value: number }>;
  nlqInsight: string;
  nlqResponse: NLQResponse | null;
  onNLQuery: (query: string) => void;
  onCloseChart: () => void;
}

export function DashboardContent({
  isGenerating,
  generationError,
  layout,
  widgets,
  theme,
  briefing,
  reasoning,
  meta,
  streamingText,
  aiContext,
  isChatOpen,
  isMobile,
  onModalOpen,
  nlqQuery,
  nlqIsProcessing,
  nlqShowChart,
  nlqChartData,
  nlqInsight,
  nlqResponse,
  onNLQuery,
  onCloseChart,
}: DashboardContentProps) {
  return (
    <main 
      id="main-content" 
      className={cn(
        "container mx-auto px-4 py-6 transition-all duration-300",
        isChatOpen && !isMobile && "mr-96"
      )}
    >
      {/* Error State */}
      {generationError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {generationError}. Showing default layout.
          </AlertDescription>
        </Alert>
      )}

      {/* NLQ Commander */}
      <div className="mb-6" data-tour="nlq-commander">
        <NaturalLanguageCommander 
          onQuery={onNLQuery}
          isProcessing={nlqIsProcessing}
        />
      </div>

      {/* Ad-hoc Chart Panel or Ephemeral Widget */}
      {nlqShowChart && (
        nlqResponse?.type === 'ephemeral_widget' && nlqResponse.widget ? (
          <EphemeralWidgetRenderer
            spec={nlqResponse.widget}
            onDismiss={onCloseChart}
          />
        ) : (
          <AdHocChartPanel
            isOpen={nlqShowChart}
            onClose={onCloseChart}
            query={nlqQuery}
            data={nlqChartData}
            insight={nlqInsight}
            isLoading={nlqIsProcessing}
          />
        )
      )}

      {/* AI Dashboard Content */}
      {isGenerating ? (
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
            streamingText={streamingText}
          />

          {/* Unified Generative Widget Grid */}
          <UnifiedGenerativeGrid
            layout={layout}
            widgets={widgets}
            theme={theme}
            onModalOpen={onModalOpen}
          />

          {/* Context Summary */}
          {aiContext && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground py-4"
            >
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {aiContext.timeOfDay}
              </span>
              <span>•</span>
              <span>${aiContext.totalSavings?.toLocaleString() || '0'} saved</span>
              <span>•</span>
              <span>{aiContext.goalsCount || 0} goals</span>
              <span>•</span>
              <span>{aiContext.streak || 0} day streak</span>
            </motion.div>
          )}
        </motion.div>
      )}
    </main>
  );
}
