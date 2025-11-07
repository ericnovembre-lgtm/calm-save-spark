import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowRight, 
  ArrowLeft, 
  Shield, 
  Plane, 
  Home, 
  GraduationCap, 
  PiggyBank,
  Target,
  TrendingDown,
  ShoppingBag,
  Frown,
  AlertCircle,
  DollarSign,
  Zap,
  Hand,
  Settings
} from "lucide-react";
import { SaveplusAnimIcon } from "@/components/icons";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  savingGoal: z.string().min(1, "Please select your main savings goal"),
  biggestChallenge: z.string().min(1, "Please select your biggest challenge"),
  automationPreference: z.string().min(1, "Please select your saving preference"),
});

interface AccountSetupStepProps {
  userId: string;
  onNext: (data?: { skipStep?: boolean }) => void;
  onPrevious: () => void;
}

const SAVING_GOALS = [
  { value: "emergency", label: "Emergency Fund", icon: Shield, description: "Build financial security" },
  { value: "vacation", label: "Vacation", icon: Plane, description: "Travel and experiences" },
  { value: "home", label: "Home Purchase", icon: Home, description: "Down payment or home" },
  { value: "education", label: "Education", icon: GraduationCap, description: "Learning and growth" },
  { value: "retirement", label: "Retirement", icon: PiggyBank, description: "Long-term security" },
  { value: "general", label: "General Savings", icon: Target, description: "Build wealth" },
];

const CHALLENGES = [
  { value: "low_income", label: "Limited Income", icon: TrendingDown, description: "Not enough left over" },
  { value: "overspending", label: "Overspending", icon: ShoppingBag, description: "Hard to control spending" },
  { value: "motivation", label: "Staying Motivated", icon: Frown, description: "Lose momentum quickly" },
  { value: "no_plan", label: "No Clear Plan", icon: AlertCircle, description: "Don't know where to start" },
  { value: "unexpected", label: "Unexpected Costs", icon: DollarSign, description: "Emergencies drain savings" },
];

const AUTOMATION_PREFS = [
  { value: "automatic", label: "Fully Automatic", icon: Zap, description: "Set it and forget it" },
  { value: "manual", label: "Manual Control", icon: Hand, description: "I decide each transfer" },
  { value: "hybrid", label: "Combination", icon: Settings, description: "Mix of both approaches" },
];

const AccountSetupStep = ({ userId, onNext, onPrevious }: AccountSetupStepProps) => {
  const prefersReducedMotion = useReducedMotion();
  const { triggerHaptic } = useHapticFeedback();
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      savingGoal: "",
      biggestChallenge: "",
      automationPreference: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const quizData = {
        saving_goal: values.savingGoal,
        biggest_challenge: values.biggestChallenge,
        automation_preference: values.automationPreference,
      };

      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: values.fullName,
          onboarding_quiz: quizData,
          onboarding_step: 'account'
        })
        .eq('id', userId);

      if (error) throw error;

      trackEvent("intent_survey_completed", quizData);
      triggerHaptic("success");
      toast.success("Your preferences have been saved!");
      onNext();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to save your preferences. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentQuestion < 3) {
      triggerHaptic("light");
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      triggerHaptic("light");
      setCurrentQuestion(currentQuestion - 1);
    } else {
      onPrevious();
    }
  };

  const canProceed = () => {
    const values = form.getValues();
    if (currentQuestion === 0) return values.fullName.length >= 2;
    if (currentQuestion === 1) return !!values.savingGoal;
    if (currentQuestion === 2) return !!values.biggestChallenge;
    if (currentQuestion === 3) return !!values.automationPreference;
    return false;
  };

  const getQuestionTitle = () => {
    switch (currentQuestion) {
      case 0: return "What's your name?";
      case 1: return "What's your main savings goal?";
      case 2: return "What's your biggest savings challenge?";
      case 3: return "How do you prefer to save?";
      default: return "";
    }
  };

  const getQuestionDescription = () => {
    switch (currentQuestion) {
      case 0: return "Help us personalize your experience";
      case 1: return "We'll tailor your dashboard to help you achieve it";
      case 2: return "We'll provide relevant tips and strategies";
      case 3: return "We'll set up your automation accordingly";
      default: return "";
    }
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl"
    >
      <Card className="border-border shadow-[var(--shadow-card)]">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <SaveplusAnimIcon name="sparkles" size={24} className="text-[color:var(--color-accent)]" />
              <span className="text-sm font-medium text-muted-foreground">
                Question {currentQuestion + 1} of 4
              </span>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentQuestion 
                      ? "w-8 bg-[color:var(--color-accent)]" 
                      : i < currentQuestion 
                        ? "w-4 bg-[color:var(--color-accent)]/50"
                        : "w-4 bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
          <CardTitle className="text-3xl font-display">{getQuestionTitle()}</CardTitle>
          <CardDescription>{getQuestionDescription()}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                {/* Question 0: Name */}
                {currentQuestion === 0 && (
                  <motion.div
                    key="name"
                    initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Your Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Sarah Johnson" 
                              {...field}
                              className="text-lg h-12"
                              aria-label="Enter your full name"
                              autoFocus
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {/* Question 1: Saving Goal */}
                {currentQuestion === 1 && (
                  <motion.div
                    key="goal"
                    initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FormField
                      control={form.control}
                      name="savingGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup 
                              onValueChange={(value) => {
                                field.onChange(value);
                                triggerHaptic("light");
                              }} 
                              value={field.value}
                              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                            >
                              {SAVING_GOALS.map((goal) => {
                                const Icon = goal.icon;
                                const isSelected = field.value === goal.value;
                                return (
                                  <div key={goal.value} className="relative">
                                    <RadioGroupItem 
                                      value={goal.value} 
                                      id={`goal-${goal.value}`}
                                      className="peer sr-only"
                                    />
                                    <Label
                                      htmlFor={`goal-${goal.value}`}
                                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-[color:var(--color-accent)]/50 hover:shadow-[var(--shadow-soft)] ${
                                        isSelected 
                                          ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/5 shadow-[var(--shadow-soft)]" 
                                          : "border-border bg-card"
                                      }`}
                                    >
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                        isSelected ? "bg-[color:var(--color-accent)] text-[color:var(--color-text-on-accent)]" : "bg-primary/10 text-primary"
                                      }`}>
                                        <Icon className="w-5 h-5" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-semibold text-foreground mb-1">{goal.label}</div>
                                        <div className="text-sm text-muted-foreground">{goal.description}</div>
                                      </div>
                                    </Label>
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {/* Question 2: Challenge */}
                {currentQuestion === 2 && (
                  <motion.div
                    key="challenge"
                    initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FormField
                      control={form.control}
                      name="biggestChallenge"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup 
                              onValueChange={(value) => {
                                field.onChange(value);
                                triggerHaptic("light");
                              }} 
                              value={field.value}
                              className="grid grid-cols-1 gap-3"
                            >
                              {CHALLENGES.map((challenge) => {
                                const Icon = challenge.icon;
                                const isSelected = field.value === challenge.value;
                                return (
                                  <div key={challenge.value} className="relative">
                                    <RadioGroupItem 
                                      value={challenge.value} 
                                      id={`challenge-${challenge.value}`}
                                      className="peer sr-only"
                                    />
                                    <Label
                                      htmlFor={`challenge-${challenge.value}`}
                                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-[color:var(--color-accent)]/50 hover:shadow-[var(--shadow-soft)] ${
                                        isSelected 
                                          ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/5 shadow-[var(--shadow-soft)]" 
                                          : "border-border bg-card"
                                      }`}
                                    >
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                        isSelected ? "bg-[color:var(--color-accent)] text-[color:var(--color-text-on-accent)]" : "bg-primary/10 text-primary"
                                      }`}>
                                        <Icon className="w-5 h-5" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-semibold text-foreground mb-1">{challenge.label}</div>
                                        <div className="text-sm text-muted-foreground">{challenge.description}</div>
                                      </div>
                                    </Label>
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {/* Question 3: Automation Preference */}
                {currentQuestion === 3 && (
                  <motion.div
                    key="automation"
                    initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FormField
                      control={form.control}
                      name="automationPreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup 
                              onValueChange={(value) => {
                                field.onChange(value);
                                triggerHaptic("light");
                              }} 
                              value={field.value}
                              className="grid grid-cols-1 gap-3"
                            >
                              {AUTOMATION_PREFS.map((pref) => {
                                const Icon = pref.icon;
                                const isSelected = field.value === pref.value;
                                return (
                                  <div key={pref.value} className="relative">
                                    <RadioGroupItem 
                                      value={pref.value} 
                                      id={`pref-${pref.value}`}
                                      className="peer sr-only"
                                    />
                                    <Label
                                      htmlFor={`pref-${pref.value}`}
                                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-[color:var(--color-accent)]/50 hover:shadow-[var(--shadow-soft)] ${
                                        isSelected 
                                          ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/5 shadow-[var(--shadow-soft)]" 
                                          : "border-border bg-card"
                                      }`}
                                    >
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                        isSelected ? "bg-[color:var(--color-accent)] text-[color:var(--color-text-on-accent)]" : "bg-primary/10 text-primary"
                                      }`}>
                                        <Icon className="w-5 h-5" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-semibold text-foreground mb-1">{pref.label}</div>
                                        <div className="text-sm text-muted-foreground">{pref.description}</div>
                                      </div>
                                    </Label>
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="gap-2"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                
                {currentQuestion < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex-1 gap-2"
                    aria-label="Continue to next question"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading || !canProceed()}
                    className="flex-1 gap-2"
                    aria-label="Complete survey and continue"
                  >
                    {isLoading ? "Saving..." : "Complete Survey"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AccountSetupStep;
