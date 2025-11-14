import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Calendar, Coffee, Home, Plane, GraduationCap, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { format, addMonths } from "date-fns";

interface GoalVisualizerProps {
  goalName: string;
  targetAmount: number;
  monthlyContribution?: number;
  goalType?: string;
}

const COMPARISON_ITEMS: Record<string, { icon: typeof Coffee; unit: string; costPer: number }> = {
  emergency: { icon: Coffee, unit: "coffees", costPer: 5 },
  vacation: { icon: Plane, unit: "flights", costPer: 300 },
  home: { icon: Home, unit: "months rent", costPer: 1500 },
  education: { icon: GraduationCap, unit: "courses", costPer: 200 },
  general: { icon: Coffee, unit: "dinners out", costPer: 30 },
};

export const GoalVisualizer = ({ 
  goalName, 
  targetAmount, 
  monthlyContribution = 100,
  goalType = "general"
}: GoalVisualizerProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [fillLevel, setFillLevel] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const monthsToGoal = Math.ceil(targetAmount / monthlyContribution);
  const targetDate = addMonths(new Date(), monthsToGoal);
  const comparisonItem = COMPARISON_ITEMS[goalType] || COMPARISON_ITEMS.general;
  const equivalentItems = Math.floor(targetAmount / comparisonItem.costPer);
  const Icon = comparisonItem.icon;

  // Animate piggy bank fill
  useEffect(() => {
    const timer = setTimeout(() => {
      setFillLevel(75); // Show as partially filled for preview
    }, 300);
    return () => clearTimeout(timer);
  }, [targetAmount]);

  // Show celebration preview when amount is significant
  useEffect(() => {
    if (targetAmount >= 1000 && !showCelebration) {
      const timer = setTimeout(() => {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [targetAmount]);

  return (
    <div className="space-y-6">
      {/* 3D Piggy Bank Visualization */}
      <motion.div
        className="relative mx-auto w-48 h-48"
        initial={prefersReducedMotion ? false : { scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        {/* Piggy bank container with 3D effect */}
        <div 
          className="relative w-full h-full"
          style={{
            transform: prefersReducedMotion ? undefined : "perspective(1000px) rotateY(-15deg)",
            transformStyle: "preserve-3d"
          }}
        >
          {/* Shadow */}
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-black/10 rounded-full blur-md"
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          {/* Piggy bank body */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              className="relative w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-4 border-primary/60 overflow-hidden"
              animate={prefersReducedMotion ? {} : {
                y: [0, -5, 0],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Fill level */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-primary/60"
                initial={{ height: "0%" }}
                animate={{ height: `${fillLevel}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              
              {/* Sparkle effect at top of fill */}
              <motion.div
                className="absolute left-0 right-0 h-1 bg-white/50"
                style={{ bottom: `${fillLevel}%` }}
                animate={prefersReducedMotion ? {} : {
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Coin slot on top */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-2 bg-primary rounded-full shadow-inner" />
              
              {/* Amount display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="text-center z-10"
                  initial={prefersReducedMotion ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-3xl font-bold text-foreground drop-shadow-lg">
                    ${targetAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground drop-shadow">
                    {fillLevel}% funded
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating coins animation */}
        {!prefersReducedMotion && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-yellow-500 shadow-lg"
                style={{
                  left: `${25 + i * 20}%`,
                  top: "-10%",
                }}
                animate={{
                  y: [0, 180, 180],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-yellow-900">
                  $
                </div>
              </motion.div>
            ))}
          </>
        )}
      </motion.div>

      {/* Timeline Visualization */}
      <motion.div
        className="bg-card/50 rounded-xl p-4 border border-border"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Your Timeline</h3>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Monthly savings</span>
            <span className="font-medium text-foreground">${monthlyContribution}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Estimated time</span>
            <span className="font-medium text-foreground">{monthsToGoal} months</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Target date</span>
            <span className="font-medium text-primary">{format(targetDate, "MMM yyyy")}</span>
          </div>
        </div>

        {/* Progress timeline */}
        <div className="mt-4 relative h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80"
            initial={{ width: "0%" }}
            animate={{ width: "30%" }}
            transition={{ duration: 1, delay: 0.6 }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          You'll reach your goal by {format(targetDate, "MMMM d, yyyy")} 🎯
        </p>
      </motion.div>

      {/* Comparison Card */}
      <motion.div
        className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20"
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-start gap-3">
          <motion.div
            animate={prefersReducedMotion ? {} : {
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Icon className="w-6 h-6 text-primary" />
          </motion.div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              This equals...
            </p>
            <p className="text-2xl font-bold text-primary">
              {equivalentItems} {comparisonItem.unit}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              at ${comparisonItem.costPer} each
            </p>
          </div>
        </div>
      </motion.div>

      {/* Celebration Preview */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
              initial={prefersReducedMotion ? false : { scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
            >
              <Sparkles className="w-6 h-6" />
              <div>
                <div className="font-bold text-lg">Amazing Goal!</div>
                <div className="text-sm opacity-90">You'll celebrate like this when you reach it 🎉</div>
              </div>
            </motion.div>

            {/* Confetti burst preview */}
            {!prefersReducedMotion && (
              <>
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                      background: `hsl(${Math.random() * 360}, 70%, 60%)`,
                      left: "50%",
                      top: "50%",
                    }}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0.5],
                      x: (Math.random() - 0.5) * 400,
                      y: Math.random() * -400 - 100,
                      rotate: Math.random() * 360,
                    }}
                    transition={{ duration: 1.5 }}
                  />
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
