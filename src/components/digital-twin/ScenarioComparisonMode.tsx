import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GitBranch, X, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ScenarioData {
  id: string;
  name: string;
  events: Array<{ year: number; label: string; impact: number }>;
  timeline: Array<{ year: number; netWorth: number }>;
}

interface ScenarioComparisonModeProps {
  onClose: () => void;
  baseScenario: ScenarioData;
  alternateScenario: ScenarioData;
}

export function ScenarioComparisonMode({ 
  onClose, 
  baseScenario, 
  alternateScenario 
}: ScenarioComparisonModeProps) {
  const [activeScenario, setActiveScenario] = useState<'base' | 'alternate'>('base');

  // Merge timelines for comparison chart
  const mergedData = baseScenario.timeline.map((basePoint, idx) => ({
    year: basePoint.year,
    pathA: basePoint.netWorth,
    pathB: alternateScenario.timeline[idx]?.netWorth || 0,
  }));

  // Calculate differences
  const finalBaseNetWorth = baseScenario.timeline[baseScenario.timeline.length - 1]?.netWorth || 0;
  const finalAltNetWorth = alternateScenario.timeline[alternateScenario.timeline.length - 1]?.netWorth || 0;
  const netWorthDiff = finalAltNetWorth - finalBaseNetWorth;
  const percentDiff = ((netWorthDiff / finalBaseNetWorth) * 100).toFixed(1);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="container mx-auto px-4 py-8 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <GitBranch className="w-6 h-6 text-cyan-500" />
            <h2 className="text-2xl font-bold text-white">Scenario Comparison</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Split View */}
        <div className="grid md:grid-cols-2 gap-6 mb-6 flex-1">
          {/* Path A */}
          <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-cyan-400">Path A: {baseScenario.name}</h3>
              <div className="text-2xl font-mono text-cyan-400">
                ${(finalBaseNetWorth / 1000).toFixed(0)}k
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {baseScenario.events.map((event, idx) => (
                <div key={idx} className="flex items-center justify-between text-white/60">
                  <span>Age {event.year}: {event.label}</span>
                  <span className={event.impact >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {event.impact >= 0 ? '+' : ''}{(event.impact / 1000).toFixed(0)}k
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Path B */}
          <Card className="p-6 bg-gradient-to-br from-magenta-500/10 to-transparent border-magenta-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-magenta-400">Path B: {alternateScenario.name}</h3>
              <div className="text-2xl font-mono text-magenta-400">
                ${(finalAltNetWorth / 1000).toFixed(0)}k
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {alternateScenario.events.map((event, idx) => (
                <div key={idx} className="flex items-center justify-between text-white/60">
                  <span>Age {event.year}: {event.label}</span>
                  <span className={event.impact >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {event.impact >= 0 ? '+' : ''}{(event.impact / 1000).toFixed(0)}k
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Comparison Chart */}
        <Card className="p-6 mb-6 bg-black/60 border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-white">Timeline Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mergedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="year" 
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                style={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="pathA"
                stroke="#00ffff"
                strokeWidth={2}
                name="Path A"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="pathB"
                stroke="#ff00ff"
                strokeWidth={2}
                name="Path B"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Summary Panel */}
        <Card className="p-6 bg-black/60 border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-white">Impact Summary</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-sm text-white/60 mb-2">Net Worth Difference</div>
              <div className={`text-3xl font-bold ${netWorthDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {netWorthDiff >= 0 ? '+' : ''}{(netWorthDiff / 1000).toFixed(0)}k
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-white/60 mb-2">Percentage Change</div>
              <div className={`text-3xl font-bold ${netWorthDiff >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center justify-center gap-2`}>
                {netWorthDiff >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                {percentDiff}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-white/60 mb-2">Better Path</div>
              <div className="text-3xl font-bold text-white">
                Path {netWorthDiff >= 0 ? 'B' : 'A'}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}