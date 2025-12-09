import { useMemo } from "react";
import { useAccountSparkline } from "@/hooks/useAccountSparkline";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface AccountBalanceChartProps {
  accountId: string;
}

export function AccountBalanceChart({ accountId }: AccountBalanceChartProps) {
  const { data: balanceHistory, isLoading } = useAccountSparkline(accountId);

  const chartData = useMemo(() => {
    if (!balanceHistory || balanceHistory.length === 0) return [];
    
    return balanceHistory.map(entry => ({
      date: format(new Date(entry.recorded_at), 'MMM d'),
      balance: entry.balance,
      fullDate: format(new Date(entry.recorded_at), 'MMM d, yyyy'),
    }));
  }, [balanceHistory]);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <p>No balance history available yet</p>
      </div>
    );
  }

  const minBalance = Math.min(...chartData.map(d => d.balance));
  const maxBalance = Math.max(...chartData.map(d => d.balance));
  const trend = chartData.length >= 2 
    ? chartData[chartData.length - 1].balance - chartData[0].balance 
    : 0;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop 
                offset="5%" 
                stopColor={trend >= 0 ? "hsl(var(--chart-2))" : "hsl(var(--destructive))"} 
                stopOpacity={0.3}
              />
              <stop 
                offset="95%" 
                stopColor={trend >= 0 ? "hsl(var(--chart-2))" : "hsl(var(--destructive))"} 
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            domain={[minBalance * 0.95, maxBalance * 1.05]}
            tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
            width={60}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number) => [
              `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
              'Balance'
            ]}
            labelFormatter={(label) => chartData.find(d => d.date === label)?.fullDate || label}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke={trend >= 0 ? "hsl(var(--chart-2))" : "hsl(var(--destructive))"}
            strokeWidth={2}
            fill="url(#balanceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
