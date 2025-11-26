import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBehavioralLearning } from '@/hooks/useBehavioralLearning';
import { Brain, RefreshCw, Clock, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export function BehavioralInsightsPanel() {
  const { patterns, isLoading, analyzePatterns } = useBehavioralLearning();

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'spending_time':
        return <Clock className="h-5 w-5" />;
      case 'category_preference':
        return <TrendingUp className="h-5 w-5" />;
      case 'savings_behavior':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const formatPatternData = (type: string, data: any) => {
    switch (type) {
      case 'spending_time':
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return `Peak: ${dayNames[data.peak_day]} at ${data.peak_hour}:00`;
      case 'category_preference':
        return `Top: ${data.top_categories?.[0]?.category || 'N/A'}`;
      case 'savings_behavior':
        return `Avg: $${data.average_amount?.toFixed(2) || '0'}`;
      default:
        return 'Pattern detected';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold">Behavioral Insights</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => analyzePatterns.mutate()}
          disabled={analyzePatterns.isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${analyzePatterns.isPending ? 'animate-spin' : ''}`} />
          Analyze
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : patterns && patterns.length > 0 ? (
        <div className="space-y-4">
          {patterns.map((pattern, index) => (
            <motion.div
              key={pattern.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {getPatternIcon(pattern.pattern_type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium capitalize mb-1">
                        {pattern.pattern_type.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatPatternData(pattern.pattern_type, pattern.pattern_data)}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>
                          Confidence: {(pattern.confidence_score * 100).toFixed(0)}%
                        </span>
                        <span>Sample: {pattern.sample_size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div
                      className="h-2 w-16 bg-muted rounded-full overflow-hidden"
                    >
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${pattern.confidence_score * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No behavioral patterns detected yet.</p>
          <p className="text-sm mt-1">Use the app more to build your financial profile.</p>
        </div>
      )}
    </Card>
  );
}