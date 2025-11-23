import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useAccountSparkline } from '@/hooks/useAccountSparkline';

interface AccountSparklineProps {
  accountId: string;
  color?: string;
}

export const AccountSparkline = ({ accountId, color = 'hsl(186 80% 65%)' }: AccountSparklineProps) => {
  const { data: sparklineData, isLoading } = useAccountSparkline(accountId);

  if (isLoading || !sparklineData || sparklineData.length === 0) {
    return (
      <div className="h-12 w-full bg-muted/20 rounded animate-pulse" />
    );
  }

  const chartData = sparklineData.map(point => ({
    balance: point.balance,
  }));

  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`sparkline-${accountId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="balance"
          stroke={color}
          fill={`url(#sparkline-${accountId})`}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};