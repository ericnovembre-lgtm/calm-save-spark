import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Minus, Calendar, Users, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface MetricComparison {
  metric: string;
  currentPeriod: {
    average: number;
    median: number;
    p95: number;
    samples: number;
  };
  previousPeriod: {
    average: number;
    median: number;
    p95: number;
    samples: number;
  };
  change: {
    average: number;
    median: number;
    p95: number;
    trend: 'up' | 'down' | 'stable';
  };
}

interface SegmentComparison {
  segment: string;
  metrics: {
    pageLoad: number;
    authCheck: number;
    heroLoad: number;
  };
  samples: number;
}

const METRIC_LABELS: Record<string, string> = {
  page_load: 'Page Load Time',
  auth_check: 'Auth Check Duration',
  hero_load: 'Hero Section Load',
  features_load: 'Features Section Load',
  stats_load: 'Stats Section Load',
};

/**
 * PerformanceComparisonView - Compare metrics across time periods and user segments
 */
export const PerformanceComparisonView = () => {
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('week');
  const [selectedMetric, setSelectedMetric] = useState<string>('page_load');

  // Mock data - in production, this would come from analytics backend
  const mockComparisons: MetricComparison[] = [
    {
      metric: 'page_load',
      currentPeriod: { average: 2800, median: 2500, p95: 3800, samples: 1250 },
      previousPeriod: { average: 3200, median: 2900, p95: 4200, samples: 1180 },
      change: { average: -12.5, median: -13.8, p95: -9.5, trend: 'down' },
    },
    {
      metric: 'auth_check',
      currentPeriod: { average: 450, median: 420, p95: 680, samples: 1250 },
      previousPeriod: { average: 520, median: 480, p95: 750, samples: 1180 },
      change: { average: -13.5, median: -12.5, p95: -9.3, trend: 'down' },
    },
    {
      metric: 'hero_load',
      currentPeriod: { average: 320, median: 280, p95: 520, samples: 1250 },
      previousPeriod: { average: 280, median: 250, p95: 480, samples: 1180 },
      change: { average: 14.3, median: 12.0, p95: 8.3, trend: 'up' },
    },
    {
      metric: 'features_load',
      currentPeriod: { average: 680, median: 620, p95: 980, samples: 1250 },
      previousPeriod: { average: 720, median: 650, p95: 1050, samples: 1180 },
      change: { average: -5.6, median: -4.6, p95: -6.7, trend: 'down' },
    },
  ];

  const mockSegments: SegmentComparison[] = [
    { segment: 'Desktop - Chrome', metrics: { pageLoad: 2200, authCheck: 380, heroLoad: 250 }, samples: 680 },
    { segment: 'Desktop - Firefox', metrics: { pageLoad: 2400, authCheck: 420, heroLoad: 280 }, samples: 320 },
    { segment: 'Mobile - Safari', metrics: { pageLoad: 3800, authCheck: 680, heroLoad: 520 }, samples: 180 },
    { segment: 'Mobile - Chrome', metrics: { pageLoad: 3200, authCheck: 550, heroLoad: 420 }, samples: 70 },
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatChange = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const formatMs = (ms: number) => {
    return `${Math.round(ms)}ms`;
  };

  return (
    <div className="space-y-6">
      {/* Time Period Selector */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Time Period Comparison</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timePeriod === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('day')}
            >
              Last 24h
            </Button>
            <Button
              variant={timePeriod === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('week')}
            >
              Last 7 days
            </Button>
            <Button
              variant={timePeriod === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('month')}
            >
              Last 30 days
            </Button>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metrics">Metrics Over Time</TabsTrigger>
          <TabsTrigger value="segments">User Segments</TabsTrigger>
        </TabsList>

        {/* Metrics Over Time */}
        <TabsContent value="metrics" className="space-y-4">
          {mockComparisons.map((comparison, index) => (
            <motion.div
              key={comparison.metric}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {METRIC_LABELS[comparison.metric] || comparison.metric}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Comparing {comparison.currentPeriod.samples} vs {comparison.previousPeriod.samples} samples
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(comparison.change.trend)}
                      <Badge
                        variant={comparison.change.trend === 'down' ? 'default' : 'destructive'}
                      >
                        {formatChange(comparison.change.average)}
                      </Badge>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Average */}
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Average</div>
                      <div className="text-2xl font-bold">
                        {formatMs(comparison.currentPeriod.average)}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          {formatMs(comparison.previousPeriod.average)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {formatChange(comparison.change.average)}
                        </Badge>
                      </div>
                    </div>

                    {/* Median */}
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Median</div>
                      <div className="text-2xl font-bold">
                        {formatMs(comparison.currentPeriod.median)}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          {formatMs(comparison.previousPeriod.median)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {formatChange(comparison.change.median)}
                        </Badge>
                      </div>
                    </div>

                    {/* P95 */}
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">95th Percentile</div>
                      <div className="text-2xl font-bold">
                        {formatMs(comparison.currentPeriod.p95)}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          {formatMs(comparison.previousPeriod.p95)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {formatChange(comparison.change.p95)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* User Segments */}
        <TabsContent value="segments" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Performance by User Segment</span>
            </div>

            <div className="space-y-3">
              {mockSegments.map((segment, index) => (
                <motion.div
                  key={segment.segment}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium">{segment.segment}</div>
                        <div className="text-xs text-muted-foreground">
                          {segment.samples} samples
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">Page Load</div>
                        <div className="font-semibold">{formatMs(segment.metrics.pageLoad)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Auth Check</div>
                        <div className="font-semibold">{formatMs(segment.metrics.authCheck)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Hero Load</div>
                        <div className="font-semibold">{formatMs(segment.metrics.heroLoad)}</div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Insights */}
          <Card className="p-4 bg-muted/50">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-1" />
              <div>
                <div className="font-medium mb-2">Performance Insights</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Mobile Safari users experience 72% slower page loads than desktop Chrome</li>
                  <li>• Auth check duration is consistent across all segments (~380-680ms)</li>
                  <li>• Desktop users have the best overall performance metrics</li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
