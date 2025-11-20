import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, DollarSign } from "lucide-react";

interface CashFlowNode {
  name: string;
  amount: number;
  type: 'income' | 'expense' | 'savings';
  color?: string;
}

interface CashFlowSankeyProps {
  income: CashFlowNode[];
  expenses: CashFlowNode[];
  savings: CashFlowNode[];
  title?: string;
}

export function CashFlowSankey({
  income,
  expenses,
  savings,
  title = "Your Money Flow",
}: CashFlowSankeyProps) {
  const totalIncome = income.reduce((sum, node) => sum + node.amount, 0);
  const totalExpenses = expenses.reduce((sum, node) => sum + node.amount, 0);
  const totalSavings = savings.reduce((sum, node) => sum + node.amount, 0);

  const getNodeWidth = (amount: number) => {
    const max = Math.max(totalIncome, totalExpenses + totalSavings);
    return Math.max(60, (amount / max) * 200);
  };

  const getNodeHeight = (amount: number, total: number) => {
    return Math.max(30, (amount / total) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <DollarSign className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground text-base">{title}</h3>
        </div>

        {/* Sankey-style visualization */}
        <div className="relative min-h-[400px]">
          <svg
            viewBox="0 0 800 400"
            className="w-full h-full"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="savingsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Income nodes (left) */}
            <g>
              {income.map((node, i) => {
                const height = getNodeHeight(node.amount, totalIncome);
                const y = i * 110 + 50;
                return (
                  <g key={`income-${i}`}>
                    <rect
                      x="50"
                      y={y}
                      width="120"
                      height={height}
                      fill="hsl(var(--primary))"
                      opacity="0.8"
                      rx="8"
                    />
                    <text
                      x="110"
                      y={y + height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="hsl(var(--primary-foreground))"
                      fontSize="12"
                      fontWeight="600"
                    >
                      ${node.amount.toLocaleString()}
                    </text>
                    <text
                      x="110"
                      y={y + height / 2 + 16}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="hsl(var(--primary-foreground))"
                      fontSize="10"
                    >
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Flow lines to center */}
            <path
              d={`M 170 ${50 + getNodeHeight(totalIncome, totalIncome) / 2}
                  Q 350 ${50 + getNodeHeight(totalIncome, totalIncome) / 2},
                    350 200`}
              fill="none"
              stroke="url(#incomeGradient)"
              strokeWidth={getNodeWidth(totalIncome) / 2}
              opacity="0.6"
            />

            {/* Center node */}
            <rect
              x="300"
              y="160"
              width="200"
              height="80"
              fill="hsl(var(--card))"
              stroke="hsl(var(--border))"
              strokeWidth="2"
              rx="12"
            />
            <text
              x="400"
              y="190"
              textAnchor="middle"
              fill="hsl(var(--foreground))"
              fontSize="14"
              fontWeight="600"
            >
              Total Income
            </text>
            <text
              x="400"
              y="215"
              textAnchor="middle"
              fill="hsl(var(--primary))"
              fontSize="20"
              fontWeight="700"
            >
              ${totalIncome.toLocaleString()}
            </text>

            {/* Flow lines to expenses (right top) */}
            {expenses.map((node, i) => {
              const height = getNodeHeight(node.amount, totalExpenses);
              const y = i * 70 + 30;
              const pathY = 200;
              return (
                <g key={`expense-flow-${i}`}>
                  <path
                    d={`M 500 ${pathY}
                        Q 575 ${pathY},
                          575 ${y + height / 2}`}
                    fill="none"
                    stroke="url(#expenseGradient)"
                    strokeWidth={height}
                    opacity="0.4"
                  />
                </g>
              );
            })}

            {/* Flow lines to savings (right bottom) */}
            {savings.map((node, i) => {
              const height = getNodeHeight(node.amount, totalSavings);
              const y = 280 + i * 60;
              const pathY = 200;
              return (
                <g key={`savings-flow-${i}`}>
                  <path
                    d={`M 500 ${pathY}
                        Q 575 ${pathY},
                          575 ${y + height / 2}`}
                    fill="none"
                    stroke="url(#savingsGradient)"
                    strokeWidth={height}
                    opacity="0.4"
                  />
                </g>
              );
            })}

            {/* Expense nodes (right top) */}
            <g>
              {expenses.map((node, i) => {
                const height = getNodeHeight(node.amount, totalExpenses);
                const y = i * 70 + 30;
                return (
                  <g key={`expense-${i}`}>
                    <rect
                      x="630"
                      y={y}
                      width="120"
                      height={height}
                      fill="hsl(var(--destructive))"
                      opacity="0.8"
                      rx="8"
                    />
                    <text
                      x="690"
                      y={y + height / 2 - 8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="hsl(var(--destructive-foreground))"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {node.name}
                    </text>
                    <text
                      x="690"
                      y={y + height / 2 + 8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="hsl(var(--destructive-foreground))"
                      fontSize="10"
                    >
                      ${node.amount.toLocaleString()}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Savings nodes (right bottom) */}
            <g>
              {savings.map((node, i) => {
                const height = getNodeHeight(node.amount, totalSavings);
                const y = 280 + i * 60;
                return (
                  <g key={`savings-${i}`}>
                    <rect
                      x="630"
                      y={y}
                      width="120"
                      height={height}
                      fill="hsl(var(--primary))"
                      opacity="0.8"
                      rx="8"
                    />
                    <text
                      x="690"
                      y={y + height / 2 - 8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="hsl(var(--primary-foreground))"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {node.name}
                    </text>
                    <text
                      x="690"
                      y={y + height / 2 + 8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="hsl(var(--primary-foreground))"
                      fontSize="10"
                    >
                      ${node.amount.toLocaleString()}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Income</span>
            </div>
            <div className="text-lg font-bold">${totalIncome.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-destructive mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs font-medium">Expenses</span>
            </div>
            <div className="text-lg font-bold">${totalExpenses.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium">Savings</span>
            </div>
            <div className="text-lg font-bold">${totalSavings.toLocaleString()}</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
