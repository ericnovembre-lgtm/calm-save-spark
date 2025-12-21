import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Gift, 
  Target, 
  Flame,
  Trophy,
  CreditCard,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatDistanceToNow } from "date-fns";
import { usePointsRedemption } from "@/hooks/usePointsRedemption";
import { useCardPoints } from "@/hooks/useCardPoints";
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

const categoryIcons: Record<string, LucideIcon> = {
  base: Target,
  achievement: Trophy,
  streak: Flame,
  card: CreditCard,
  bonus: Gift,
  cashback: CreditCard,
  gift_card: Gift,
  travel: Gift,
};

export function RewardsHistoryList() {
  const prefersReducedMotion = useReducedMotion();
  const { history, isLoadingHistory } = usePointsRedemption();
  const { recentPoints, isLoading: pointsLoading } = useCardPoints();

  const isLoading = isLoadingHistory || pointsLoading;

  // Combine earning and redemption history
  const combinedHistory: HistoryItem[] = [
    // Map redemptions
    ...history.map(r => ({
      id: r.id,
      type: "redeemed" as const,
      category: r.redemption_type || "Redemption",
      description: `${r.redemption_type || 'Points'} Redemption`,
      points: r.points_spent,
      date: new Date(r.created_at),
      icon: categoryIcons[r.redemption_type] || Gift,
    })),
    // Map earnings
    ...recentPoints.map(p => ({
      id: p.id,
      type: "earned" as const,
      category: p.points_type.charAt(0).toUpperCase() + p.points_type.slice(1).replace(/_/g, ' '),
      description: p.description || `${p.points_type} points`,
      points: p.points_amount,
      date: new Date(p.created_at),
      icon: categoryIcons[p.points_type] || Target,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (combinedHistory.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Activity Yet</h3>
        <p className="text-muted-foreground">Start saving to earn your first points!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <Badge variant="outline" className="text-xs">
          Last 30 days
        </Badge>
      </div>

      <div className="space-y-3">
        {combinedHistory.slice(0, 10).map((item, index) => {
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

      {combinedHistory.length > 10 && (
        <div className="text-center pt-2">
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            View all activity →
          </button>
        </div>
      )}
    </div>
  );
}
