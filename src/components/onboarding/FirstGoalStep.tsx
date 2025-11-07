import { useState } from "react";
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
import { toast } from "sonner";
import { trackGoalCreated } from "@/lib/analytics";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
}

const FirstGoalStep = ({ userId, onNext, onPrevious }: FirstGoalStepProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      targetAmount: "",
    },
  });

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

      trackGoalCreated(values.name);
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
    onNext({ skipStep: true });
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
                      <Input 
                        placeholder="e.g., Emergency Fund, Vacation, New Car" 
                        {...field}
                        aria-label="Goal name"
                      />
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
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      How much do you want to save?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onPrevious}
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
