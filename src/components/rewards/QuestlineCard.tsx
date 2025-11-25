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
      case 'debt_slay': return 'from-red-500/20 to-orange-500/20 border-red-500/20';
      case 'home_horizon': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/20';
      case 'savings_sprint': return 'from-green-500/20 to-emerald-500/20 border-green-500/20';
      case 'credit_builder': return 'from-purple-500/20 to-pink-500/20 border-purple-500/20';
      default: return 'from-primary/20 to-accent/20 border-primary/20';
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
        className={`p-6 relative overflow-hidden cursor-pointer transition-all bg-gradient-to-br ${getCategoryColor(category)} hover:shadow-lg`}
        onClick={onToggle}
      >
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
                <h3 className="font-semibold text-lg text-foreground">{name}</h3>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-primary">{totalPoints} pts</div>
              {isComplete && (
                <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <Check className="w-3 h-3" />
                  Complete
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Chapter {progress?.currentStep || 1} of {steps.length}
              </span>
              <span className="font-medium text-foreground">
                {progressPercent.toFixed(0)}%
              </span>
            </div>
            <AnimatedProgress value={progressPercent} />
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
