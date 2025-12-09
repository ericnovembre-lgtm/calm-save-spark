import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface IncomeVsExpensesProps {
  monthlyIncome: number;
  monthlyExpenses: number;
}

export function IncomeVsExpenses({ monthlyIncome, monthlyExpenses }: IncomeVsExpensesProps) {
  const surplus = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (surplus / monthlyIncome) * 100 : 0;

  const data = [
    { name: 'Income', value: monthlyIncome, fill: 'hsl(142, 71%, 45%)' },
    { name: 'Expenses', value: monthlyExpenses, fill: 'hsl(0, 84%, 60%)' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm">
            ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  const SurplusIcon = surplus > 0 ? TrendingUp : surplus < 0 ? TrendingDown : Minus;
  const surplusColor = surplus > 0 ? 'text-green-500' : surplus < 0 ? 'text-red-500' : 'text-muted-foreground';

  return (
    <Card data-copilot-id="income-vs-expenses">
      <CardHeader>
        <CardTitle className="text-lg">Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[150px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barCategoryGap="30%">
              <XAxis 
                type="number" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <YAxis 
                type="category" 
                dataKey="name"
                tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Monthly Surplus</p>
            <p className={`text-xl font-bold ${surplusColor}`}>
              <SurplusIcon className="w-4 h-4 inline mr-1" />
              ${Math.abs(surplus).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Savings Rate</p>
            <p className={`text-xl font-bold ${savingsRate >= 20 ? 'text-green-500' : savingsRate >= 10 ? 'text-amber-500' : 'text-red-500'}`}>
              {savingsRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
