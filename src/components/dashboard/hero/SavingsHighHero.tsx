import { motion } from "framer-motion";
import { TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SavingsHighHeroProps {
  data: {
    netWorthIncrease: number;
    percentageChange: number;
    opportunities: Array<{
      id: string;
      title: string;
      description: string;
      potentialReturn: string;
    }>;
  };
}

export function SavingsHighHero({ data }: SavingsHighHeroProps) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="relative p-8 rounded-2xl border border-primary/40 backdrop-blur-xl bg-gradient-to-br from-primary/20 via-accent/10 to-background/50 overflow-hidden"
      animate={!prefersReducedMotion ? {
        boxShadow: [
          "0 0 30px hsl(var(--primary) / 0.2)",
          "0 0 50px hsl(var(--primary) / 0.3)",
          "0 0 30px hsl(var(--primary) / 0.2)"
        ]
      } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Animated background particles */}
      {!prefersReducedMotion && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + Math.sin(i) * 20}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </>
      )}

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={!prefersReducedMotion ? {
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Strong Growth! 🚀</h2>
              <p className="text-sm text-muted-foreground">
                Your net worth is up significantly
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">
              +${data.netWorthIncrease.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +{data.percentageChange.toFixed(1)}% this month
            </p>
          </div>
        </div>

        {/* Opportunities carousel */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Investment Opportunities
          </h3>
          <div className="space-y-2">
            {data.opportunities.slice(0, 2).map((opportunity, index) => (
              <motion.div
                key={opportunity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                className="p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{opportunity.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {opportunity.description}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold text-primary">{opportunity.potentialReturn}</p>
                    <p className="text-xs text-muted-foreground">potential</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/goals')}
            className="flex-1 font-semibold group"
          >
            Explore Investments
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/analytics')}
          >
            View Analytics
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
