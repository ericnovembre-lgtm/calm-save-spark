import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw } from 'lucide-react';
import { LoadingState } from '@/components/LoadingState';
import { motion } from 'framer-motion';

interface AIInsightsCardProps {
  portfolioData: any;
}

export function AIInsightsCard({ portfolioData }: AIInsightsCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: insights, isLoading, refetch } = useQuery({
    queryKey: ['portfolio-insights', portfolioData],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portfolio-insights`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ portfolioData })
        }
      );

      if (!response.ok) throw new Error('Failed to fetch insights');
      return response.json();
    },
    enabled: !!portfolioData,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>Analyzing your portfolio...</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">
              Why Is It Moving?
            </h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {insights && (
          <div className="space-y-4">
            <div className="bg-card/50 rounded-lg p-4">
              <p className="text-foreground leading-relaxed">
                {insights.summary}
              </p>
            </div>

            {insights.factors && insights.factors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">Key Factors:</p>
                {insights.factors.map((factor: string, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <span className="text-primary font-bold">•</span>
                    <span>{factor}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {insights.recommendations && (
              <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-sm font-semibold text-foreground mb-2">
                  💡 AI Recommendation:
                </p>
                <p className="text-sm text-muted-foreground">
                  {insights.recommendations}
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}