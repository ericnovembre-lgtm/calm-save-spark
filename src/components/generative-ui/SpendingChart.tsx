import { Card } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { SpendingDataPoint } from "./types";

interface SpendingChartProps {
  data: SpendingDataPoint[];
  color?: string;
  title?: string;
  onPointClick?: (data: SpendingDataPoint) => void;
}

export function SpendingChart({ 
  data, 
  color = "hsl(var(--primary))", 
  title = "Spending Over Time",
  onPointClick 
}: SpendingChartProps) {
  const formattedData = data.map(point => ({
    ...point,
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    displayAmount: point.amount
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 backdrop-blur-sm bg-card/80 border-border/50">
        <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={formattedData}
              onClick={(data) => {
                if (data?.activePayload?.[0]?.payload && onPointClick) {
                  onPointClick(data.activePayload[0].payload);
                }
              }}
            >
              <defs>
                <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
              />
              <Area 
                type="monotone" 
                dataKey="displayAmount" 
                stroke={color}
                strokeWidth={2}
                fill="url(#spendingGradient)"
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}
