import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import CountUp from 'react-countup';

export function ThreatMonitor() {
  const prefersReducedMotion = useReducedMotion();
  const threatsBlocked = 247;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-cyber-border overflow-hidden relative">
      {/* Animated scan line effect */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-green to-transparent opacity-50"
          initial={{ y: 0 }}
          animate={{ y: 300 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
          aria-hidden="true"
        />
      )}

      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <motion.div 
            className="p-2 bg-cyber-green/20 rounded-lg"
            animate={prefersReducedMotion ? {} : {
              boxShadow: [
                'var(--cyber-glow-green)',
                '0 0 16px hsla(160, 84%, 39%, 0.8)',
                'var(--cyber-glow-green)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Shield 
              className="w-5 h-5 text-cyber-green"
              style={{ filter: 'drop-shadow(var(--cyber-glow-green))' }}
            />
          </motion.div>
          <span>Threat Monitor</span>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <motion.span
            className="inline-block w-2 h-2 bg-cyber-green rounded-full"
            animate={prefersReducedMotion ? {} : {
              opacity: [1, 0.3, 1],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          Scanning for threats...
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Threats Blocked Counter */}
        <div className="text-center py-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Threats Blocked Today</p>
            <motion.div
              initial={prefersReducedMotion ? {} : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="text-5xl font-display font-bold text-cyber-green"
              style={{ textShadow: 'var(--cyber-glow-green)' }}
            >
              <CountUp end={threatsBlocked} duration={2} />
            </motion.div>
          </div>
        </div>

        {/* Mini Sparkline Chart (Simplified) */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Last 24 hours</p>
          <div className="flex items-end justify-between gap-1 h-16">
            {[32, 45, 28, 51, 38, 42, 35, 48, 52, 47, 50, 49].map((value, i) => (
              <motion.div
                key={i}
                initial={prefersReducedMotion ? {} : { height: 0 }}
                animate={{ height: `${(value / 52) * 100}%` }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex-1 bg-cyber-green/30 rounded-t"
              />
            ))}
          </div>
        </div>

        {/* Status indicators */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-cyber-green/10 border border-cyber-green/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Login Attempts</p>
            <p className="text-lg font-bold text-cyber-green flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              0
            </p>
          </div>
          <div className="p-3 bg-cyber-green/10 border border-cyber-green/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Suspicious IPs</p>
            <p className="text-lg font-bold text-cyber-green">0</p>
          </div>
        </div>

        {/* Status message */}
        <div className="p-3 bg-cyber-green/10 border border-cyber-green/30 rounded-lg">
          <p className="text-sm font-medium text-cyber-green">All Systems Secure</p>
          <p className="text-xs text-muted-foreground mt-1">
            No suspicious activity detected in the last 24 hours
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
