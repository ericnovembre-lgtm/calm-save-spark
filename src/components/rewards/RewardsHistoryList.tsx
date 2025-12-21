import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Gift, 
  Target, 
  Flame,
  Trophy,
  CreditCard
} from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatDistanceToNow } from "date-fns";
import type { LucideIcon } from "lucide-react";

interface HistoryItem {
  id: string;
  type: "earned" | "redeemed";
  category: string;
  description: string;
  points: number;
  date: Date;
  icon: LucideIcon;
}

const mockHistory: HistoryItem[] = [
  {
    id: "1",
    type: "earned",
    category: "Achievement",
    description: "Unlocked 'First Saver' badge",
    points: 50,
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    icon: Trophy,
  },
  {
    id: "2",
    type: "redeemed",
    category: "Cashback",
    description: "Redeemed $25 cashback",
    points: 2500,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    icon: CreditCard,
  },
  {
    id: "3",
    type: "earned",
    category: "Streak",
    description: "7-day saving streak bonus",
    points: 100,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    icon: Flame,
  },
  {
    id: "4",
    type: "earned",
    category: "Savings",
    description: "Daily savings deposit",
    points: 15,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    icon: Target,
  },
  {
    id: "5",
    type: "redeemed",
    category: "Gift Card",
    description: "Amazon $10 gift card",
    points: 1000,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    icon: Gift,
  },
  {
    id: "6",
    type: "earned",
    category: "Questline",
    description: "Completed 'Budget Master' quest",
    points: 200,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    icon: Trophy,
  },
];

export function RewardsHistoryList() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <Badge variant="outline" className="text-xs">
          Last 30 days
        </Badge>
      </div>

      <div className="space-y-3">
        {mockHistory.map((item, index) => {
          const Icon = item.icon;
          const isEarned = item.type === "earned";

          return (
            <motion.div
              key={item.id}
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
            >
              <Card className="p-4 bg-card/50 border-border/50 hover:bg-card transition-colors">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`p-2.5 rounded-xl ${
                    isEarned 
                      ? "bg-accent/10 text-accent" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge 
                        variant="outline" 
                        className="text-xs border-border/50 text-muted-foreground"
                      >
                        {item.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(item.date, { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className={`flex items-center gap-1 font-semibold ${
                    isEarned ? "text-accent" : "text-muted-foreground"
                  }`}>
                    {isEarned ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span>{isEarned ? "+" : "-"}{item.points.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Load more indicator */}
      <div className="text-center pt-2">
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          View all activity →
        </button>
      </div>
    </div>
  );
}
