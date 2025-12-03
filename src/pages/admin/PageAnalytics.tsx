import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock,
  ArrowUp,
  ArrowDown,
  Eye
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";

export default function PageAnalytics() {
  // Fetch top pages
  const { data: topPages, isLoading: loadingTopPages } = useQuery({
    queryKey: ['page-analytics-top'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_views')
        .select('route, title')
        .gte('timestamp', subDays(new Date(), 30).toISOString());
      
      if (error) throw error;
      
      // Aggregate by route
      const counts: Record<string, { route: string; title: string; count: number }> = {};
      data?.forEach(row => {
        if (!counts[row.route]) {
          counts[row.route] = { route: row.route, title: row.title || row.route, count: 0 };
        }
        counts[row.route].count++;
      });
      
      return Object.values(counts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);
    },
    staleTime: 60000,
  });

  // Fetch daily trend
  const { data: dailyTrend, isLoading: loadingTrend } = useQuery({
    queryKey: ['page-analytics-trend'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_views')
        .select('timestamp')
        .gte('timestamp', subDays(new Date(), 14).toISOString());
      
      if (error) throw error;
      
      // Group by day
      const byDay: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) {
        const day = format(subDays(new Date(), i), 'yyyy-MM-dd');
        byDay[day] = 0;
      }
      
      data?.forEach(row => {
        const day = format(new Date(row.timestamp), 'yyyy-MM-dd');
        if (byDay[day] !== undefined) {
          byDay[day]++;
        }
      });
      
      return Object.entries(byDay).map(([date, views]) => ({
        date: format(new Date(date), 'MMM d'),
        views
      }));
    },
    staleTime: 60000,
  });

  // Fetch summary stats
  const { data: stats } = useQuery({
    queryKey: ['page-analytics-stats'],
    queryFn: async () => {
      const today = startOfDay(new Date()).toISOString();
      const yesterday = startOfDay(subDays(new Date(), 1)).toISOString();
      const lastWeek = subDays(new Date(), 7).toISOString();
      
      const [todayResult, yesterdayResult, weekResult, uniqueResult] = await Promise.all([
        supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('timestamp', today),
        supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('timestamp', yesterday).lt('timestamp', today),
        supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('timestamp', lastWeek),
        supabase.from('page_views').select('user_id').gte('timestamp', lastWeek),
      ]);
      
      const uniqueUsers = new Set(uniqueResult.data?.map(r => r.user_id).filter(Boolean)).size;
      
      return {
        today: todayResult.count || 0,
        yesterday: yesterdayResult.count || 0,
        week: weekResult.count || 0,
        uniqueUsers,
        change: todayResult.count && yesterdayResult.count 
          ? ((todayResult.count - yesterdayResult.count) / yesterdayResult.count * 100).toFixed(1)
          : 0
      };
    },
    staleTime: 60000,
  });

  const isLoading = loadingTopPages || loadingTrend;

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <BarChart3 className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Page Analytics</h1>
              <p className="text-muted-foreground text-sm">
                Track page views and identify optimization opportunities
              </p>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Today</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.today ?? '-'}</p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-400/50" />
                </div>
                {stats?.change !== 0 && (
                  <div className={`flex items-center gap-1 mt-2 text-xs ${Number(stats?.change) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {Number(stats?.change) > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {Math.abs(Number(stats?.change))}% vs yesterday
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.yesterday ?? '-'}</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-400/50" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Last 7 Days</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.week ?? '-'}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400/50" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Unique Users</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.uniqueUsers ?? '-'}</p>
                  </div>
                  <Users className="h-8 w-8 text-violet-400/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Daily Trend */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                  Daily Page Views (14 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Loading...
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyTrend}>
                        <defs>
                          <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))" 
                          fontSize={10}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))" 
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="views"
                          stroke="hsl(var(--primary))"
                          fill="url(#viewsGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Pages */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-violet-400" />
                  Top Pages (30 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Loading...
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topPages?.slice(0, 8)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
                        <XAxis type="number" fontSize={10} stroke="hsl(var(--muted-foreground))" />
                        <YAxis 
                          dataKey="route" 
                          type="category" 
                          fontSize={9} 
                          stroke="hsl(var(--muted-foreground))"
                          width={100}
                          tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + '...' : value}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Full Top Pages List */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">All Page Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topPages?.map((page, idx) => (
                  <motion.div
                    key={page.route}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <code className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                        {page.route}
                      </code>
                      <span className="text-sm text-muted-foreground hidden md:inline">
                        {page.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{page.count}</span>
                      <span className="text-xs text-muted-foreground">views</span>
                    </div>
                  </motion.div>
                ))}
                {!topPages?.length && !isLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    No page view data yet. Views will appear as users navigate the app.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
