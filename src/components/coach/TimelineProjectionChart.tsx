import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { motion } from "framer-motion";

interface TimelineProjectionChartProps {
  currentPath: Array<{ date: string; value: number }>;
  simulatedPath: Array<{ date: string; value: number }>;
  scenarioName: string;
  scenarioDate?: string;
}

export function TimelineProjectionChart({
  currentPath,
  simulatedPath,
  scenarioName,
  scenarioDate,
}: TimelineProjectionChartProps) {
  const mergedData = useMemo(() => {
    const dataMap = new Map();
    
    currentPath.forEach((point) => {
      dataMap.set(point.date, { date: point.date, current: point.value });
    });
    
    simulatedPath.forEach((point) => {
      const existing = dataMap.get(point.date) || { date: point.date };
      dataMap.set(point.date, { ...existing, simulated: point.value });
    });
    
    return Array.from(dataMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [currentPath, simulatedPath]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-[400px] bg-command-surface border border-white/10 rounded-2xl p-6"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white font-mono mb-1">
          Scenario: {scenarioName}
        </h3>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-command-cyan" />
            <span className="text-command-cyan">Current Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-command-violet" />
            <span className="text-command-violet">Simulated Path</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={mergedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(189, 94%, 43%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(189, 94%, 43%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="simulatedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(258, 90%, 66%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(258, 90%, 66%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="rgba(255,255,255,0.3)"
            style={{ fontSize: "10px", fontFamily: "monospace" }}
          />
          
          <YAxis
            tickFormatter={formatCurrency}
            stroke="rgba(255,255,255,0.3)"
            style={{ fontSize: "10px", fontFamily: "monospace" }}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(222, 47%, 8%)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontFamily: "monospace",
              fontSize: "12px",
            }}
            labelFormatter={formatDate}
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              name === "current" ? "Current" : "Simulated",
            ]}
          />
          
          {scenarioDate && (
            <ReferenceLine
              x={scenarioDate}
              stroke="rgba(255,255,255,0.3)"
              strokeDasharray="5 5"
              label={{
                value: "Event",
                position: "top",
                fill: "rgba(255,255,255,0.5)",
                fontSize: 10,
                fontFamily: "monospace",
              }}
            />
          )}
          
          <Area
            type="monotone"
            dataKey="current"
            stroke="hsl(189, 94%, 43%)"
            strokeWidth={2}
            fill="url(#currentGradient)"
            animationDuration={2000}
          />
          
          <Area
            type="monotone"
            dataKey="simulated"
            stroke="hsl(258, 90%, 66%)"
            strokeWidth={2}
            fill="url(#simulatedGradient)"
            strokeDasharray="5 5"
            animationDuration={2000}
            animationBegin={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
