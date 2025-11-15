import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Target, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ANIMATION_DURATION, ANIMATION_EASING, STAGGER_DELAY } from "@/lib/animation-constants";
import { useState } from "react";

interface GoalSuggestion {
  name: string;
  description: string;
  suggestedAmount: number;
  timelineMonths: number;
  icon: string;
  priority: string;
  reasoning: string;
}

export const AIGoalSuggestions = () => {
  const { toast } = useToast();
  const [selectedSuggestion, setSelectedSuggestion] = useState<GoalSuggestion | null>(null);

  const { data: suggestions, isLoading, refetch } = useQuery({
    queryKey: ['ai-goal-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-goal-suggestions');
      if (error) throw error;
      return data.suggestions as GoalSuggestion[];
    },
    enabled: false
  });

  const handleGenerateSuggestions = async () => {
    try {
      await refetch();
      toast({
        title: "AI Suggestions Generated! ✨",
        description: "We've analyzed your finances and found opportunities to save.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAcceptSuggestion = async (suggestion: GoalSuggestion) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const deadline = new Date();
      deadline.setMonth(deadline.getMonth() + suggestion.timelineMonths);

      const { error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          name: suggestion.name,
          target_amount: suggestion.suggestedAmount,
          deadline: deadline.toISOString(),
          icon: suggestion.icon
        });

      if (error) throw error;

      toast({
        title: "Goal Created! 🎯",
        description: `${suggestion.name} has been added to your goals.`,
      });

      setSelectedSuggestion(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>AI Goal Suggestions</CardTitle>
          </div>
          <CardDescription>
            Get personalized savings goal recommendations based on your spending patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateSuggestions} disabled={isLoading} className="w-full">
            {isLoading ? "Analyzing Your Finances..." : "Get AI Suggestions"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Recommended Goals for You</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: ANIMATION_DURATION.normal / 1000, 
              delay: index * (STAGGER_DELAY.cards / 1000),
              ease: ANIMATION_EASING.smooth 
            }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Target className="w-8 h-8 text-primary" />
                  {suggestion.priority === 'high' && (
                    <span className="px-2 py-1 text-xs font-medium bg-red-500/10 text-red-500 rounded-full">
                      High Priority
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg">{suggestion.name}</CardTitle>
                <CardDescription>{suggestion.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Target:</span>
                    <span className="font-semibold">${suggestion.suggestedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Timeline:</span>
                    <span className="font-semibold">{suggestion.timelineMonths} months</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-accent/50 border border-border">
                  <p className="text-xs text-muted-foreground">{suggestion.reasoning}</p>
                </div>

                <Button 
                  onClick={() => handleAcceptSuggestion(suggestion)}
                  className="w-full"
                  variant="default"
                >
                  Create This Goal
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Button onClick={handleGenerateSuggestions} variant="outline" className="w-full">
        <TrendingUp className="w-4 h-4 mr-2" />
        Generate New Suggestions
      </Button>
    </div>
  );
};