/**
 * QuickActionsCard - Quick action buttons for common tasks
 */

import { motion } from "framer-motion";
import { Plus, ArrowRightLeft, Receipt, Target, Wallet } from "lucide-react";
import { BentoCard } from "./BentoCard";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface QuickActionsCardProps {
  delay?: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: typeof Plus;
  color: string;
  bgColor: string;
  path: string;
}

const quickActions: QuickAction[] = [
  {
    id: "add-transaction",
    label: "Add Transaction",
    icon: Plus,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10 hover:bg-emerald-500/20",
    path: "/transactions",
  },
  {
    id: "transfer",
    label: "Transfer",
    icon: ArrowRightLeft,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
    path: "/pots",
  },
  {
    id: "new-goal",
    label: "New Goal",
    icon: Target,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10 hover:bg-amber-500/20",
    path: "/goals",
  },
];

export function QuickActionsCard({ delay = 0 }: QuickActionsCardProps) {
  const navigate = useNavigate();
  
  return (
    <BentoCard delay={delay}>
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + (index * 0.05), duration: 0.3 }}
              onClick={() => navigate(action.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl",
                "transition-all duration-200 cursor-pointer",
                action.bgColor
              )}
            >
              <Icon className={cn("w-5 h-5", action.color)} />
              <span className="text-xs font-medium text-foreground text-center leading-tight">
                {action.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </BentoCard>
  );
}
