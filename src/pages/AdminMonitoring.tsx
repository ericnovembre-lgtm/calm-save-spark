import { AdminNotificationCenter } from "@/components/admin/AdminNotificationCenter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

export default function AdminMonitoring() {
  const { data: recentMetrics } = useQuery({
    queryKey: ['recent-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: activeBreaches } = useQuery({
    queryKey: ['active-breaches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('slo_breaches')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: recentIncidents } = useQuery({
    queryKey: ['recent-incidents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incident_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });

  const healthyMetrics = recentMetrics?.filter(m => m.status === 'healthy').length || 0;
  const totalMetrics = recentMetrics?.length || 0;
  const healthPercentage = totalMetrics > 0 ? Math.round((healthyMetrics / totalMetrics) * 100) : 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">System Monitoring</h1>
        <p className="text-muted-foreground">
          Real-time monitoring powered by Athena, Aegis, and Hephaestus
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {healthyMetrics} of {totalMetrics} metrics healthy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Breaches</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBreaches?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents (24h)</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentIncidents?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Auto-resolved by Hephaestus
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AdminNotificationCenter />

        <Card>
          <CardHeader>
            <CardTitle>Recent Performance Metrics</CardTitle>
            <CardDescription>Last hour of monitoring data</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMetrics && recentMetrics.length > 0 ? (
              <div className="space-y-2">
                {recentMetrics.slice(0, 5).map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`h-4 w-4 ${
                        metric.status === 'healthy' ? 'text-green-500' :
                        metric.status === 'warning' ? 'text-yellow-500' :
                        'text-red-500'
                      }`} />
                      <span className="font-medium">{metric.metric_name}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-mono">{Math.round(metric.metric_value)}</span>
                      <span className="text-muted-foreground ml-1">
                        / {metric.threshold_value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No metrics collected yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {activeBreaches && activeBreaches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Active SLO Breaches
            </CardTitle>
            <CardDescription>Issues currently being monitored</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeBreaches.map((breach) => (
                <div key={breach.id} className="p-3 rounded border border-red-200 bg-red-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{breach.metric_name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      breach.severity === 'critical' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-yellow-500 text-white'
                    }`}>
                      {breach.severity}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Current: {breach.current_value} / Threshold: {breach.threshold_value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
