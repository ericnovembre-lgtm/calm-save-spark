import { useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { SaveplusAnimIcon } from "@/components/icons";
import { ArrowRight, Target, Calendar, DollarSign } from "lucide-react";
import { NeutralConfetti } from "@/components/effects/NeutralConfetti";

interface Goal {
  id: string;
  icon: string;
  label: string;
  amount: number;
}

const goals: Goal[] = [
  { id: "vacation", icon: "travel", label: "Vacation", amount: 2000 },
  { id: "emergency", icon: "shield", label: "Emergency Fund", amount: 5000 },
  { id: "car", icon: "car", label: "New Car", amount: 15000 },
  { id: "home", icon: "home", label: "Home Down Payment", amount: 30000 },
];

export const SavingsPlayground = () => {
  const [dailyAmount, setDailyAmount] = useState(5);
  const [selectedGoal, setSelectedGoal] = useState<Goal>(goals[0]);
  const [showConfetti, setShowConfetti] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { playCoinSound, playGoalCompleteSound } = useSoundEffects();

  const daysToGoal = Math.ceil(selectedGoal.amount / dailyAmount);
  const monthsToGoal = Math.ceil(daysToGoal / 30);
  const yearlyTotal = dailyAmount * 365;
  const progress = Math.min((dailyAmount * 30) / selectedGoal.amount, 1) * 100;

  const handleSliderChange = (value: number[]) => {
    setDailyAmount(value[0]);
    playCoinSound(); // Play sound on slider change
  };

  const handleGoalSelect = (goal: Goal) => {
    setSelectedGoal(goal);
    playCoinSound(); // Play sound on goal selection
  };

  const handleCalculate = () => {
    if (daysToGoal <= 365) {
      playGoalCompleteSound(); // Play success sound
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } else {
      playCoinSound(); // Play regular sound for other cases
    }
  };

  return (
    <div className="relative py-16 bg-gradient-to-b from-background to-accent/5">
      <NeutralConfetti show={showConfetti} />
      
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Try It Now
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how small daily savings can help you reach your goals
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Controls */}
          <Card className="p-8 space-y-8">
            <div>
              <Label className="text-lg font-semibold mb-4 block">
                Daily Saving Amount
              </Label>
              <div className="flex items-center gap-4">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <Slider
                  value={[dailyAmount]}
                  onValueChange={handleSliderChange}
                  min={1}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-2xl font-bold tabular-nums min-w-[80px] text-right">
                  ${dailyAmount}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Save ${dailyAmount} every day
              </p>
            </div>

            <div>
              <Label className="text-lg font-semibold mb-4 block">
                Choose Your Goal
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {goals.map((goal) => (
                  <motion.button
                    key={goal.id}
                    onClick={() => handleGoalSelect(goal)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedGoal.id === goal.id
                        ? "border-accent bg-accent/10"
                        : "border-border bg-card hover:border-accent/50"
                    }`}
                    whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SaveplusAnimIcon name={goal.icon as any} size={32} className="mb-2" />
                    <p className="text-sm font-semibold">{goal.label}</p>
                    <p className="text-xs text-muted-foreground">
                      ${goal.amount.toLocaleString()}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCalculate}
              className="w-full"
              size="lg"
              variant="default"
            >
              See Your Potential
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            <motion.div
              key={`${dailyAmount}-${selectedGoal.id}`}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 bg-gradient-to-br from-accent/20 to-accent/5">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-6 h-6 text-accent" />
                  <h3 className="text-2xl font-display font-bold">
                    {selectedGoal.label} Goal
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Progress Ring */}
                  <div className="relative w-48 h-48 mx-auto">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="hsl(var(--border))"
                        strokeWidth="12"
                        fill="none"
                      />
                      <motion.circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="hsl(var(--accent))"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                        animate={{
                          strokeDashoffset:
                            2 * Math.PI * 88 * (1 - progress / 100),
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.p
                        className="text-4xl font-bold text-foreground"
                        key={monthsToGoal}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        {monthsToGoal}
                      </motion.p>
                      <p className="text-sm text-muted-foreground">
                        {monthsToGoal === 1 ? "Month" : "Months"}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background/50 rounded-lg p-4">
                      <Calendar className="w-5 h-5 text-accent mb-2" />
                      <p className="text-2xl font-bold tabular-nums">
                        {daysToGoal}
                      </p>
                      <p className="text-xs text-muted-foreground">Days to Goal</p>
                    </div>
                    <div className="bg-background/50 rounded-lg p-4">
                      <DollarSign className="w-5 h-5 text-accent mb-2" />
                      <p className="text-2xl font-bold tabular-nums">
                        ${yearlyTotal.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Saved in 1 Year
                      </p>
                    </div>
                  </div>

                  {daysToGoal <= 365 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center"
                    >
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        🎉 You can reach this goal in less than a year!
                      </p>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>

            <p className="text-center text-sm text-muted-foreground">
              Adjust the sliders to see how your savings grow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
