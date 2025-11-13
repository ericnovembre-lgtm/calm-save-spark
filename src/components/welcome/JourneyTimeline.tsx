import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SaveplusAnimIcon } from "@/components/icons";
import { CheckCircle2 } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  timeframe: string;
  completed?: boolean;
}

const milestones: Milestone[] = [
  {
    id: "signup",
    title: "Sign Up",
    description: "Create your account and set your first goal",
    icon: "user",
    timeframe: "Day 1",
    completed: true,
  },
  {
    id: "first-save",
    title: "First $50 Saved",
    description: "Automated savings start working for you",
    icon: "piggy-bank",
    timeframe: "Week 1",
  },
  {
    id: "automation",
    title: "Enable Automation",
    description: "Set up round-ups and scheduled transfers",
    icon: "automations",
    timeframe: "Week 2",
  },
  {
    id: "first-goal",
    title: "Hit First Goal",
    description: "Celebrate your first savings milestone!",
    icon: "trophy",
    timeframe: "Month 1",
  },
  {
    id: "wealth-building",
    title: "Wealth Building",
    description: "Continue growing your savings effortlessly",
    icon: "chart",
    timeframe: "Ongoing",
  },
];

export const JourneyTimeline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <div ref={ref} className="relative py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
          Your Savings Journey
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          See how other savers progress from signup to financial wellness
        </p>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Timeline path */}
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <motion.path
            d="M 50 50 Q 25 150 50 250 T 50 450 T 50 650 T 50 850"
            stroke="hsl(var(--accent))"
            strokeWidth="3"
            fill="none"
            strokeDasharray="10 5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 0.3 } : {}}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>

        {/* Milestones */}
        <div className="relative space-y-8" style={{ zIndex: 1 }}>
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className={`flex items-center gap-6 ${
                index % 2 === 0 ? "flex-row" : "flex-row-reverse"
              }`}
            >
              {/* Content */}
              <div
                className={`flex-1 ${
                  index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"
                }`}
              >
                <motion.div
                  className="inline-block bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border hover:border-accent transition-colors"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -5 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {milestone.completed && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                    <h3 className="text-xl font-display font-bold">
                      {milestone.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {milestone.description}
                  </p>
                  <span className="inline-block text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
                    {milestone.timeframe}
                  </span>
                </motion.div>
              </div>

              {/* Icon */}
              <motion.div
                className="flex-shrink-0 relative"
                initial={prefersReducedMotion ? {} : { scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: index * 0.2 + 0.2, type: "spring", stiffness: 200 }}
              >
                <div className="w-16 h-16 rounded-full bg-accent/20 border-4 border-background flex items-center justify-center shadow-lg">
                  <SaveplusAnimIcon name={milestone.icon as any} size={32} />
                </div>
                {milestone.completed && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.2 + 0.4, type: "spring" }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>

              {/* Spacer for alternating layout */}
              <div className="flex-1" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
