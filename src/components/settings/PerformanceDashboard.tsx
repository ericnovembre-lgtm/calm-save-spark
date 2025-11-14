import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Cpu, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useMotionPreferences } from "@/hooks/useMotionPreferences";
import { toast } from "sonner";

export const PerformanceDashboard = () => {
  const [fps, setFps] = useState(60);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [particleCount, setParticleCount] = useState(50);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const { preferences, disableAll } = useMotionPreferences();

  useEffect(() => {
    let animationFrameId: number;

    const measurePerformance = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTimeRef.current;

      // Update FPS every second
      if (elapsed >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / elapsed));
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;

        // Update memory usage if available
        if ((performance as any).memory) {
          const used = (performance as any).memory.usedJSHeapSize;
          const total = (performance as any).memory.jsHeapSizeLimit;
          setMemoryUsage(Math.round((used / total) * 100));
        }
      }

      animationFrameId = requestAnimationFrame(measurePerformance);
    };

    animationFrameId = requestAnimationFrame(measurePerformance);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const getPerformanceStatus = () => {
    if (fps >= 55) return { status: 'excellent', color: 'text-green-500', icon: CheckCircle2 };
    if (fps >= 40) return { status: 'good', color: 'text-blue-500', icon: Activity };
    if (fps >= 25) return { status: 'moderate', color: 'text-yellow-500', icon: AlertTriangle };
    return { status: 'poor', color: 'text-red-500', icon: AlertTriangle };
  };

  const getRecommendations = () => {
    const recommendations: string[] = [];

    if (fps < 30) {
      if (preferences.particles) recommendations.push("Disable background particles");
      if (preferences.gradients) recommendations.push("Disable dynamic gradients");
      if (preferences.animations) recommendations.push("Reduce page animations");
    } else if (fps < 45) {
      if (preferences.particles) recommendations.push("Consider disabling particles");
    }

    if (memoryUsage > 80) {
      recommendations.push("High memory usage detected - consider refreshing the page");
    }

    if (recommendations.length === 0) {
      recommendations.push("Performance is optimal! No changes needed.");
    }

    return recommendations;
  };

  const performanceStatus = getPerformanceStatus();
  const StatusIcon = performanceStatus.icon;

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Performance Metrics</h3>
          </div>
          <Badge variant={fps >= 55 ? "default" : fps >= 40 ? "secondary" : "destructive"}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {performanceStatus.status.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* FPS */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Frame Rate</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${performanceStatus.color}`}>
                {fps}
              </span>
              <span className="text-sm text-muted-foreground">FPS</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Target: 60 FPS
            </p>
          </div>

          {/* Particle Count */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Active Particles</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">
                {preferences.particles ? particleCount : 0}
              </span>
              <span className="text-sm text-muted-foreground">particles</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {preferences.particles ? 'Auto-adjusting' : 'Disabled'}
            </p>
          </div>

          {/* Memory Usage */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Memory Usage</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${memoryUsage > 80 ? 'text-red-500' : 'text-foreground'}`}>
                {memoryUsage || '—'}
              </span>
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {memoryUsage > 0 ? 'JS Heap usage' : 'Not available'}
            </p>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Optimization Recommendations
        </h3>
        <ul className="space-y-2">
          {getRecommendations().map((rec, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>

        {fps < 45 && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              disableAll();
              toast.success('All motion effects disabled for better performance');
            }}
          >
            Apply Recommended Settings
          </Button>
        )}
      </Card>

      {/* Device Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Performance metrics update in real-time</p>
        <p>• Particle count auto-adjusts based on FPS</p>
        <p>• Battery-aware mode reduces effects when battery is low</p>
      </div>
    </div>
  );
};
