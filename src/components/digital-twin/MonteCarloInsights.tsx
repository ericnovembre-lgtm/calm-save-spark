import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  Target, 
  Shield, 
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Gauge
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ModelIndicatorBadge } from '@/components/coach/ModelIndicatorBadge';
import { MonteCarloExplanation } from '@/hooks/useMonteCarloExplanation';

interface MonteCarloInsightsProps {
  explanation: MonteCarloExplanation | null;
  isLoading: boolean;
  onRefresh?: () => void;
}

export function MonteCarloInsights({ explanation, isLoading, onRefresh }: MonteCarloInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showReasoning, setShowReasoning] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>('sensitivity');

  if (isLoading) {
    return (
      <Card className="p-4 border-amber-500/20 bg-amber-500/5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-500/20 animate-pulse flex items-center justify-center">
            <Brain className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="h-4 w-40 bg-amber-500/20 rounded animate-pulse mb-2" />
            <div className="h-3 w-56 bg-amber-500/10 rounded animate-pulse" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (!explanation) return null;

  const impactColors = {
    high: 'text-rose-400 bg-rose-500/10',
    medium: 'text-amber-400 bg-amber-500/10',
    low: 'text-emerald-400 bg-emerald-500/10'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header Card - Key Insight */}
      <Card className="p-4 border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-yellow-500/5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <Brain className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h4 className="font-semibold text-foreground">Monte Carlo AI Analysis</h4>
                <ModelIndicatorBadge 
                  model="deepseek-reasoner" 
                  modelName="Deepseek Reasoner"
                  queryType="mathematical_reasoning"
                />
              </div>
              <p className="text-sm text-foreground font-medium">
                {explanation.key_insight}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-white/5 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </Card>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Section Tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'sensitivity', label: 'Sensitivity', icon: Gauge },
                { id: 'control', label: 'What You Control', icon: Target },
                { id: 'risks', label: 'Risks', icon: AlertTriangle },
                { id: 'milestones', label: 'Milestones', icon: TrendingUp }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(activeSection === tab.id ? null : tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    activeSection === tab.id 
                      ? 'bg-amber-500/20 text-amber-400' 
                      : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sensitivity Analysis */}
            <AnimatePresence>
              {activeSection === 'sensitivity' && explanation.sensitivity_analysis && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="p-4 border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                      <Gauge className="h-4 w-4 text-amber-400" />
                      <h5 className="font-medium text-foreground">Parameter Sensitivity</h5>
                    </div>
                    <div className="space-y-3">
                      {explanation.sensitivity_analysis.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-foreground">{item.parameter}</span>
                            <span className="text-xs text-muted-foreground">
                              Impact: {item.impact_score}/10
                            </span>
                          </div>
                          <Progress value={item.impact_score * 10} className="h-2" />
                          <p className="text-xs text-muted-foreground">{item.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Control Factors */}
            <AnimatePresence>
              {activeSection === 'control' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <Card className="p-4 border-emerald-500/20 bg-emerald-500/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-emerald-400" />
                      <h5 className="font-medium text-foreground">What You Can Control</h5>
                    </div>
                    <div className="space-y-2">
                      {explanation.control_factors?.map((factor, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/5">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">{factor.factor}</span>
                            <Badge className={impactColors[factor.impact]}>
                              {factor.impact} impact
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{factor.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {explanation.uncontrollable_factors && (
                    <Card className="p-4 border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="h-4 w-4 text-amber-400" />
                        <h5 className="font-medium text-foreground">External Factors</h5>
                      </div>
                      <div className="space-y-2">
                        {explanation.uncontrollable_factors.map((factor, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-white/5">
                            <span className="font-medium text-foreground">{factor.factor}</span>
                            <p className="text-xs text-muted-foreground mt-1">
                              Mitigation: {factor.mitigation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scenario Risks */}
            <AnimatePresence>
              {activeSection === 'risks' && explanation.scenario_risks && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="p-4 border-rose-500/20 bg-rose-500/5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      <h5 className="font-medium text-foreground">Scenario Risks</h5>
                    </div>
                    <div className="space-y-2">
                      {explanation.scenario_risks.map((risk, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-foreground">{risk.scenario}</span>
                            <span className="text-xs text-rose-400">{risk.probability}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Impact: {risk.impact} | Mitigation: {risk.mitigation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Milestone Projections */}
            <AnimatePresence>
              {activeSection === 'milestones' && explanation.milestone_projections && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="p-4 border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-amber-400" />
                      <h5 className="font-medium text-foreground">Milestone Projections</h5>
                    </div>
                    <div className="space-y-2">
                      {explanation.milestone_projections.map((milestone, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                          <span className="font-medium text-foreground">{milestone.milestone}</span>
                          <div className="text-right">
                            <p className="text-sm text-amber-400 font-medium">
                              Year {milestone.median_year}
                            </p>
                            <p className="text-xs text-muted-foreground">{milestone.range}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Risk Narrative */}
            <Card className="p-4 border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                <h5 className="font-medium text-foreground">Confidence Intervals Explained</h5>
              </div>
              <p className="text-sm text-muted-foreground">{explanation.risk_narrative}</p>
              <p className="text-sm text-muted-foreground mt-2">{explanation.confidence_explanation}</p>
            </Card>

            {/* Reasoning Chain Toggle */}
            {explanation.reasoning_chain && (
              <>
                <button
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="w-full p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      View AI Reasoning Chain
                    </span>
                    {showReasoning ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {showReasoning && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Card className="p-4 border-white/10 bg-card/50">
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                          {explanation.reasoning_chain}
                        </pre>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}