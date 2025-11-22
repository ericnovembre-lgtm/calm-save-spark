import { AppLayout } from '@/components/layout/AppLayout';
import { SecurityHealthGauge } from '@/components/settings/SecurityHealthGauge';
import { ActiveSessions } from '@/components/security/ActiveSessions';
import { ConnectedAppsScanner } from '@/components/security/ConnectedAppsScanner';
import { PanicMode } from '@/components/security/PanicMode';
import { ThreatMonitor } from '@/components/security/ThreatMonitor';
import { SecurityEventLog } from '@/components/security/SecurityEventLog';
import { Shield, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function Security() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-cyber-bg via-background to-background">
        {/* Cyber grid background effect */}
        <div 
          className="fixed inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--cyber-border)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--cyber-border)) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
          aria-hidden="true"
        />

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Hero Header */}
          <motion.div 
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-cyber-surface/50 backdrop-blur-sm rounded-2xl border border-cyber-border">
                <Shield 
                  className="w-8 h-8 text-cyber-green" 
                  style={{ filter: 'drop-shadow(var(--cyber-glow-green))' }}
                />
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold text-foreground">
                  Security Command Center
                </h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Activity className="w-4 h-4 text-cyber-green animate-pulse" />
                  Real-time account protection
                </p>
              </div>
            </div>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Security Health & Panic Mode */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              <SecurityHealthGauge />
              <PanicMode />
            </motion.div>

            {/* Middle Column - Active Monitoring */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <ThreatMonitor />
              <ActiveSessions />
            </motion.div>

            {/* Right Column - Apps & Activity */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-6"
            >
              <ConnectedAppsScanner />
              <SecurityEventLog />
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
