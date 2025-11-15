import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Target, TrendingUp, Shield, Sparkles } from "lucide-react";

interface BudgetOnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function BudgetOnboarding({ isOpen, onComplete, onSkip }: BudgetOnboardingProps) {
  const features = [
    {
      icon: Target,
      title: "Set Clear Limits",
      description: "Define spending limits for different categories"
    },
    {
      icon: TrendingUp,
      title: "Track in Real-Time",
      description: "See your spending update automatically as you transact"
    },
    {
      icon: Shield,
      title: "Stay on Target",
      description: "Get alerts when approaching your budget limits"
    },
    {
      icon: Sparkles,
      title: "AI-Powered Insights",
      description: "Receive smart recommendations to optimize your budget"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onSkip}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="text-center space-y-6 py-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Target className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome to Smart Budgets</h2>
            <p className="text-muted-foreground">Take control of your spending with powerful budget tracking</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-muted/30"
              >
                <feature.icon className="w-6 h-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm text-foreground mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onSkip} className="flex-1">
              Skip for Now
            </Button>
            <Button onClick={onComplete} className="flex-1 bg-gradient-to-r from-primary to-purple-600">
              Get Started
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
