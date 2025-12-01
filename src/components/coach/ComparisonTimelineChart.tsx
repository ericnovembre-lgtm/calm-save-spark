import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScenarioData {
  id: string;
  name: string;
  color: { line: string; fill: string };
  baseline: Array<{ date: string; value: number }>;
  simulated: Array<{ date: string; value: number }>;
  confidence?: {
    p10: Array<{ date: string; value: number }>;
    p90: Array<{ date: string; value: number }>;
  };
}

interface ComparisonTimelineChartProps {
  scenarios: ScenarioData[];
  showConfidenceIntervals: boolean;
  onToggleConfidence: () => void;
}

export function ComparisonTimelineChart({ 
  scenarios, 
  showConfidenceIntervals,
  onToggleConfidence 
}: ComparisonTimelineChartProps) {
  const [hiddenScenarios, setHiddenScenarios] = useState<Set<string>>(new Set());

  // Transform data for recharts
  const chartData = transformDataForChart(scenarios);

  const toggleScenario = (id: string) => {
    setHiddenScenarios(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white/5 border border-white/10 rounded-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-mono text-white mb-1">Scenario Comparison</h3>
          <p className="text-sm text-white/60">Comparing {scenarios.length} financial trajectories</p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleConfidence}
          className="text-white/60 hover:text-white"
        >
          {showConfidenceIntervals ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Hide Confidence
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Show Confidence
            </>
          )}
        </Button>
      </div>

      {/* Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
              tickFormatter={(value) => new Date(value).getFullYear().toString()}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '12px',
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}
              formatter={(value: any) => [formatCurrency(value), '']}
            />

            {/* Confidence intervals (if enabled, show only for first scenario) */}
            {showConfidenceIntervals && scenarios[0]?.confidence && !hiddenScenarios.has(scenarios[0].id) && (
              <Area
                type="monotone"
                dataKey={`${scenarios[0].id}_p90`}
                stroke="none"
                fill={scenarios[0].color.fill}
                fillOpacity={0.3}
              />
            )}

            {/* Scenario lines */}
            {scenarios.map((scenario, index) => {
              if (hiddenScenarios.has(scenario.id)) return null;

              return (
                <Line
                  key={scenario.id}
                  type="monotone"
                  dataKey={`${scenario.id}_simulated`}
                  stroke={scenario.color.line}
                  strokeWidth={2}
                  dot={false}
                  animationDuration={1000 + index * 200}
                  animationBegin={index * 200}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Legend */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {scenarios.map((scenario) => {
          const isHidden = hiddenScenarios.has(scenario.id);
          
          return (
            <motion.button
              key={scenario.id}
              onClick={() => toggleScenario(scenario.id)}
              className={`flex items-center gap-3 p-3 rounded border transition-all ${
                isHidden
                  ? 'border-white/10 bg-white/5 opacity-40'
                  : 'border-white/20 bg-white/5 hover:border-white/30'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: scenario.color.line }}
              />
              <span className="text-sm font-mono text-white truncate flex-1 text-left">
                {scenario.name}
              </span>
              {isHidden && <EyeOff className="w-4 h-4 text-white/40" />}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// Transform scenario data into chart-compatible format
function transformDataForChart(scenarios: ScenarioData[]) {
  const dateMap = new Map<string, any>();

  scenarios.forEach((scenario) => {
    // Add simulated path
    scenario.simulated.forEach((point) => {
      if (!dateMap.has(point.date)) {
        dateMap.set(point.date, { date: point.date });
      }
      const entry = dateMap.get(point.date)!;
      entry[`${scenario.id}_simulated`] = point.value;
    });

    // Add confidence intervals if available
    if (scenario.confidence) {
      scenario.confidence.p10.forEach((point, i) => {
        const entry = dateMap.get(point.date);
        if (entry) {
          entry[`${scenario.id}_p10`] = point.value;
          entry[`${scenario.id}_p90`] = scenario.confidence!.p90[i]?.value;
        }
      });
    }
  });

  return Array.from(dateMap.values()).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
