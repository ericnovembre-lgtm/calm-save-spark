import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SaveplusAnimIcon } from "@/components/icons";
import { 
  ArrowRight, 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  Zap,
  Shield,
  Plane,
  Home,
  GraduationCap,
  PiggyBank,
  DollarSign,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface DashboardPreviewProps {
  userId: string;
  onNext: () => void;
  onPrevious: () => void;
}

interface QuizData {
  saving_goal?: string;
  biggest_challenge?: string;
  automation_preference?: string;
}

const GOAL_ICONS: Record<string, any> = {
  emergency: Shield,
  vacation: Plane,
  home: Home,
  education: GraduationCap,
  retirement: PiggyBank,
  general: Target,
};

const GOAL_LABELS: Record<string, string> = {
  emergency: "Emergency Fund",
  vacation: "Vacation Fund",
  home: "Home Savings",
  education: "Education Fund",
  retirement: "Retirement",
  general: "General Savings",
};

const CHALLENGE_TIPS: Record<string, { title: string; tip: string }> = {
  low_income: {
    title: "Start Small Strategy",
    tip: "Even $5/week adds up to $260/year. Micro-savings are your superpower!"
  },
  overspending: {
    title: "Automation is Key",
    tip: "Set up automatic transfers right after payday—you won't miss what you don't see!"
  },
  motivation: {
    title: "Visual Progress",
    tip: "Track your progress daily. Watching your balance grow keeps motivation high!"
  },
  no_plan: {
    title: "SMART Goals",
    tip: "Break big goals into smaller milestones. Each milestone is a win!"
  },
  unexpected: {
    title: "Buffer First",
    tip: "Build a $500 emergency buffer before big goals—it protects your progress!"
  },
};

const AUTOMATION_MESSAGES: Record<string, string> = {
  automatic: "Your savings will run on autopilot—no effort required!",
  manual: "You'll have full control over every transfer and decision.",
  hybrid: "Perfect balance of automation and personal control.",
};

const DashboardPreview = ({ userId, onNext, onPrevious }: DashboardPreviewProps) => {
  const prefersReducedMotion = useReducedMotion();
  const { triggerHaptic } = useHapticFeedback();
  const [quizData, setQuizData] = useState<QuizData>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_quiz, full_name')
          .eq('id', userId)
          .single();

        if (error) throw error;

        setQuizData((data?.onboarding_quiz as QuizData) || {});
      } catch (error) {
        console.error('Error fetching quiz data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [userId]);

  const handleContinue = () => {
    triggerHaptic("medium");
    onNext();
  };

  const handleBack = () => {
    triggerHaptic("light");
    onPrevious();
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl flex items-center justify-center p-8">
        <div className="animate-pulse text-foreground">Loading preview...</div>
      </div>
    );
  }

  const goalType = quizData.saving_goal || 'general';
  const GoalIcon = GOAL_ICONS[goalType];
  const goalLabel = GOAL_LABELS[goalType];
  const challenge = quizData.biggest_challenge || 'no_plan';
  const challengeTip = CHALLENGE_TIPS[challenge];
  const automationPref = quizData.automation_preference || 'hybrid';
  const automationMessage = AUTOMATION_MESSAGES[automationPref];

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl"
    >
      <div className="mb-6 text-center">
        <motion.div
          initial={prefersReducedMotion ? false : { scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4 flex justify-center"
        >
          <SaveplusAnimIcon 
            name="sparkles" 
            size={64}
            className="text-[color:var(--color-accent)]"
          />
        </motion.div>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
          Your Personalized Dashboard
        </h2>
        <p className="text-lg text-muted-foreground">
          Here's a preview of what you'll see based on your goals
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        {/* Main Goal Card - Spans 2 columns */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-4"
        >
          <Card className="border-border shadow-[var(--shadow-card)] h-full bg-gradient-to-br from-card to-card/50 hover:shadow-[var(--shadow-soft)] transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[color:var(--color-accent)]/10 flex items-center justify-center">
                    <GoalIcon className="w-6 h-6 text-[color:var(--color-accent)]" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{goalLabel}</CardTitle>
                    <p className="text-sm text-muted-foreground">Your primary goal</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[color:var(--color-accent)]">$0</div>
                  <p className="text-xs text-muted-foreground">of your target</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-muted-foreground">0%</span>
                  </div>
                  <Progress value={0} className="h-3" />
                </div>
                
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">This Week</span>
                    </div>
                    <div className="text-lg font-semibold text-foreground">$0</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">This Month</span>
                    </div>
                    <div className="text-lg font-semibold text-foreground">$0</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Streak</span>
                    </div>
                    <div className="text-lg font-semibold text-foreground">0 days</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats - Vertical stack */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-2 space-y-4"
        >
          <Card className="border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                  <p className="text-2xl font-bold text-foreground">$0.00</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[color:var(--color-accent)]/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[color:var(--color-accent)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Auto-Savings</p>
                  <p className="text-lg font-semibold text-foreground">
                    {automationPref === 'automatic' ? 'Active' : automationPref === 'manual' ? 'Manual' : 'Hybrid'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Smart Tip Card */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="md:col-span-4"
        >
          <Card className="border-[color:var(--color-accent)]/30 shadow-[var(--shadow-card)] bg-[color:var(--color-accent)]/5 hover:shadow-[var(--shadow-soft)] transition-all">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[color:var(--color-accent)]/20 flex items-center justify-center flex-shrink-0">
                  <SaveplusAnimIcon name="lightbulb" size={24} className="text-[color:var(--color-accent)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                    {challengeTip.title}
                    <span className="text-xs bg-[color:var(--color-accent)]/20 text-[color:var(--color-accent)] px-2 py-0.5 rounded-full">
                      Personalized
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground">{challengeTip.tip}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Automation Status */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="md:col-span-2"
        >
          <Card className="border-border shadow-[var(--shadow-card)] h-full hover:shadow-[var(--shadow-soft)] transition-all">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Your Approach</p>
                <p className="text-xs text-muted-foreground">{automationMessage}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex gap-3"
      >
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          className="gap-2"
          aria-label="Go back to automation settings"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        <Button
          onClick={handleContinue}
          className="flex-1 gap-2 bg-[color:var(--color-accent)] hover:bg-[color:var(--color-accent)]/90 text-[color:var(--color-text-on-accent)]"
          aria-label="Continue to completion"
        >
          Looks Great! Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPreview;
