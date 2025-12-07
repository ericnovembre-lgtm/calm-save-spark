import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, TrendingUp, TrendingDown, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

// Local event type for scenario comparison
interface ComparisonEvent {
  id: string;
  label: string;
  icon: string;
  impact: number;
  ongoingImpact: number;
  description: string;
}

interface PathEvent {
  year: number;
  event: ComparisonEvent;
}

interface EnhancedScenarioComparisonProps {
  open: boolean;
  onClose: () => void;
  currentAge: number;
  initialNetWorth: number;
  annualReturn: number;
  annualSavings: number;
}

const LIFE_EVENTS: ComparisonEvent[] = [
  { id: 'house', label: 'Buy House', icon: '🏠', impact: -350000, ongoingImpact: -2000, description: 'Major purchase' },
  { id: 'child', label: 'Have Child', icon: '👶', impact: -15000, ongoingImpact: -12000, description: 'Growing family' },
  { id: 'raise', label: 'Get Raise', icon: '💰', impact: 0, ongoingImpact: 15000, description: 'Career growth' },
  { id: 'business', label: 'Start Business', icon: '🚀', impact: -50000, ongoingImpact: 25000, description: 'Entrepreneurship' },
  { id: 'wedding', label: 'Get Married', icon: '💒', impact: -30000, ongoingImpact: 0, description: 'Life milestone' },
  { id: 'inheritance', label: 'Inheritance', icon: '🎁', impact: 100000, ongoingImpact: 0, description: 'Windfall' },
  { id: 'layoff', label: 'Job Loss', icon: '📉', impact: -20000, ongoingImpact: -50000, description: 'Career setback' },
  { id: 'sidegig', label: 'Side Hustle', icon: '💼', impact: -5000, ongoingImpact: 12000, description: 'Extra income' },
];

export function EnhancedScenarioComparison({
  open,
  onClose,
  currentAge,
  initialNetWorth,
  annualReturn,
  annualSavings,
}: EnhancedScenarioComparisonProps) {
  const [pathAEvents, setPathAEvents] = useState<PathEvent[]>([]);
  const [pathBEvents, setPathBEvents] = useState<PathEvent[]>([]);
  const [selectedEventA, setSelectedEventA] = useState<string>('');
  const [selectedEventB, setSelectedEventB] = useState<string>('');
  const [yearA, setYearA] = useState<string>('');
  const [yearB, setYearB] = useState<string>('');

  // Calculate net worth for a path
  const calculatePath = useCallback((events: PathEvent[]) => {
    const timeline: { year: number; netWorth: number }[] = [];
    let netWorth = initialNetWorth;
    let yearlySavings = annualSavings;

    for (let age = currentAge; age <= currentAge + 40; age++) {
      // Apply event impacts
      events.forEach((pe) => {
        if (pe.year === age) {
          netWorth += pe.event.impact;
          yearlySavings += pe.event.ongoingImpact;
        }
      });

      // Apply returns and savings
      netWorth = netWorth * (1 + annualReturn) + yearlySavings;
      timeline.push({ year: age, netWorth: Math.round(netWorth) });
    }

    return timeline;
  }, [currentAge, initialNetWorth, annualReturn, annualSavings]);

  const pathATimeline = useMemo(() => calculatePath(pathAEvents), [pathAEvents, calculatePath]);
  const pathBTimeline = useMemo(() => calculatePath(pathBEvents), [pathBEvents, calculatePath]);

  // Combine timelines for chart
  const chartData = useMemo(() => {
    return pathATimeline.map((a, i) => ({
      year: a.year,
      pathA: a.netWorth,
      pathB: pathBTimeline[i]?.netWorth || 0,
      diff: (pathBTimeline[i]?.netWorth || 0) - a.netWorth,
    }));
  }, [pathATimeline, pathBTimeline]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const finalDiff = chartData[chartData.length - 1]?.diff || 0;
    const peakDiff = Math.max(...chartData.map(d => Math.abs(d.diff)));
    const crossovers = chartData.filter((d, i) => 
      i > 0 && Math.sign(d.diff) !== Math.sign(chartData[i - 1].diff)
    ).map(d => d.year);
    
    return {
      finalDiff,
      peakDiff,
      crossovers,
      winner: finalDiff > 0 ? 'B' : finalDiff < 0 ? 'A' : 'Tie',
    };
  }, [chartData]);

  const addEventToPath = (path: 'A' | 'B') => {
    const eventId = path === 'A' ? selectedEventA : selectedEventB;
    const year = parseInt(path === 'A' ? yearA : yearB);
    
    if (!eventId || isNaN(year)) return;
    
    const event = LIFE_EVENTS.find(e => e.id === eventId);
    if (!event) return;

    if (path === 'A') {
      setPathAEvents([...pathAEvents, { year, event }]);
      setSelectedEventA('');
      setYearA('');
    } else {
      setPathBEvents([...pathBEvents, { year, event }]);
      setSelectedEventB('');
      setYearB('');
    }
  };

  const removeEvent = (path: 'A' | 'B', index: number) => {
    if (path === 'A') {
      setPathAEvents(pathAEvents.filter((_, i) => i !== index));
    } else {
      setPathBEvents(pathBEvents.filter((_, i) => i !== index));
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-[95vw] max-w-6xl max-h-[90vh] overflow-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-stone-900/95 backdrop-blur-xl border-stone-700/50 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white font-mono">
                  Scenario Comparison
                </h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Path Builders */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Path A */}
              <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <h3 className="text-lg font-mono text-amber-400 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  Path A
                </h3>
                
                {/* Add Event */}
                <div className="flex gap-2 mb-4">
                  <Select value={selectedEventA} onValueChange={setSelectedEventA}>
                    <SelectTrigger className="flex-1 bg-white/5 border-white/10">
                      <SelectValue placeholder="Select event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {LIFE_EVENTS.map(event => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.icon} {event.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Age"
                    value={yearA}
                    onChange={(e) => setYearA(e.target.value)}
                    className="w-20 bg-white/5 border-white/10"
                    min={currentAge}
                    max={currentAge + 40}
                  />
                  <Button onClick={() => addEventToPath('A')} size="icon" className="bg-amber-500/20 hover:bg-amber-500/30">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Event List */}
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {pathAEvents.length === 0 ? (
                    <p className="text-white/40 text-sm text-center py-4">No events added</p>
                  ) : (
                    pathAEvents.map((pe, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5">
                        <span className="text-sm text-white/80">
                          {pe.event.icon} {pe.event.label} @ {pe.year}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => removeEvent('A', i)} className="h-6 w-6 text-red-400">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Path B */}
              <div className="p-4 rounded-lg border border-pink-500/30 bg-pink-500/5">
                <h3 className="text-lg font-mono text-pink-400 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-pink-400" />
                  Path B
                </h3>
                
                {/* Add Event */}
                <div className="flex gap-2 mb-4">
                  <Select value={selectedEventB} onValueChange={setSelectedEventB}>
                    <SelectTrigger className="flex-1 bg-white/5 border-white/10">
                      <SelectValue placeholder="Select event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {LIFE_EVENTS.map(event => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.icon} {event.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Age"
                    value={yearB}
                    onChange={(e) => setYearB(e.target.value)}
                    className="w-20 bg-white/5 border-white/10"
                    min={currentAge}
                    max={currentAge + 40}
                  />
                  <Button onClick={() => addEventToPath('B')} size="icon" className="bg-pink-500/20 hover:bg-pink-500/30">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Event List */}
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {pathBEvents.length === 0 ? (
                    <p className="text-white/40 text-sm text-center py-4">No events added</p>
                  ) : (
                    pathBEvents.map((pe, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5">
                        <span className="text-sm text-white/80">
                          {pe.event.icon} {pe.event.label} @ {pe.year}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => removeEvent('B', i)} className="h-6 w-6 text-red-400">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Comparison Chart */}
            <div className="h-80 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="pathAGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="pathBGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="year" 
                    stroke="#ffffff40" 
                    tick={{ fill: '#ffffff60', fontSize: 10 }}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#ffffff40" 
                    tick={{ fill: '#ffffff60', fontSize: 10 }}
                    tickFormatter={(v) => formatCurrency(v)}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === 'pathA' ? 'Path A' : name === 'pathB' ? 'Path B' : 'Difference',
                    ]}
                    labelFormatter={(label) => `Age ${label}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="pathA"
                    name="Path A"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#pathAGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="pathB"
                    name="Path B"
                    stroke="#ec4899"
                    strokeWidth={2}
                    fill="url(#pathBGradient)"
                  />
                  {metrics.crossovers.map((year) => (
                    <ReferenceLine
                      key={year}
                      x={year}
                      stroke="#fbbf24"
                      strokeDasharray="5 5"
                      label={{ value: '⚡', fill: '#fbbf24', fontSize: 12 }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-white/40 font-mono mb-1">Final Difference</p>
                <p className={`text-2xl font-bold font-mono ${metrics.finalDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {metrics.finalDiff >= 0 ? '+' : ''}{formatCurrency(metrics.finalDiff)}
                </p>
                <p className="text-xs text-white/60 mt-1">
                  Path {metrics.winner} wins
                </p>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-white/40 font-mono mb-1">Peak Divergence</p>
                <p className="text-2xl font-bold font-mono text-yellow-400">
                  {formatCurrency(metrics.peakDiff)}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-white/40 font-mono mb-1">Crossover Points</p>
                <p className="text-2xl font-bold font-mono text-orange-400">
                  {metrics.crossovers.length}
                </p>
                {metrics.crossovers.length > 0 && (
                  <p className="text-xs text-white/60 mt-1">
                    Ages: {metrics.crossovers.join(', ')}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-white/40 font-mono mb-1">Better Path</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {metrics.winner === 'A' ? (
                    <TrendingUp className="w-8 h-8 text-amber-400" />
                  ) : metrics.winner === 'B' ? (
                    <TrendingUp className="w-8 h-8 text-pink-400" />
                  ) : (
                    <ArrowRight className="w-8 h-8 text-white/40" />
                  )}
                  <span className={`text-2xl font-bold font-mono ${
                    metrics.winner === 'A' ? 'text-amber-400' : 
                    metrics.winner === 'B' ? 'text-pink-400' : 'text-white/40'
                  }`}>
                    {metrics.winner}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}