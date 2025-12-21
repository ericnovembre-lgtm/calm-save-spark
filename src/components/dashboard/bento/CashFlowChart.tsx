/**
 * CashFlowChart - Gold gradient area chart for cash flow visualization
 * Uses recharts with smooth monotone curves and minimalist styling
 */

import { useMemo } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { BentoCard } from "./BentoCard";
import { TrendingUp } from "lucide-react";

interface CashFlowDataPoint {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

interface CashFlowChartProps {
  data?: CashFlowDataPoint[];
  delay?: number;
}

// Default demo data
const defaultData: CashFlowDataPoint[] = [
  { month: "Jan", income: 5200, expenses: 3800, balance: 1400 },
  { month: "Feb", income: 5400, expenses: 4100, balance: 1300 },
  { month: "Mar", income: 5100, expenses: 3600, balance: 1500 },
  { month: "Apr", income: 5800, expenses: 4200, balance: 1600 },
  { month: "May", income: 6200, expenses: 4000, balance: 2200 },
  { month: "Jun", income: 5900, expenses: 3900, balance: 2000 },
];

const GOLD_GRADIENT_ID = "goldCashFlowGradient";

export function CashFlowChart({ data, delay = 0 }: CashFlowChartProps) {
  const chartData = data || defaultData;
  
  const totals = useMemo(() => {
    const totalIncome = chartData.reduce((sum, d) => sum + d.income, 0);
    const totalExpenses = chartData.reduce((sum, d) => sum + d.expenses, 0);
    return { income: totalIncome, expenses: totalExpenses, net: totalIncome - totalExpenses };
  }, [chartData]);

  return (
    <BentoCard delay={delay} className="h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Cash Flow Forecast</h3>
          <p className="text-sm text-muted-foreground">6-month projection</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-600">
            +${totals.net.toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={GOLD_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              hide 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            />
            
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#D4AF37"
              strokeWidth={2.5}
              fill={`url(#${GOLD_GRADIENT_ID})`}
              dot={false}
              activeDot={{ r: 6, fill: '#D4AF37', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-between mt-4 pt-4 border-t border-border/50">
        <div>
          <p className="text-xs text-muted-foreground">Total Income</p>
          <p className="text-lg font-semibold text-foreground">${totals.income.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total Expenses</p>
          <p className="text-lg font-semibold text-foreground">${totals.expenses.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Net Savings</p>
          <p className="text-lg font-semibold text-emerald-600">${totals.net.toLocaleString()}</p>
        </div>
      </div>
    </BentoCard>
  );
}
