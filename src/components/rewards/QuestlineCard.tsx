import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { AnimatedProgress } from "@/components/ui/animated-progress";

interface QuestStep {
  step: number;
  title: string;
  description: string;
  points: number;
  requirement: string;
}

interface QuestlineCardProps {
  name: string;
  description?: string;
  narrativeIntro?: string;
  steps: QuestStep[];
  totalPoints: number;
  category: string;
  icon?: string;
  progress?: {
    currentStep: number;
    stepsCompleted: number[];
    completedAt?: string;
  };
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function QuestlineCard({
  name,
  description,
  narrativeIntro,
  steps,
  totalPoints,
  category,
  icon = 'trophy',
  progress,
  isExpanded = false,
  onToggle,
}: QuestlineCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const completedSteps = progress?.stepsCompleted?.length || 0;
  const progressPercent = (completedSteps / steps.length) * 100;
  const isComplete = progress?.completedAt != null;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'debt_slay': return 'from-rose-900/40 to-red-800/40 border-rose-500/30';
      case 'home_horizon': return 'from-blue-900/40 to-cyan-700/40 border-blue-500/30';
      case 'savings_sprint': return 'from-emerald-900/40 to-green-700/40 border-emerald-500/30';
      case 'credit_builder': return 'from-purple-900/40 to-pink-700/40 border-purple-500/30';
      default: return 'from-primary/20 to-accent/20 border-primary/20';
    }
  };

  const getCategoryAccent = (cat: string) => {
    switch (cat) {
      case 'debt_slay': return 'text-rose-400';
      case 'home_horizon': return 'text-cyan-400';
      case 'savings_sprint': return 'text-emerald-400';
      case 'credit_builder': return 'text-pink-400';
      default: return 'text-primary';
    }
  };

  const getIconEmoji = (iconName: string) => {
    switch (iconName) {
      case 'sword': return '⚔️';
      case 'home': return '🏠';
      case 'zap': return '⚡';
      case 'shield': return '🛡️';
      default: return '🏆';
    }
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`p-6 relative overflow-hidden cursor-pointer transition-all bg-gradient-to-br ${getCategoryColor(category)} hover:shadow-xl border-2`}
        onClick={onToggle}
      >
        {/* Book spine on left edge */}
        <div className={`absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b ${getCategoryColor(category).split(' ')[0]} opacity-60`} />
        
        {/* Page corner fold effect */}
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[30px] border-l-[30px] border-t-background/20 border-l-transparent" />

        {/* Completion celebration effect */}
        {!prefersReducedMotion && isComplete && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}

        <div className="relative space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="text-3xl">{getIconEmoji(icon || 'trophy')}</div>
              <div>
                <h3 className={`font-bold text-lg ${getCategoryAccent(category)}`}>{name}</h3>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-bold ${getCategoryAccent(category)}`}>{totalPoints} pts</div>
              {isComplete && (
                <div className="text-xs text-green-400 flex items-center gap-1 mt-1 font-semibold">
                  <Check className="w-3 h-3" />
                  Complete
                </div>
              )}
            </div>
          </div>

          {/* Segmented Progress - Chapter style */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">
                Chapter {progress?.currentStep || 1} of {steps.length}
              </span>
              <span className={`font-bold ${getCategoryAccent(category)}`}>
                {progressPercent.toFixed(0)}%
              </span>
            </div>
            
            {/* Segmented progress bar */}
            <div className="flex gap-1">
              {steps.map((step, idx) => {
                const isStepComplete = progress?.stepsCompleted?.includes(step.step);
                return (
                  <div
                    key={step.step}
                    className="flex-1 h-3 rounded-sm relative overflow-hidden bg-muted/30"
                  >
                    <motion.div
                      className={`absolute inset-0 ${
                        isStepComplete 
                          ? `bg-gradient-to-r ${getCategoryColor(category).split(' ')[0]}` 
                          : 'bg-transparent'
                      }`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: isStepComplete ? 1 : 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      style={{ transformOrigin: 'left' }}
                    />
                    {/* Chapter number badge */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-foreground/50">
                        {step.step}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expanded content */}
          {isExpanded && (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, height: 'auto' }}
              exit={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="pt-4 border-t border-border"
            >
              {narrativeIntro && (
                <p className="text-sm text-foreground/80 italic mb-4 leading-relaxed">
                  "{narrativeIntro}"
                </p>
              )}

              <div className="space-y-3">
                {steps.map((step) => {
                  const isStepComplete = progress?.stepsCompleted?.includes(step.step);
                  const isCurrentStep = progress?.currentStep === step.step;
                  const isLocked = !isStepComplete && !isCurrentStep;

                  return (
                    <div
                      key={step.step}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                        isStepComplete 
                          ? 'bg-primary/10 border border-primary/20' 
                          : isCurrentStep
                          ? 'bg-accent/10 border border-accent/20'
                          : 'bg-muted/50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isStepComplete 
                          ? 'bg-primary text-primary-foreground' 
                          : isCurrentStep
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {isStepComplete ? (
                          <Check className="w-4 h-4" />
                        ) : isLocked ? (
                          <Lock className="w-3 h-3" />
                        ) : (
                          <span className="text-xs font-bold">{step.step}</span>
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-foreground">{step.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                      </div>

                      <div className="text-xs font-medium text-primary">
                        +{step.points}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
