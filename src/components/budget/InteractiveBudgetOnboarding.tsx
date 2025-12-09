import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Target, TrendingUp, Shield, Sparkles, ChevronRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { fadeInUp } from "@/lib/motion-variants";
import { Progress } from "@/components/ui/progress";

interface InteractiveBudgetOnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const ONBOARDING_STEPS = [
  {
    icon: Target,
    title: "Set Clear Limits",
    description: "Define spending limits for different categories",
    detail: "Create budgets for groceries, dining, entertainment, and more. Set realistic limits based on your income.",
    tip: "Start with the 50/30/20 rule: 50% needs, 30% wants, 20% savings"
  },
  {
    icon: TrendingUp,
    title: "Track in Real-Time",
    description: "See your spending update automatically as you transact",
    detail: "Connect your bank account and watch your budget update in real-time as transactions occur.",
    tip: "Check your budget daily to stay aware of your spending"
  },
  {
    icon: Shield,
    title: "Stay on Target",
    description: "Get alerts when approaching your budget limits",
    detail: "Receive notifications at 80% and 100% of your budget to help you stay in control.",
    tip: "Enable push notifications for instant alerts"
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description: "Receive smart recommendations to optimize your budget",
    detail: "Our AI analyzes your spending patterns and suggests ways to save money and reach your goals faster.",
    tip: "Review monthly insights to improve your budgeting"
  }
];

export function InteractiveBudgetOnboarding({ isOpen, onComplete, onSkip }: InteractiveBudgetOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onSkip}>
      <DialogContent className="sm:max-w-[700px]">
        <div className="space-y-6 py-6">
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center mb-4">
                <Target className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Smart Budgets</h2>
            <p className="text-sm text-muted-foreground">
              Take control of your spending with powerful budget tracking
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Navigation Pills */}
          <div className="flex justify-center gap-2">
            {ONBOARDING_STEPS.map((step, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                  index === currentStep
                    ? 'border-primary bg-primary/10 scale-110'
                    : completedSteps.includes(index)
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-muted/30'
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  {completedSteps.includes(index) ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <step.icon className={`w-5 h-5 ${
                      index === currentStep ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              {/* Icon and Title */}
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20"
                >
                  <currentStepData.icon className="w-8 h-8 text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold text-foreground">{currentStepData.title}</h3>
                <p className="text-muted-foreground">{currentStepData.description}</p>
              </div>

              {/* Detail Card */}
              <div className="p-6 rounded-xl bg-muted/30 border border-border/50">
                <p className="text-foreground mb-4">{currentStepData.detail}</p>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Pro Tip</p>
                    <p className="text-sm text-muted-foreground">{currentStepData.tip}</p>
                  </div>
                </div>
              </div>

              {/* Interactive Element */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-yellow-600/5 border border-primary/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm text-foreground">
                    Click "Next" when you're ready to continue
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            <Button variant="outline" onClick={onSkip} className={currentStep === 0 ? "flex-1" : ""}>
              Skip Tutorial
            </Button>
            <Button onClick={handleNext} className="flex-1 bg-gradient-to-r from-primary to-yellow-600">
              {currentStep < ONBOARDING_STEPS.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                'Get Started'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
