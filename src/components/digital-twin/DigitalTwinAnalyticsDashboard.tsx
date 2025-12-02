import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Brain, 
  TrendingUp, 
  MessageSquare, 
  Save, 
  Lightbulb,
  Clock,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useDigitalTwinAnalytics } from '@/hooks/useDigitalTwinAnalytics';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'];

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  delay?: number;
}

function StatCard({ icon: Icon, label, value, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="p-4 bg-slate-900/50 border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", color)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-white/60">{label}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function DigitalTwinAnalyticsDashboard() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useDigitalTwinAnalytics(days);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-cyan-500 animate-pulse mx-auto mb-2" />
          <p className="text-white/60 font-mono text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 bg-slate-900/50 border-white/10 text-center">
        <BarChart3 className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/60">No analytics data available yet.</p>
        <p className="text-white/40 text-sm mt-1">Start using the Digital Twin to generate insights!</p>
      </Card>
    );
  }

  const { summary, modelUsage, dailyActivity, lifeEventsCount, recentInsights, probabilityTrends } = data;

  const modelUsageData = Object.entries(modelUsage).map(([name, value]) => ({
    name: name.split('/').pop() || name,
    value,
  }));

  return (
    <div className="space-y-6">
      {/* Time range selector */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-white/60" />
        <span className="text-white/60 text-sm">Time range:</span>
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={cn(
              "px-3 py-1 rounded-full text-xs transition-colors",
              days === d 
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            )}
          >
            {d}d
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard 
          icon={BarChart3} 
          label="Simulations" 
          value={summary.totalSimulations} 
          color="bg-cyan-500/20"
          delay={0}
        />
        <StatCard 
          icon={MessageSquare} 
          label="Chat Queries" 
          value={summary.totalChatQueries} 
          color="bg-violet-500/20"
          delay={0.05}
        />
        <StatCard 
          icon={Save} 
          label="Scenarios Saved" 
          value={summary.scenariosSaved} 
          color="bg-emerald-500/20"
          delay={0.1}
        />
        <StatCard 
          icon={Lightbulb} 
          label="Insights" 
          value={summary.insightsGenerated} 
          color="bg-amber-500/20"
          delay={0.15}
        />
        <StatCard 
          icon={Brain} 
          label="NL Scenarios" 
          value={summary.nlScenariosCreated} 
          color="bg-pink-500/20"
          delay={0.2}
        />
        <StatCard 
          icon={Clock} 
          label="Avg Response" 
          value={`${summary.avgResponseTime}ms`} 
          color="bg-blue-500/20"
          delay={0.25}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 bg-slate-900/50 border-white/10 backdrop-blur-xl">
            <h3 className="text-sm font-medium text-white/80 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              Daily Activity
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyActivity}>
                  <defs>
                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                    tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15,23,42,0.9)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                    }}
                    labelStyle={{ color: 'white' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#06b6d4" 
                    fill="url(#activityGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Model Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="p-4 bg-slate-900/50 border-white/10 backdrop-blur-xl">
            <h3 className="text-sm font-medium text-white/80 mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-500" />
              Model Usage
            </h3>
            <div className="h-48 flex items-center justify-center">
              {modelUsageData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={modelUsageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {modelUsageData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(15,23,42,0.9)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-white/40 text-sm">No model usage data</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {modelUsageData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ background: COLORS[i % COLORS.length] }} 
                  />
                  <span className="text-white/60">{item.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Life Events & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Life Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 bg-slate-900/50 border-white/10 backdrop-blur-xl">
            <h3 className="text-sm font-medium text-white/80 mb-4">Top Life Events Simulated</h3>
            <div className="h-48">
              {lifeEventsCount.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lifeEventsCount.slice(0, 5)} layout="vertical">
                    <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                    <YAxis 
                      type="category" 
                      dataKey="event" 
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
                      width={100}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(15,23,42,0.9)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-white/40 text-sm">No life events data</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Recent Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="p-4 bg-slate-900/50 border-white/10 backdrop-blur-xl">
            <h3 className="text-sm font-medium text-white/80 mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Recent Insights
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {recentInsights && recentInsights.length > 0 ? (
                recentInsights.map((insight, i) => (
                  <div 
                    key={i} 
                    className="p-2 rounded-lg bg-white/5 border border-white/5"
                  >
                    <p className="text-xs text-white/80 line-clamp-2">{insight.summary}</p>
                    <p className="text-[10px] text-white/40 mt-1">
                      {new Date(insight.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-white/40 text-sm">No insights generated yet</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
