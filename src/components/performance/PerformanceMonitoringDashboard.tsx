import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Activity, Clock, Zap, AlertCircle, TrendingUp, Database } from "lucide-react";
import { motion } from "framer-motion";

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'poor';
  threshold: { good: number; warning: number };
}

interface ComponentLoadMetric {
  name: string;
  loadTime: number;
  retries: number;
  status: 'success' | 'failed' | 'timeout';
  timestamp: string;
}

interface WelcomePageMetrics {
  pageLoadTime: number;
  authCheckDuration: number;
  heroLoadTime: number;
  featuresLoadTime: number;
  statsLoadTime: number;
  ctaLoadTime: number;
  totalComponentCount: number;
  failedComponents: number;
  componentMetrics: ComponentLoadMetric[];
}

/**
 * PerformanceMonitoringDashboard - Real-time performance tracking for Welcome page
 * Tracks load times, auth checks, and component render metrics
 */
export const PerformanceMonitoringDashboard = () => {
  const [metrics, setMetrics] = useState<WelcomePageMetrics>({
    pageLoadTime: 0,
    authCheckDuration: 0,
    heroLoadTime: 0,
    featuresLoadTime: 0,
    statsLoadTime: 0,
    ctaLoadTime: 0,
    totalComponentCount: 0,
    failedComponents: 0,
    componentMetrics: [],
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Listen to performance events from various components
    const handlePerformanceEvent = (event: CustomEvent) => {
      const { metric, value, component } = event.detail;

      setMetrics((prev) => {
        const updated = { ...prev };

        switch (metric) {
          case 'page_load':
            updated.pageLoadTime = value;
            break;
          case 'auth_check':
            updated.authCheckDuration = value;
            break;
          case 'hero_load':
            updated.heroLoadTime = value;
            break;
          case 'features_load':
            updated.featuresLoadTime = value;
            break;
          case 'stats_load':
            updated.statsLoadTime = value;
            break;
          case 'cta_load':
            updated.ctaLoadTime = value;
            break;
          case 'component_load':
            updated.totalComponentCount++;
            updated.componentMetrics.push({
              name: component,
              loadTime: value,
              retries: event.detail.retries || 0,
              status: event.detail.status || 'success',
              timestamp: new Date().toISOString(),
            });
            if (event.detail.status === 'failed') {
              updated.failedComponents++;
            }
            break;
        }

        return updated;
      });
    };

    window.addEventListener('performance_metric' as any, handlePerformanceEvent);

    // Capture Web Vitals
    if ('performance' in window && 'getEntriesByType' in window.performance) {
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationTiming) {
        setMetrics((prev) => ({
          ...prev,
          pageLoadTime: navigationTiming.loadEventEnd - navigationTiming.fetchStart,
        }));
      }
    }

    return () => {
      window.removeEventListener('performance_metric' as any, handlePerformanceEvent);
    };
  }, []);

  const getMetricStatus = (value: number, good: number, warning: number): 'good' | 'warning' | 'poor' => {
    if (value <= good) return 'good';
    if (value <= warning) return 'warning';
    return 'poor';
  };

  const performanceMetrics: PerformanceMetric[] = [
    {
      name: 'Page Load',
      value: metrics.pageLoadTime,
      unit: 'ms',
      status: getMetricStatus(metrics.pageLoadTime, 2000, 4000),
      threshold: { good: 2000, warning: 4000 },
    },
    {
      name: 'Auth Check',
      value: metrics.authCheckDuration,
      unit: 'ms',
      status: getMetricStatus(metrics.authCheckDuration, 500, 1500),
      threshold: { good: 500, warning: 1500 },
    },
    {
      name: 'Hero Load',
      value: metrics.heroLoadTime,
      unit: 'ms',
      status: getMetricStatus(metrics.heroLoadTime, 300, 1000),
      threshold: { good: 300, warning: 1000 },
    },
    {
      name: 'Features Load',
      value: metrics.featuresLoadTime,
      unit: 'ms',
      status: getMetricStatus(metrics.featuresLoadTime, 500, 1500),
      threshold: { good: 500, warning: 1500 },
    },
  ];

  const getStatusColor = (status: 'good' | 'warning' | 'poor') => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'poor') => {
    switch (status) {
      case 'good':
        return <Zap className="w-4 h-4" />;
      case 'warning':
        return <Clock className="w-4 h-4" />;
      case 'poor':
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 left-4 z-50 bg-background/80 backdrop-blur-sm"
        >
          <Activity className="w-4 h-4 mr-2" />
          Performance
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Welcome Page Performance Metrics
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {metrics.totalComponentCount}
              </div>
              <div className="text-xs text-muted-foreground">Components Loaded</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {metrics.failedComponents}
              </div>
              <div className="text-xs text-muted-foreground">Failed Loads</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {Math.round(metrics.pageLoadTime)}ms
              </div>
              <div className="text-xs text-muted-foreground">Total Load Time</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {Math.round(metrics.authCheckDuration)}ms
              </div>
              <div className="text-xs text-muted-foreground">Auth Duration</div>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Key Performance Indicators
            </h3>
            {performanceMetrics.map((metric) => (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(metric.status)}>
                        {getStatusIcon(metric.status)}
                      </Badge>
                      <div>
                        <div className="font-medium text-foreground">{metric.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Target: &lt;{metric.threshold.good}ms (Good) | &lt;
                          {metric.threshold.warning}ms (Warning)
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-foreground">
                        {Math.round(metric.value)}
                        <span className="text-sm text-muted-foreground ml-1">{metric.unit}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Component Load Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Database className="w-4 h-4" />
              Component Load Timeline
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {metrics.componentMetrics.map((component, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          component.status === 'success'
                            ? 'default'
                            : component.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {component.status}
                      </Badge>
                      <span className="font-medium text-foreground">{component.name}</span>
                      {component.retries > 0 && (
                        <span className="text-muted-foreground">({component.retries} retries)</span>
                      )}
                    </div>
                    <div className="text-muted-foreground">
                      {Math.round(component.loadTime)}ms
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
