import { CheckCircle, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface ProgressStep {
  id: string;
  label: string;
  completed: boolean;
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
  currentStep: string;
}

export function ProgressTracker({ steps, currentStep }: ProgressTrackerProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);
  const progress = ((steps.filter(s => s.completed).length / steps.length) * 100);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-foreground">Your Progress</h3>
            <span className="text-xs text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCurrent = step.id === currentStep;
            const isPast = index < currentIndex;
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 ${
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                ) : (
                  <Circle className={`h-5 w-5 flex-shrink-0 ${isCurrent ? "text-primary" : ""}`} />
                )}
                <span className={`text-sm ${isCurrent ? "font-medium" : ""}`}>
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {progress < 100 && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Next: {steps[currentIndex + 1]?.label || "Complete onboarding"}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
