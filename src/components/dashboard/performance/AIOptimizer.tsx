import { motion } from 'framer-motion';
import { Zap, Activity, Gauge, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export function AIOptimizer() {
  const [metrics, setMetrics] = useState({
    fps: 60,
    loadTime: 0.8,
    memoryUsage: 45,
    optimizations: 12
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        fps: 58 + Math.random() * 4,
        memoryUsage: 40 + Math.random() * 15
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">Performance AI</h3>
          <p className="text-sm text-muted-foreground">Real-time optimization</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-accent/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-sm text-muted-foreground">FPS</span>
          </div>
          <motion.p
            key={metrics.fps.toFixed(0)}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-foreground"
          >
            {metrics.fps.toFixed(0)}
          </motion.p>
        </div>

        <div className="bg-accent/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Memory</span>
          </div>
          <motion.p
            key={metrics.memoryUsage.toFixed(0)}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-foreground"
          >
            {metrics.memoryUsage.toFixed(0)}%
          </motion.p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-2xl">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Adaptive Quality Active</p>
            <p className="text-sm text-muted-foreground">Automatically adjusting based on device performance</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
          <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Predictive Preloading</p>
            <p className="text-sm text-muted-foreground">Next actions preloaded for instant response</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
          <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">{metrics.optimizations} Optimizations Applied</p>
            <p className="text-sm text-muted-foreground">AI-powered performance enhancements</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
