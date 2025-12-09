import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingDown } from 'lucide-react';
import { LiabilityBreakdown } from '@/hooks/useNetWorthSnapshots';

interface LiabilityBreakdownCardProps {
  breakdown: LiabilityBreakdown;
  total: number;
}

const LIABILITY_LABELS: Record<string, string> = {
  credit_cards: 'Credit Cards',
  mortgages: 'Mortgages',
  student_loans: 'Student Loans',
  car_loans: 'Car Loans',
  personal_loans: 'Personal Loans',
  other: 'Other Debt',
};

const LIABILITY_COLORS: Record<string, string> = {
  credit_cards: 'hsl(0, 84%, 60%)',
  mortgages: 'hsl(0, 72%, 51%)',
  student_loans: 'hsl(15, 75%, 55%)',
  car_loans: 'hsl(25, 80%, 52%)',
  personal_loans: 'hsl(0, 65%, 65%)',
  other: 'hsl(var(--muted-foreground))',
};

export function LiabilityBreakdownCard({ breakdown, total }: LiabilityBreakdownCardProps) {
  const chartData = Object.entries(breakdown)
    .filter(([_, value]) => value && value > 0)
    .map(([key, value]) => ({
      name: LIABILITY_LABELS[key] || key,
      value: value as number,
      color: LIABILITY_COLORS[key] || 'hsl(var(--muted-foreground))',
      percentage: total > 0 ? ((value as number) / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-red-500">
            ${data.value.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {data.percentage.toFixed(1)}% of liabilities
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            Liabilities Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl mb-1">🎉</p>
            <p className="text-muted-foreground text-sm">No liabilities - great job!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-copilot-id="liability-breakdown">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-red-500" />
          Liabilities Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="w-[140px] h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {chartData.slice(0, 4).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </div>
                <span className="font-medium text-red-500">
                  ${item.value.toLocaleString()}
                </span>
              </div>
            ))}
            {chartData.length > 4 && (
              <p className="text-xs text-muted-foreground">
                +{chartData.length - 4} more
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
