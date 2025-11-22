import { Card } from '@/components/ui/card';
import { useAutomationAnalytics } from '@/hooks/useAutomationAnalytics';
import { TrendingUp, DollarSign, Zap, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import CountUp from 'react-countup';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function AutomationAnalyticsDashboard() {
  const { data: analytics, isLoading } = useAutomationAnalytics();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  if (isLoading || !analytics) {
    return (
      <Card className="glass-panel p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-500';
    if (rate >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-circuit-accent" />
          Automation Analytics
        </h2>
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="gap-2"
          >
            {isCollapsed ? (
              <>
                Expand <ChevronDown className="w-4 h-4" />
              </>
            ) : (
              <>
                Collapse <ChevronUp className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {(!isMobile || !isCollapsed) && (
          <motion.div
            initial={isMobile ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Success Rate */}
              <Card className="p-4 bg-circuit-bg/30 border-circuit-line/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-circuit-accent" />
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
                <p className={`text-3xl font-bold ${getSuccessRateColor(analytics.successRate)}`}>
                  <CountUp end={analytics.successRate} decimals={1} suffix="%" duration={1} />
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.totalExecutions} total executions
                </p>
              </Card>

              {/* Total Savings */}
              <Card className="p-4 bg-circuit-bg/30 border-circuit-line/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <p className="text-xs text-muted-foreground">Total Savings</p>
                </div>
                <p className="text-3xl font-bold text-green-500">
                  $<CountUp end={analytics.totalSavings} decimals={0} duration={1} />
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: ${analytics.averageTransfer.toFixed(0)}/transfer
                </p>
              </Card>

              {/* Most Triggered */}
              <Card className="p-4 bg-circuit-bg/30 border-circuit-line/20 md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-circuit-accent" />
                  <p className="text-xs text-muted-foreground">Top Rule</p>
                </div>
                {analytics.topRules.length > 0 ? (
                  <>
                    <p className="text-lg font-semibold truncate">
                      {analytics.topRules[0].rule_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Executed {analytics.topRules[0].execution_count} times
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No data yet</p>
                )}
              </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Execution Trend */}
              <Card className="p-4 bg-circuit-bg/30 border-circuit-line/20">
                <h3 className="text-sm font-semibold mb-4">30-Day Execution Trend</h3>
                {analytics.dailyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={analytics.dailyTrend}>
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--circuit-bg))',
                          border: '1px solid hsl(var(--circuit-line))',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--circuit-line))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                    No execution data available
                  </div>
                )}
              </Card>

              {/* Top Rules Chart */}
              <Card className="p-4 bg-circuit-bg/30 border-circuit-line/20">
                <h3 className="text-sm font-semibold mb-4">Top 5 Rules by Execution</h3>
                {analytics.topRules.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analytics.topRules} layout="vertical">
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <YAxis
                        dataKey="rule_name"
                        type="category"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        width={100}
                        tickFormatter={(name) => name.length > 15 ? name.slice(0, 15) + '...' : name}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--circuit-bg))',
                          border: '1px solid hsl(var(--circuit-line))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="execution_count" fill="hsl(var(--circuit-accent))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                    No execution data available
                  </div>
                )}
              </Card>
            </div>

            {/* Failure Analysis */}
            {analytics.failureRate > 0 && (
              <Card className="p-4 bg-red-500/10 border-red-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold mb-1">
                      {analytics.failureRate.toFixed(1)}% Failure Rate
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Some automations are failing. Check your account balance and rule configurations.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isMobile && isCollapsed && (
        <div className="text-center text-sm text-muted-foreground">
          {analytics.totalExecutions} executions • {analytics.successRate.toFixed(1)}% success • ${analytics.totalSavings.toFixed(0)} saved
        </div>
      )}
    </Card>
  );
}
