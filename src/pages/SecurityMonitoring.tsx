import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, AlertTriangle, TrendingUp, Activity, Clock, Users } from "lucide-react";
import { LazyBarChart } from "@/components/charts/LazyBarChart";
import { LazyLineChart } from "@/components/charts/LazyLineChart";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";

export default function SecurityMonitoring() {
  // Fetch rate limit data
  const { data: rateLimits, isLoading: rateLimitsLoading } = useQuery({
    queryKey: ["rate-limits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("edge_function_rate_limits" as any)
        .select("*")
        .order("window_start", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as any;
    },
  });

  // Fetch validation failures
  const { data: validationFailures, isLoading: validationLoading } = useQuery({
    queryKey: ["validation-failures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_validation_failures" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as any;
    },
  });

  // Fetch error logs
  const { data: errorLogs, isLoading: errorsLoading } = useQuery({
    queryKey: ["error-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_error_logs" as any)
        .select("*")
        .order("last_seen_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as any;
    },
  });

  // Calculate metrics
  const metrics = {
    totalRateLimitHits: rateLimits?.length || 0,
    totalValidationFailures: validationFailures?.length || 0,
    totalErrors: errorLogs?.reduce((sum, log) => sum + log.request_count, 0) || 0,
    uniqueAffectedUsers: new Set([
      ...(validationFailures?.map(f => f.user_id).filter(Boolean) || []),
      ...(errorLogs?.map(e => e.user_id).filter(Boolean) || []),
    ]).size,
  };

  // Rate limit data by function
  const rateLimitsByFunction = rateLimits?.reduce((acc: Record<string, number>, limit) => {
    acc[limit.function_name] = (acc[limit.function_name] || 0) + limit.call_count;
    return acc;
  }, {});

  // Validation failures by type
  const validationFailuresByType = validationFailures?.reduce((acc: Record<string, number>, failure) => {
    acc[failure.failure_type] = (acc[failure.failure_type] || 0) + 1;
    return acc;
  }, {});

  // Error patterns by function
  const errorsByFunction = errorLogs?.reduce((acc: Record<string, number>, error) => {
    acc[error.function_name] = (acc[error.function_name] || 0) + error.request_count;
    return acc;
  }, {});

  const isLoading = rateLimitsLoading || validationLoading || errorsLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Security Monitoring</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-24" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Security Monitoring</h1>
            <p className="text-muted-foreground">
              Real-time security metrics and threat detection
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Rate Limit Hits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRateLimitHits}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Validation Failures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {metrics.totalValidationFailures}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.totalErrors}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Affected Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uniqueAffectedUsers}</div>
            <p className="text-xs text-muted-foreground">Unique users</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rate-limits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
          <TabsTrigger value="validation">Validation Failures</TabsTrigger>
          <TabsTrigger value="errors">Error Patterns</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Rate Limits Tab */}
        <TabsContent value="rate-limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limit Usage by Function</CardTitle>
              <CardDescription>
                API call volumes across protected endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rateLimitsByFunction && Object.keys(rateLimitsByFunction).length > 0 ? (
                <LazyBarChart
                  data={Object.entries(rateLimitsByFunction).map(([name, calls]) => ({
                    name,
                    calls,
                  }))}
                  dataKey="calls"
                  xAxisKey="name"
                  title="API Calls by Function"
                />
              ) : (
                <Alert>
                  <AlertDescription>No rate limit data available</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Rate Limit Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Function</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Calls</TableHead>
                    <TableHead>Window Start</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rateLimits?.slice(0, 10).map((limit) => (
                    <TableRow key={limit.id}>
                      <TableCell className="font-mono text-sm">
                        {limit.function_name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {limit.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant={limit.call_count > 40 ? "destructive" : "secondary"}>
                          {limit.call_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(limit.window_start), "MMM d, HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Failures Tab */}
        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Validation Failures by Type</CardTitle>
              <CardDescription>
                Common input validation issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              {validationFailuresByType && Object.keys(validationFailuresByType).length > 0 ? (
                <LazyBarChart
                  data={Object.entries(validationFailuresByType).map(([type, count]) => ({
                    type,
                    count,
                  }))}
                  dataKey="count"
                  xAxisKey="type"
                  title="Failures by Type"
                />
              ) : (
                <Alert>
                  <AlertDescription>No validation failures recorded</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Validation Failures</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Function</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationFailures?.slice(0, 10).map((failure) => (
                    <TableRow key={failure.id}>
                      <TableCell className="font-mono text-sm">
                        {failure.function_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{failure.failure_type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {failure.field_name || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {failure.error_message}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(failure.created_at), "MMM d, HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Error Patterns Tab */}
        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Errors by Function</CardTitle>
              <CardDescription>
                Error distribution across edge functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorsByFunction && Object.keys(errorsByFunction).length > 0 ? (
                <LazyBarChart
                  data={Object.entries(errorsByFunction).map(([name, count]) => ({
                    name,
                    count,
                  }))}
                  dataKey="count"
                  xAxisKey="name"
                  title="Errors by Function"
                />
              ) : (
                <Alert>
                  <AlertDescription>No error patterns detected</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Error Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Function</TableHead>
                    <TableHead>Error Type</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>First Seen</TableHead>
                    <TableHead>Last Seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errorLogs?.slice(0, 10).map((error) => (
                    <TableRow key={error.id}>
                      <TableCell className="font-mono text-sm">
                        {error.function_name}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            error.error_type === 'auth_failure' ? 'destructive' :
                            error.error_type === 'rate_limit' ? 'secondary' :
                            'outline'
                          }
                        >
                          {error.error_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{error.request_count}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(error.first_seen_at), "MMM d, HH:mm")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(error.last_seen_at), "MMM d, HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Events Timeline</CardTitle>
              <CardDescription>
                Combined view of all security-related events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {[
                  ...(validationFailures?.slice(0, 5).map(f => ({
                    type: 'validation',
                    time: f.created_at,
                    message: `Validation failure in ${f.function_name}: ${f.error_message}`,
                  })) || []),
                  ...(errorLogs?.slice(0, 5).map(e => ({
                    type: 'error',
                    time: e.last_seen_at,
                    message: `${e.error_type} in ${e.function_name} (${e.request_count}x)`,
                  })) || []),
                ]
                  .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                  .slice(0, 20)
                  .map((event, i) => (
                    <div key={i} className="flex items-start gap-3 border-l-2 border-muted pl-4 pb-4">
                      <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={event.type === 'error' ? 'destructive' : 'secondary'}>
                            {event.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(event.time), "MMM d, yyyy HH:mm:ss")}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{event.message}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AppLayout>
  );
}
