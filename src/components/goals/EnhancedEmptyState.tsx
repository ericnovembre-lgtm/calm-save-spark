import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, Lightbulb, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface EnhancedEmptyStateProps {
  onCreateGoal: () => void;
}

export const EnhancedEmptyState = ({ onCreateGoal }: EnhancedEmptyStateProps) => {
  const benefits = [
    {
      icon: Target,
      title: "Set Clear Targets",
      description: "Define specific savings goals with target amounts and deadlines",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Beautiful visualizations show your journey to financial success",
    },
    {
      icon: Lightbulb,
      title: "AI Insights",
      description: "Get personalized recommendations to reach your goals faster",
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
            >
              <Target className="w-20 h-20 mx-auto mb-6 text-primary opacity-60" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-2xl font-semibold mb-3">
                Start Your Savings Journey
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Create your first goal and watch your savings grow. Whether it's an emergency fund, 
                vacation, or dream purchase—we'll help you get there.
              </p>
              
              <Button 
                onClick={onCreateGoal} 
                size="lg" 
                className="gap-2"
                data-tour="new-goal-button"
              >
                <Plus className="w-5 h-5" />
                Create Your First Goal
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {benefits.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">{benefit.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
