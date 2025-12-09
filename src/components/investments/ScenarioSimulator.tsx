import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertTriangle, TrendingDown, TrendingUp, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TypewriterText } from '@/components/ui/typewriter-text';

interface ScenarioSimulatorProps {
  portfolioData: Array<{ name: string; value: number; change?: number }>;
}

interface ScenarioAnalysis {
  overallImpact: string;
  estimatedImpactRange?: { min: number; max: number };
  affectedAssets: Array<{
    assetClass: string;
    impact: 'positive' | 'negative' | 'neutral';
    severity: 'severe' | 'significant' | 'moderate' | 'minimal';
    explanation: string;
  }>;
  defensiveActions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    rationale: string;
  }>;
  historicalContext?: string;
  confidenceLevel: 'high' | 'medium' | 'low';
}

const quickScenarios = [
  'Fed raises interest rates by 0.5%',
  'Stock market correction of 10%',
  'Oil prices spike 30%',
  'Bitcoin crashes to $40k',
  'Recession begins',
  'Inflation reaches 5%',
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'severe':
      return 'text-red-500 border-red-500/30 bg-red-500/5';
    case 'significant':
      return 'text-orange-500 border-orange-500/30 bg-orange-500/5';
    case 'moderate':
      return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5';
    default:
      return 'text-green-500 border-green-500/30 bg-green-500/5';
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    default:
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  }
};

export function ScenarioSimulator({ portfolioData }: ScenarioSimulatorProps) {
  const [scenario, setScenario] = useState('');
  const [analysis, setAnalysis] = useState<ScenarioAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async (scenarioText: string) => {
    if (!scenarioText.trim()) {
      toast({
        title: 'Enter a scenario',
        description: 'Please describe a macroeconomic event to analyze',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('simulate-portfolio-scenario', {
        body: { portfolioData, scenario: scenarioText },
      });

      if (error) throw error;

      setAnalysis(data);
    } catch (error) {
      console.error('Scenario analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Unable to analyze scenario. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-6 bg-card/80 backdrop-blur border-border">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-500/10">
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Scenario Simulator</h3>
            <p className="text-sm text-muted-foreground">
              Predict how macroeconomic events could impact your portfolio
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="e.g., The Fed raises interest rates by 0.75%"
              className="flex-1 bg-card/90 border-border font-mono text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isAnalyzing) {
                  handleAnalyze(scenario);
                }
              }}
            />
            <Button
              onClick={() => handleAnalyze(scenario)}
              disabled={isAnalyzing}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing
                </>
              ) : (
                'Simulate'
              )}
            </Button>
          </div>

          {/* Quick Scenarios */}
          <div className="flex flex-wrap gap-2">
            {quickScenarios.map((qs) => (
              <button
                key={qs}
                onClick={() => {
                  setScenario(qs);
                  handleAnalyze(qs);
                }}
                disabled={isAnalyzing}
                className="px-3 py-1 text-xs rounded-full bg-secondary/50 hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {qs}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Overall Impact */}
              <Card className="p-4 bg-card/90 border-border">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-foreground">Overall Portfolio Impact</h4>
                    <TypewriterText
                      text={analysis.overallImpact}
                      speed={20}
                      className="text-sm text-muted-foreground leading-relaxed"
                    />
                    {analysis.estimatedImpactRange && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Estimated Range:</span>
                        <span className="font-mono font-semibold text-red-400">
                          {analysis.estimatedImpactRange.min}% to {analysis.estimatedImpactRange.max}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Affected Assets */}
              {analysis.affectedAssets.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Asset Class Impact</h4>
                  <div className="grid gap-2">
                    {analysis.affectedAssets.map((asset, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className={`p-3 border ${getSeverityColor(asset.severity)}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {asset.impact === 'negative' ? (
                                  <TrendingDown className="w-4 h-4" />
                                ) : (
                                  <TrendingUp className="w-4 h-4" />
                                )}
                                <span className="font-semibold text-sm">{asset.assetClass}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-current/10 capitalize">
                                  {asset.severity}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {asset.explanation}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Defensive Actions */}
              {analysis.defensiveActions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    Defensive Recommendations
                  </h4>
                  <div className="grid gap-2">
                    {analysis.defensiveActions.map((action, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                      >
                        <Card className="p-3 bg-card/50 border-border">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityBadge(
                                    action.priority
                                  )}`}
                                >
                                  {action.priority.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-foreground">{action.action}</p>
                              <p className="text-xs text-muted-foreground">{action.rationale}</p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Historical Context */}
              {analysis.historicalContext && (
                <Card className="p-3 bg-card/50 border-border">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Historical Context:</span>{' '}
                    {analysis.historicalContext}
                  </p>
                </Card>
              )}

              {/* Confidence Level */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                <span>
                  Confidence Level:{' '}
                  <span className="capitalize font-medium text-foreground">{analysis.confidenceLevel}</span>
                </span>
                <span className="italic">Analysis powered by Gemini AI</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
