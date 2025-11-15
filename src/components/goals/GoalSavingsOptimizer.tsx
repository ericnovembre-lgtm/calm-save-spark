import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ANIMATION_DURATION, ANIMATION_EASING } from "@/lib/animation-constants";

export const GoalSavingsOptimizer = () => {
  const { toast } = useToast();

  const { data: optimizationPlan, isLoading, refetch } = useQuery({
    queryKey: ['goal-optimization'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('optimize-goal-allocations');
      if (error) throw error;
      return data;
    },
    enabled: false // Don't auto-fetch, wait for user action
  });

  const handleOptimize = async () => {
    try {
      await refetch();
      toast({
        title: "Savings Plan Optimized! 🎯",
        description: "We've calculated the smartest way to reach all your goals.",
      });
    } catch (error: any) {
      toast({
        title: "Optimization Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!optimizationPlan) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>Smart Savings Optimizer</CardTitle>
          </div>
          <CardDescription>
            Let AI calculate the optimal weekly amount for each goal based on your income and priorities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleOptimize} disabled={isLoading} className="w-full">
            {isLoading ? "Analyzing..." : "Optimize My Goals"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const allocations = optimizationPlan.allocations || {};
  const assumptions = optimizationPlan.plan?.assumptions || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: ANIMATION_DURATION.normal / 1000, ease: ANIMATION_EASING.smooth }}
    >
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <CardTitle>Your Optimized Savings Plan</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={handleOptimize}>
              Recalculate
            </Button>
          </div>
          <CardDescription>
            Based on ${assumptions.disposableIncome || 0}/mo disposable income
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(allocations).map(([goalId, allocation]: [string, any]) => (
            <motion.div
              key={goalId}
              className="p-4 rounded-lg bg-card border border-border"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: ANIMATION_DURATION.fast / 1000 }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-foreground">{allocation.goalName}</h4>
                  <p className="text-sm text-muted-foreground">
                    ${allocation.remaining?.toLocaleString()} remaining
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">
                    ${allocation.weeklyAmount}/week
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${allocation.monthlyAmount}/mo
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  Complete in {Math.ceil(allocation.projectedMonthsToComplete || 0)} months
                </span>
              </div>
            </motion.div>
          ))}
          
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Confidence: {Math.round((optimizationPlan.plan?.confidence_score || 0) * 100)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};