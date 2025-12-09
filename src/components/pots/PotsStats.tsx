import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { DollarSign, Target, TrendingUp, PiggyBank } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Pot {
  id: string;
  name: string;
  current_amount: number;
  target_amount: number | null;
  is_active: boolean;
}

interface PotsStatsProps {
  pots: Pot[];
}

export const PotsStats = ({ pots }: PotsStatsProps) => {
  const prefersReducedMotion = useReducedMotion();

  const totalSaved = pots.reduce((sum, pot) => sum + pot.current_amount, 0);
  const totalTarget = pots.reduce((sum, pot) => sum + (pot.target_amount || 0), 0);
  const avgProgress = pots.length > 0 
    ? pots.reduce((sum, pot) => {
        const progress = pot.target_amount 
          ? (pot.current_amount / pot.target_amount) * 100 
          : 0;
        return sum + progress;
      }, 0) / pots.length
    : 0;
  const activePots = pots.filter(p => p.is_active).length;

  const stats = [
    {
      icon: PiggyBank,
      label: "Total Saved",
      value: `$${totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: "text-emerald-500"
    },
    {
      icon: Target,
      label: "Total Target",
      value: `$${totalTarget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: "text-primary"
    },
    {
      icon: TrendingUp,
      label: "Avg Progress",
      value: `${avgProgress.toFixed(1)}%`,
      color: "text-amber-400"
    },
    {
      icon: DollarSign,
      label: "Active Pots",
      value: activePots.toString(),
      color: "text-amber-500"
    }
  ];

  return (
    <motion.div 
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <Card className="p-4 bg-glass-subtle border-border/40 hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-background/50 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                <p className="text-lg font-bold text-foreground truncate">{stat.value}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
