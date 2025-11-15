import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MoreVertical, Edit, Trash2, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BudgetProgressLiquid } from "./BudgetProgressLiquid";
import { CategoryIcon } from "./CategoryIcon";
import { fadeInUp, cardHover } from "@/lib/motion-variants";
import { AnimatedCounter } from "@/components/onboarding/AnimatedCounter";

interface BudgetCardProps {
  budget: {
    id: string;
    name: string;
    total_limit: number;
    period: string;
    is_active: boolean;
    category_limits: Record<string, number>;
  };
  spending?: {
    spent_amount: number;
    transaction_count: number;
  };
  categoryData?: {
    code: string;
    name: string;
    icon: string;
    color: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

export function BudgetCard({ budget, spending, categoryData, onEdit, onDelete }: BudgetCardProps) {
  const spentAmount = spending?.spent_amount || 0;
  const totalLimit = parseFloat(String(budget.total_limit));
  const percentage = totalLimit > 0 ? (spentAmount / totalLimit) * 100 : 0;
  const remaining = totalLimit - spentAmount;
  
  const isOverBudget = percentage >= 100;
  const isNearLimit = percentage >= 80;

  return (
    <motion.div
      variants={fadeInUp}
      whileHover="hover"
      initial="initial"
      animate="animate"
    >
      <Card className="relative p-6 hover:shadow-lg transition-all duration-300 border-border/50 backdrop-blur-sm bg-card/80">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <CategoryIcon 
              icon={categoryData?.icon || 'target'} 
              color={categoryData?.color || 'hsl(var(--primary))'} 
            />
            <div>
              <h4 className="font-semibold text-foreground">{budget.name}</h4>
              <p className="text-sm text-muted-foreground capitalize">{budget.period}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {budget.is_active && <Badge variant="default">Active</Badge>}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Budget
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Budget
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="flex items-center justify-center mb-6">
          <BudgetProgressLiquid 
            percentage={percentage} 
            size={120}
            strokeWidth={8}
          />
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Spent</p>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-foreground">$</span>
              <AnimatedCounter 
                value={spentAmount} 
                className="text-lg font-bold text-foreground"
                decimals={2}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Remaining</p>
            <div className="flex items-center justify-end gap-1">
              <span className={`text-lg font-bold ${remaining < 0 ? 'text-destructive' : 'text-primary'}`}>
                $
              </span>
              <AnimatedCounter 
                value={Math.abs(remaining)} 
                className={`text-lg font-bold ${remaining < 0 ? 'text-destructive' : 'text-primary'}`}
                decimals={2}
              />
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        {isOverBudget ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive font-medium">
              ${Math.abs(remaining).toFixed(2)} over budget
            </p>
          </div>
        ) : isNearLimit ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <TrendingUp className="h-4 w-4 text-warning" />
            <p className="text-sm text-warning font-medium">
              {(100 - percentage).toFixed(0)}% remaining
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <TrendingDown className="h-4 w-4 text-primary" />
            <p className="text-sm text-primary font-medium">
              On track - {spending?.transaction_count || 0} transactions
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
