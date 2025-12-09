import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { AssetBreakdown } from '@/hooks/useNetWorthSnapshots';

interface AssetBreakdownCardProps {
  breakdown: AssetBreakdown;
  total: number;
}

const ASSET_LABELS: Record<string, string> = {
  cash: 'Cash',
  savings: 'Savings',
  investments: 'Investments',
  property: 'Property',
  vehicles: 'Vehicles',
  other: 'Other Assets',
};

const ASSET_COLORS: Record<string, string> = {
  cash: 'hsl(142, 71%, 45%)',
  savings: 'hsl(142, 71%, 55%)',
  investments: 'hsl(162, 73%, 46%)',
  property: 'hsl(182, 73%, 38%)',
  vehicles: 'hsl(142, 50%, 65%)',
  other: 'hsl(var(--muted-foreground))',
};

export function AssetBreakdownCard({ breakdown, total }: AssetBreakdownCardProps) {
  const chartData = Object.entries(breakdown)
    .filter(([_, value]) => value && value > 0)
    .map(([key, value]) => ({
      name: ASSET_LABELS[key] || key,
      value: value as number,
      color: ASSET_COLORS[key] || 'hsl(var(--muted-foreground))',
      percentage: total > 0 ? ((value as number) / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-green-500">
            ${data.value.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {data.percentage.toFixed(1)}% of assets
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
            <TrendingUp className="w-5 h-5 text-green-500" />
            Assets Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No asset data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-copilot-id="asset-breakdown">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Assets Breakdown
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
                <span className="font-medium text-green-500">
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
