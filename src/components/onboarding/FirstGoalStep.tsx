import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, ArrowLeft, Target, HelpCircle } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { toast } from "sonner";
import { trackGoalCreated } from "@/lib/analytics";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BehaviorTooltipWrapper } from "./BehaviorTooltipWrapper";
import { GoalVisualizer } from "./GoalVisualizer";

const formSchema = z.object({
  name: z.string().min(2, "Goal name must be at least 2 characters").max(100),
  targetAmount: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Target amount must be a positive number"
  ),
});

interface FirstGoalStepProps {
  userId: string;
  onNext: (data?: { skipStep?: boolean }) => void;
  onPrevious: () => void;
  abTest?: {
    variant: 'control' | 'variant_a';
    trackFieldInteraction: (step: string, fieldName: string, interactionType: 'focus' | 'blur' | 'change' | 'tooltip_shown') => void;
  };
}

// Suggested target amounts based on goal type
const GOAL_SUGGESTIONS: Record<string, number> = {
  emergency: 1000,
  vacation: 3000,
  home: 20000,
  education: 10000,
  retirement: 50000,
  general: 5000,
};

// Suggested goal names based on goal type
const GOAL_NAMES: Record<string, string> = {
  emergency: "Emergency Fund",
  vacation: "Dream Vacation",
  home: "Home Down Payment",
  education: "Education Fund",
  retirement: "Retirement Savings",
  general: "General Savings",
};

// Adjustment multipliers based on challenge
const CHALLENGE_MULTIPLIERS: Record<string, number> = {
  low_income: 0.5,      // Lower targets for limited income
  overspending: 0.8,    // Slightly lower to build confidence
  motivation: 1.0,      // Standard amount
  no_plan: 1.0,         // Standard amount
  unexpected: 0.7,      // Lower to account for emergencies
};

const FirstGoalStep = ({ userId, onNext, onPrevious, abTest }: FirstGoalStepProps) => {
  const prefersReducedMotion = useReducedMotion();
  const { triggerHaptic } = useHapticFeedback();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedAmount, setSuggestedAmount] = useState<string>("");
  const [goalType, setGoalType] = useState<string>("general");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      targetAmount: "",
    },
  });

  useEffect(() => {
    const fetchQuizDataAndDraft = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_quiz, onboarding_draft_data')
          .eq('id', userId)
          .single();

        if (error) throw error;

        const quizData = data?.onboarding_quiz as any;
        const draftData = data?.onboarding_draft_data as any;

        // Pre-populate from draft data if available (user's partial progress)
        if (draftData?.goalName || draftData?.goalTargetAmount) {
          form.setValue('name', draftData.goalName || '');
          form.setValue('targetAmount', draftData.goalTargetAmount || '');
        } 
        // Otherwise pre-populate from quiz data
        else if (quizData?.saving_goal) {
          const goalTypeFromQuiz = quizData.saving_goal;
          const challenge = quizData.biggest_challenge || 'motivation';
          
          setGoalType(goalTypeFromQuiz);
          
          // Calculate suggested amount based on goal and challenge
          const baseAmount = GOAL_SUGGESTIONS[goalTypeFromQuiz] || GOAL_SUGGESTIONS.general;
          const multiplier = CHALLENGE_MULTIPLIERS[challenge] || 1.0;
          const adjustedAmount = Math.round(baseAmount * multiplier);
          
          // Pre-populate form
          const goalName = GOAL_NAMES[goalTypeFromQuiz] || 'My Savings Goal';
          form.setValue('name', goalName);
          form.setValue('targetAmount', adjustedAmount.toString());
          setSuggestedAmount(adjustedAmount.toString());
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error);
      }
    };

    fetchQuizDataAndDraft();
  }, [userId, form]);

  // Auto-save draft data when form changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      const saveDraft = async () => {
        if (value.name || value.targetAmount) {
          await supabase
            .from('profiles')
            .update({
              onboarding_draft_data: {
                goalName: value.name,
                goalTargetAmount: value.targetAmount,
              }
            })
            .eq('id', userId);
        }
      };
      
      // Debounce the save
      const timeoutId = setTimeout(saveDraft, 1000);
      return () => clearTimeout(timeoutId);
    });

    return () => subscription.unsubscribe();
  }, [form, userId]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('goals')
        .insert({
          user_id: userId,
          name: values.name,
          target_amount: Number(values.targetAmount),
          current_amount: 0,
          icon: 'target',
        });

      if (error) throw error;

      // Clear draft data after successful submission
      await supabase
        .from('profiles')
        .update({
          onboarding_draft_data: {}
        })
        .eq('id', userId);

      trackGoalCreated(values.name);
      triggerHaptic("success");
      toast.success("Goal created!");
      onNext();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error("Failed to create goal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    triggerHaptic("light");
    onNext({ skipStep: true });
  };

  const handleBack = () => {
    triggerHaptic("light");
    onPrevious();
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-xl"
    >
      <Card className="border-border shadow-[var(--shadow-card)]">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-primary" />
            <CardTitle className="text-3xl font-display">Create your first goal</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Goals help you stay motivated and track your savings progress. You can create multiple goals for different purposes.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>
            What are you saving for? You can add more goals later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Name</FormLabel>
                    <FormControl>
                      <BehaviorTooltipWrapper
                        fieldName="goal_name"
                        helpText="Choose a meaningful name that motivates you. Examples: 'Emergency Fund for 6 months', 'Dream Vacation to Japan', 'Home Down Payment'."
                        onTooltipShown={() => abTest?.trackFieldInteraction('goal', 'goal_name', 'tooltip_shown')}
                      >
                        <Input 
                          placeholder="e.g., Emergency Fund, Vacation, New Car" 
                          {...field}
                          aria-label="Goal name"
                          onFocus={() => abTest?.trackFieldInteraction('goal', 'goal_name', 'focus')}
                          onBlur={() => abTest?.trackFieldInteraction('goal', 'goal_name', 'blur')}
                          onChange={(e) => {
                            field.onChange(e);
                            abTest?.trackFieldInteraction('goal', 'goal_name', 'change');
                          }}
                        />
                      </BehaviorTooltipWrapper>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount</FormLabel>
                    <FormControl>
                      <BehaviorTooltipWrapper
                        fieldName="target_amount"
                        helpText="Set a realistic target based on your income and expenses. Start small if you're new to saving - you can always increase it later!"
                        onTooltipShown={() => abTest?.trackFieldInteraction('goal', 'target_amount', 'tooltip_shown')}
                      >
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input 
                            type="number"
                            placeholder="5000" 
                            {...field}
                            className="pl-7"
                            aria-label="Target amount in dollars"
                            onFocus={() => abTest?.trackFieldInteraction('goal', 'target_amount', 'focus')}
                            onBlur={() => abTest?.trackFieldInteraction('goal', 'target_amount', 'blur')}
                            onChange={(e) => {
                              field.onChange(e);
                              abTest?.trackFieldInteraction('goal', 'target_amount', 'change');
                            }}
                          />
                        </div>
                      </BehaviorTooltipWrapper>
                    </FormControl>
                    <FormDescription>
                      {suggestedAmount && (
                        <span className="text-[color:var(--color-accent)]">
                          💡 Suggested based on your goals
                        </span>
                      )}
                      {!suggestedAmount && "How much do you want to save?"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Goal Visualizer */}
              {form.watch('name') && form.watch('targetAmount') && Number(form.watch('targetAmount')) > 0 && (
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <GoalVisualizer
                    goalName={form.watch('name')}
                    targetAmount={Number(form.watch('targetAmount'))}
                    monthlyContribution={100}
                    goalType={goalType}
                  />
                </motion.div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="gap-2"
                  aria-label="Go back to previous step"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkip}
                  aria-label="Skip creating a goal"
                >
                  Skip for now
                </Button>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 gap-2"
                  aria-label="Create goal and continue"
                >
                  Create Goal
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FirstGoalStep;
