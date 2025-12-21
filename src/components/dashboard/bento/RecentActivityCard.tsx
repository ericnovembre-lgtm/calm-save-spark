/**
 * RecentActivityCard - Transaction list with hover-reveal actions
 * Features staggered animations and clean list styling
 */

import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  Coffee, 
  Home, 
  Car, 
  Utensils,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownLeft,
  Zap
} from "lucide-react";
import { BentoCard } from "./BentoCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  type: "expense" | "income";
}

interface RecentActivityCardProps {
  transactions?: Transaction[];
  delay?: number;
}

const categoryIcons: Record<string, typeof ShoppingBag> = {
  shopping: ShoppingBag,
  coffee: Coffee,
  housing: Home,
  transport: Car,
  food: Utensils,
  utilities: Zap,
};

// Default demo transactions
const defaultTransactions: Transaction[] = [
  { id: "1", merchant: "Whole Foods Market", category: "food", amount: -89.42, date: "Today", type: "expense" },
  { id: "2", merchant: "Salary Deposit", category: "income", amount: 4500.00, date: "Yesterday", type: "income" },
  { id: "3", merchant: "Starbucks", category: "coffee", amount: -6.75, date: "Yesterday", type: "expense" },
  { id: "4", merchant: "Amazon", category: "shopping", amount: -129.99, date: "Dec 19", type: "expense" },
  { id: "5", merchant: "Electric Company", category: "utilities", amount: -145.00, date: "Dec 18", type: "expense" },
];

export function RecentActivityCard({ 
  transactions, 
  delay = 0 
}: RecentActivityCardProps) {
  const items = transactions || defaultTransactions;

  return (
    <BentoCard delay={delay} noPadding className="overflow-hidden">
      <div className="p-6 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View All
          </Button>
        </div>
      </div>
      
      <div className="px-3 pb-3">
        {items.map((tx, index) => {
          const Icon = categoryIcons[tx.category] || ShoppingBag;
          const isIncome = tx.type === "income";
          
          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + (index * 0.05), duration: 0.3 }}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl",
                "hover:bg-muted/50 transition-colors duration-200 group cursor-pointer"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2.5 rounded-xl",
                  isIncome ? "bg-emerald-500/10" : "bg-accent/20"
                )}>
                  {isIncome ? (
                    <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Icon className="w-4 h-4 text-accent-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{tx.merchant}</p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={cn(
                  "font-semibold text-sm",
                  isIncome ? "text-emerald-600" : "text-foreground"
                )}>
                  {isIncome ? "+" : ""}${Math.abs(tx.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
                
                {/* Hover reveal action */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </BentoCard>
  );
}
