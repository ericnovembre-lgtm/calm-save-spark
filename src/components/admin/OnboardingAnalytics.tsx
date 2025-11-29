/**
 * Admin dashboard component for visualizing onboarding analytics
 * Shows completion funnel, drop-off points, and average time per step
 */

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LazyBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "@/components/charts/LazyBarChart";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Users, TrendingDown, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

// Mock data - in production, this would come from analytics_events table
const ONBOARDING_STEPS = [
  { id: 'welcome', name: 'Welcome', index: 0 },
  { id: 'daily-briefing', name: 'Daily Briefing', index: 1 },
  { id: 'savings-balance', name: 'Savings Balance', index: 2 },
  { id: 'smart-actions', name: 'Smart Actions', index: 3 },
  { id: 'nlq-commander', name: 'Ask Anything', index: 4 },
  { id: 'unified-fab', name: 'Quick Actions', index: 5 },
  { id: 'complete', name: 'Complete', index: 6 },
];

// Mock analytics data
const mockFunnelData = [
  { step: 'Welcome', users: 1247, rate: 100 },
  { step: 'Daily Briefing', users: 1180, rate: 94.6 },
  { step: 'Savings Balance', users: 1089, rate: 87.3 },
  { step: 'Smart Actions', users: 967, rate: 77.5 },
  { step: 'Ask Anything', users: 892, rate: 71.5 },
  { step: 'Quick Actions', users: 845, rate: 67.8 },
  { step: 'Complete', users: 798, rate: 64.0 },
];

const mockDropOffData = [
  { step: 'Welcome → Daily', dropOff: 67, rate: 5.4 },
  { step: 'Daily → Savings', dropOff: 91, rate: 7.7 },
  { step: 'Savings → Smart', dropOff: 122, rate: 11.2 },
  { step: 'Smart → Ask', dropOff: 75, rate: 7.8 },
  { step: 'Ask → Quick', dropOff: 47, rate: 5.3 },
  { step: 'Quick → Complete', dropOff: 47, rate: 5.6 },
];

const mockTimeData = [
  { step: 'Welcome', avgTime: 4.2, color: 'hsl(var(--primary))' },
  { step: 'Daily Briefing', avgTime: 8.5, color: 'hsl(var(--primary))' },
  { step: 'Savings', avgTime: 6.1, color: 'hsl(var(--primary))' },
  { step: 'Smart Actions', avgTime: 12.3, color: 'hsl(var(--destructive))' },
  { step: 'Ask Anything', avgTime: 7.8, color: 'hsl(var(--primary))' },
  { step: 'Quick Actions', avgTime: 5.4, color: 'hsl(var(--primary))' },
];

export function OnboardingAnalytics() {
  const prefersReducedMotion = useReducedMotion();

  const totalStarted = mockFunnelData[0].users;
  const totalCompleted = mockFunnelData[mockFunnelData.length - 1].users;
  const completionRate = ((totalCompleted / totalStarted) * 100).toFixed(1);
  const avgCompletionTime = mockTimeData.reduce((sum, s) => sum + s.avgTime, 0).toFixed(1);
  const highestDropOff = mockDropOffData.reduce((max, d) => d.dropOff > max.dropOff ? d : max);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          icon={Users}
          label="Tours Started"
          value={totalStarted.toLocaleString()}
          subtext="Last 30 days"
          delay={0}
          prefersReducedMotion={prefersReducedMotion}
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Completion Rate"
          value={`${completionRate}%`}
          subtext={`${totalCompleted} completed`}
          trend="+3.2%"
          trendPositive
          delay={0.1}
          prefersReducedMotion={prefersReducedMotion}
        />
        <SummaryCard
          icon={Clock}
          label="Avg. Completion Time"
          value={`${avgCompletionTime}s`}
          subtext="Per tour"
          delay={0.2}
          prefersReducedMotion={prefersReducedMotion}
        />
        <SummaryCard
          icon={TrendingDown}
          label="Highest Drop-off"
          value={highestDropOff.step}
          subtext={`${highestDropOff.rate}% drop`}
          trendPositive={false}
          delay={0.3}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>

      {/* Completion Funnel */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Completion Funnel
        </h3>
        <div className="space-y-3">
          {mockFunnelData.map((step, index) => (
            <FunnelStep
              key={step.step}
              name={step.step}
              users={step.users}
              rate={step.rate}
              index={index}
              isLast={index === mockFunnelData.length - 1}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Drop-off Points */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Drop-off Points
          </h3>
          <LazyBarChart data={mockDropOffData} height={280}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="step" 
              className="text-xs" 
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [
                name === 'dropOff' ? `${value} users` : `${value}%`,
                name === 'dropOff' ? 'Users Lost' : 'Drop Rate'
              ]}
            />
            <Bar dataKey="dropOff" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
          </LazyBarChart>
        </Card>

        {/* Average Time per Step */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Avg. Time per Step (seconds)
          </h3>
          <LazyBarChart data={mockTimeData} height={280}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="step" 
              className="text-xs" 
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value}s`, 'Avg. Time']}
            />
            <Bar dataKey="avgTime" radius={[4, 4, 0, 0]}>
              {mockTimeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </LazyBarChart>
          <p className="text-xs text-muted-foreground mt-2">
            <span className="inline-block w-3 h-3 rounded bg-destructive mr-1" />
            Steps with above-average time are highlighted
          </p>
        </Card>
      </div>

      {/* Step-by-Step Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Step-by-Step Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium">Step</th>
                <th className="text-right py-3 px-2 font-medium">Views</th>
                <th className="text-right py-3 px-2 font-medium">Completions</th>
                <th className="text-right py-3 px-2 font-medium">Drop-offs</th>
                <th className="text-right py-3 px-2 font-medium">Avg. Time</th>
                <th className="text-right py-3 px-2 font-medium">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {ONBOARDING_STEPS.slice(0, -1).map((step, index) => {
                const funnel = mockFunnelData[index];
                const nextFunnel = mockFunnelData[index + 1];
                const dropOff = funnel.users - (nextFunnel?.users || funnel.users);
                const conversion = nextFunnel 
                  ? ((nextFunnel.users / funnel.users) * 100).toFixed(1)
                  : '100.0';
                const time = mockTimeData[index];
                
                return (
                  <motion.tr
                    key={step.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/50"
                  >
                    <td className="py-3 px-2 font-medium">{step.name}</td>
                    <td className="py-3 px-2 text-right">{funnel.users.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right text-green-600">
                      {(nextFunnel?.users || funnel.users).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right text-destructive">
                      {dropOff > 0 ? `-${dropOff}` : '—'}
                    </td>
                    <td className="py-3 px-2 text-right">{time?.avgTime || '—'}s</td>
                    <td className="py-3 px-2 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        parseFloat(conversion) >= 90 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : parseFloat(conversion) >= 80
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {conversion}%
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// Summary Card Component
interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext: string;
  trend?: string;
  trendPositive?: boolean;
  delay: number;
  prefersReducedMotion: boolean;
}

function SummaryCard({ 
  icon: Icon, 
  label, 
  value, 
  subtext, 
  trend, 
  trendPositive,
  delay,
  prefersReducedMotion 
}: SummaryCardProps) {
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">{subtext}</span>
          {trend && (
            <span className={`text-xs font-medium ${
              trendPositive ? 'text-green-600' : 'text-destructive'
            }`}>
              {trend}
            </span>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// Funnel Step Component
interface FunnelStepProps {
  name: string;
  users: number;
  rate: number;
  index: number;
  isLast: boolean;
  prefersReducedMotion: boolean;
}

function FunnelStep({ name, users, rate, index, isLast, prefersReducedMotion }: FunnelStepProps) {
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="flex items-center gap-4"
    >
      <div className="w-32 text-sm font-medium truncate">{name}</div>
      <div className="flex-1">
        <Progress value={rate} className="h-6" />
      </div>
      <div className="w-20 text-right">
        <span className="text-sm font-bold">{users.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground ml-1">({rate}%)</span>
      </div>
      {!isLast && (
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      )}
    </motion.div>
  );
}
