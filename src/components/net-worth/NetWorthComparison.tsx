import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';

interface NetWorthComparisonProps {
  weekChange: number;
  monthChange: number;
  yearChange: number;
  currentNetWorth: number;
}

export function NetWorthComparison({ 
  weekChange, 
  monthChange, 
  yearChange,
  currentNetWorth 
}: NetWorthComparisonProps) {
  const periods = [
    { label: '7 Days', change: weekChange },
    { label: '30 Days', change: monthChange },
    { label: '1 Year', change: yearChange },
  ];

  const getChangeDisplay = (change: number) => {
    const Icon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
    const color = change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-muted-foreground';
    const bgColor = change > 0 ? 'bg-green-500/10' : change < 0 ? 'bg-red-500/10' : 'bg-muted';
    const percentage = currentNetWorth !== 0 
      ? (Math.abs(change) / Math.abs(currentNetWorth - change)) * 100 
      : 0;

    return { Icon, color, bgColor, percentage };
  };

  return (
    <Card data-copilot-id="net-worth-comparison">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Period Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {periods.map(({ label, change }) => {
            const { Icon, color, bgColor, percentage } = getChangeDisplay(change);
            
            return (
              <div 
                key={label}
                className={`p-3 rounded-lg ${bgColor} text-center`}
              >
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <div className={`flex items-center justify-center gap-1 ${color}`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="font-semibold text-sm">
                    {change >= 0 ? '+' : ''}${Math.abs(change).toLocaleString()}
                  </span>
                </div>
                {percentage > 0 && (
                  <p className={`text-xs ${color} mt-0.5`}>
                    {change >= 0 ? '+' : '-'}{percentage.toFixed(1)}%
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
