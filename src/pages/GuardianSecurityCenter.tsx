import { useMemo } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AegisShield } from "@/components/guardian/AegisShield";
import { SentinelSessionMap } from "@/components/guardian/SentinelSessionMap";
import { PrivacyPulseScanner } from "@/components/guardian/PrivacyPulseScanner";
import { PanicLockdown } from "@/components/guardian/PanicLockdown";
import { Shield, Activity, Eye, AlertTriangle, Lock, Smartphone, Globe, Key, Database, Loader2 } from "lucide-react";
import { useSecurityAuditLog } from '@/hooks/useSecurityAuditLog';
import { formatDistanceToNow } from 'date-fns';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSeedTestData } from '@/hooks/useSeedTestData';
import { toast } from 'sonner';
import { useUserSessions } from '@/hooks/useUserSessions';
import { useConnectedIntegrations } from '@/hooks/useConnectedIntegrations';

// Scanline background effect
function ScanlineOverlay() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]"
      style={{ 
        backgroundImage: `repeating-linear-gradient(
          0deg, 
          transparent, 
          transparent 2px, 
          hsl(var(--cyber-green) / 0.05) 2px, 
          hsl(var(--cyber-green) / 0.05) 4px
        )`
      }}
    />
  );
}

// Hexagonal pattern background
function HexPattern() {
  return (
    <svg 
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-[0.03]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="hex-pattern" width="56" height="100" patternUnits="userSpaceOnUse">
          <path 
            d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66ZM28 100L0 84L0 50L28 34L56 50L56 84L28 100Z" 
            fill="none" 
            stroke="hsl(var(--cyber-green))" 
            strokeWidth="0.3"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hex-pattern)" />
    </svg>
  );
}

// Gradient overlay for depth
function GradientOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-cyber-bg via-transparent to-slate-950/50" />
  );
}

// Security Log Card with real-time data
function SecurityLogCard({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const { data: securityEvents = [], isLoading, newEventIds } = useSecurityAuditLog(5);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-rose-400';
      case 'warning': return 'bg-amber-400';
      case 'success': return 'bg-emerald-400';
      default: return 'bg-white/40';
    }
  };

  return (
    <Card className="bg-cyber-surface/60 backdrop-blur-xl border-cyber-border p-5 h-full relative overflow-hidden">
      {/* Subtle corner glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <h3 className="text-sm font-mono text-cyber-green/70 uppercase tracking-widest mb-4 flex items-center gap-2 relative">
        <Activity className="w-4 h-4" />
        SECURITY LOG
        {newEventIds.length > 0 && (
          <span className="ml-auto px-2 py-0.5 text-[10px] font-mono bg-cyber-green/20 text-cyber-green rounded-full animate-pulse border border-cyber-green/30">
            {newEventIds.length} NEW
          </span>
        )}
      </h3>
      <div className="space-y-2 relative">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-cyber-green/40 animate-spin" />
          </div>
        ) : securityEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No security events recorded
          </div>
        ) : (
          securityEvents.map((event, i) => {
            const isNew = newEventIds.includes(event.id);
            return (
              <motion.div
                key={event.id}
                initial={prefersReducedMotion ? {} : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className={`flex items-start gap-3 p-2.5 rounded-lg transition-all ${
                  isNew 
                    ? 'bg-cyber-green/10 border border-cyber-green/20 shadow-[0_0_10px_hsl(var(--cyber-green)/0.1)]' 
                    : 'bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getSeverityColor(event.severity)} ${isNew ? 'animate-pulse shadow-lg' : ''}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground/90 truncate">{event.event_message}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </Card>
  );
}

// Security metric card
interface SecurityMetricProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
  delay?: number;
}

function SecurityMetric({ icon, label, value, status, delay = 0 }: SecurityMetricProps) {
  const prefersReducedMotion = useReducedMotion();
  const statusConfig = {
    good: {
      colors: 'text-cyber-green bg-cyber-green/10 border-cyber-green/20',
      glow: 'shadow-[0_0_15px_hsl(var(--cyber-green)/0.15)]'
    },
    warning: {
      colors: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      glow: 'shadow-[0_0_15px_hsl(45_100%_50%/0.15)]'
    },
    critical: {
      colors: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      glow: 'shadow-[0_0_15px_hsl(0_100%_50%/0.15)]'
    }
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`flex items-center gap-3 p-3.5 rounded-xl border backdrop-blur-sm transition-all hover:scale-[1.01] ${statusConfig[status].colors} ${statusConfig[status].glow}`}
    >
      <div className="p-2 rounded-lg bg-white/5 border border-white/5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{label}</p>
        <p className="text-sm font-semibold truncate mt-0.5">{value}</p>
      </div>
    </motion.div>
  );
}

// Security score calculation
function calculateSecurityScore(settings: {
  mfa_enabled: boolean;
  biometric_enabled: boolean;
  email_verified: boolean;
  password_strength: number;
}): number {
  let score = 30; // Base score
  if (settings.mfa_enabled) score += 30;
  if (settings.biometric_enabled) score += 15;
  if (settings.email_verified) score += 15;
  score += Math.min(settings.password_strength * 2, 10); // Up to 10 points for password strength
  return Math.min(score, 100);
}

export default function GuardianSecurityCenter() {
  const prefersReducedMotion = useReducedMotion();
  const { securitySettings } = useSettingsStore();
  const { data: sessions = [] } = useUserSessions();
  const { data: integrations = [] } = useConnectedIntegrations();
  const seedTestData = useSeedTestData();

  // Calculate dynamic counts
  const activeSessionCount = sessions.length;
  const connectedAppsCount = integrations.length;
  
  // Calculate apps requiring review (medium or high risk)
  const appsRequiringReview = integrations.filter(
    app => app.riskLevel === 'medium' || app.riskLevel === 'high'
  ).length;

  const handleSeedData = async () => {
    try {
      await seedTestData.mutateAsync();
      toast.success('Test data loaded', {
        description: '4 sessions and 5 security events created',
      });
    } catch (error) {
      toast.error('Failed to load test data');
    }
  };

  // Calculate security score from settings
  const securityScore = useMemo(() => 
    calculateSecurityScore({
      mfa_enabled: securitySettings.mfa_enabled,
      biometric_enabled: securitySettings.biometric_enabled,
      email_verified: securitySettings.email_verified,
      password_strength: securitySettings.password_strength
    }), 
    [securitySettings]
  );

  const staggerDelay = prefersReducedMotion ? 0 : 0.1;

  return (
    <AppLayout>
      <ErrorBoundary>
        {/* Cyber-physical background effects */}
        <div className="fixed inset-0 bg-cyber-bg -z-10" />
        <ScanlineOverlay />
        <HexPattern />
        <GradientOverlay />
        
        <div className="relative z-10 space-y-6 sm:space-y-8 p-4 sm:p-0">
          {/* Header */}
          <motion.div 
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h1 className="text-2xl sm:text-4xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyber-green/10 border border-cyber-green/20">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-cyber-green" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--cyber-green) / 0.5))' }} />
                </div>
                Guardian Security Center
              </h1>
              <p className="text-muted-foreground font-mono text-xs sm:text-sm tracking-wide">
                THREAT DEFENSE DASHBOARD • STATUS: <span className={securityScore >= 70 ? 'text-cyber-green' : securityScore >= 40 ? 'text-amber-400' : 'text-rose-400'}>{securityScore >= 70 ? 'SECURE' : securityScore >= 40 ? 'ATTENTION REQUIRED' : 'CRITICAL'}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSeedData}
                disabled={seedTestData.isPending}
                className="border-cyber-border bg-cyber-surface/50 hover:bg-cyber-surface text-muted-foreground font-mono text-xs"
              >
                <Database className="w-3 h-3 mr-1.5" />
                {seedTestData.isPending ? 'Loading...' : 'Load Test Data (Preview)'}
              </Button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-surface/50 border border-cyber-border">
                <div className={`w-2 h-2 rounded-full ${securityScore >= 70 ? 'bg-cyber-green' : securityScore >= 40 ? 'bg-amber-400' : 'bg-rose-400'} animate-pulse shadow-lg`} style={{ boxShadow: `0 0 10px ${securityScore >= 70 ? 'hsl(var(--cyber-green))' : securityScore >= 40 ? '#f59e0b' : '#ef4444'}` }} />
                <span className="text-xs font-mono text-cyber-green">MONITORING</span>
              </div>
            </div>
          </motion.div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Left Column - Shield Hero */}
            <motion.div 
              className="lg:col-span-1"
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="bg-cyber-surface/60 backdrop-blur-xl border-cyber-border p-6 h-full flex flex-col items-center justify-center relative overflow-hidden">
                {/* Ambient glow */}
                <div className="absolute inset-0 bg-gradient-radial from-cyber-green/5 via-transparent to-transparent" />
                
                <h2 className="text-sm font-mono text-cyber-green/70 uppercase tracking-widest mb-4 relative">
                  AEGIS SHIELD
                </h2>
                <AegisShield securityScore={securityScore} />
                <div className="mt-6 text-center relative">
                  <p className="text-4xl font-mono font-bold text-foreground">
                    {securityScore}
                    <span className="text-lg text-muted-foreground">/100</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono tracking-wider">SECURITY SCORE</p>
                </div>
              </Card>
            </motion.div>

            {/* Center Column - Security Metrics */}
            <motion.div 
              className="lg:col-span-1 space-y-4"
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="bg-cyber-surface/60 backdrop-blur-xl border-cyber-border p-5">
                <h3 className="text-sm font-mono text-cyber-green/70 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  SECURITY STATUS
                </h3>
                <div className="space-y-2.5">
                  <SecurityMetric
                    icon={<Key className="w-4 h-4" />}
                    label="Two-Factor Auth"
                    value={securitySettings.mfa_enabled ? 'Enabled' : 'Disabled'}
                    status={securitySettings.mfa_enabled ? 'good' : 'critical'}
                    delay={staggerDelay * 1}
                  />
                  <SecurityMetric
                    icon={<Smartphone className="w-4 h-4" />}
                    label="Biometric Lock"
                    value={securitySettings.biometric_enabled ? 'Active' : 'Inactive'}
                    status={securitySettings.biometric_enabled ? 'good' : 'warning'}
                    delay={staggerDelay * 2}
                  />
                  <SecurityMetric
                    icon={<Eye className="w-4 h-4" />}
                    label="Email Verified"
                    value={securitySettings.email_verified ? 'Verified' : 'Not Verified'}
                    status={securitySettings.email_verified ? 'good' : 'warning'}
                    delay={staggerDelay * 3}
                  />
                  <SecurityMetric
                    icon={<Globe className="w-4 h-4" />}
                    label="Active Sessions"
                    value={`${activeSessionCount} devices`}
                    status={activeSessionCount <= 3 ? 'good' : 'warning'}
                    delay={staggerDelay * 4}
                  />
                </div>
              </Card>

              <Card className="bg-cyber-surface/60 backdrop-blur-xl border-cyber-border p-5 relative overflow-hidden">
                {/* Subtle warning glow for apps needing review */}
                {appsRequiringReview > 0 && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                )}
                
                <h3 className="text-sm font-mono text-cyber-green/70 uppercase tracking-widest mb-4 flex items-center gap-2 relative">
                  <Lock className="w-4 h-4" />
                  CONNECTED APPS
                </h3>
                <div className="flex items-center justify-between relative">
                  <div>
                    <p className="text-3xl font-mono font-bold text-foreground">{connectedAppsCount}</p>
                    <p className="text-xs text-muted-foreground">Third-party integrations</p>
                  </div>
                  <div className={`p-3 rounded-xl transition-all ${appsRequiringReview > 0 ? 'bg-amber-500/10 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-cyber-green/10 border border-cyber-green/20 shadow-[0_0_15px_hsl(var(--cyber-green)/0.2)]'}`}>
                    {appsRequiringReview > 0 ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Lock className="w-5 h-5 text-cyber-green" />
                    )}
                  </div>
                </div>
                {appsRequiringReview > 0 ? (
                  <p className="text-xs text-amber-400 mt-3 font-mono">
                    {appsRequiringReview} app{appsRequiringReview !== 1 ? 's' : ''} require permission review
                  </p>
                ) : connectedAppsCount > 0 ? (
                  <p className="text-xs text-cyber-green mt-3 font-mono">
                    All apps have appropriate permissions
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-3 font-mono">
                    No third-party apps connected
                  </p>
                )}
              </Card>
            </motion.div>

            {/* Right Column - Recent Activity */}
            <motion.div 
              className="lg:col-span-1"
              initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <SecurityLogCard prefersReducedMotion={prefersReducedMotion} />
            </motion.div>
          </div>

          {/* Session Map & Privacy Pulse */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Sentinel Session Map */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Card className="bg-cyber-surface/60 backdrop-blur-xl border-cyber-border p-5 min-h-[340px] flex flex-col relative overflow-hidden">
                {/* Map glow effect */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-cyber-green/10 rounded-full blur-3xl" />
                
                <h3 className="text-sm font-mono text-cyber-green/70 uppercase tracking-widest mb-4 flex items-center gap-2 relative">
                  <Globe className="w-4 h-4" />
                  SENTINEL SESSION MAP
                </h3>
                <div className="flex-1 relative">
                  <SentinelSessionMap />
                </div>
              </Card>
            </motion.div>

            {/* Privacy Pulse Scanner */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Card className="bg-cyber-surface/60 backdrop-blur-xl border-cyber-border p-5 min-h-[340px] flex flex-col">
                <h3 className="text-sm font-mono text-cyber-green/70 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  PRIVACY PULSE SCANNER
                </h3>
                <div className="flex-1">
                  <PrivacyPulseScanner />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Panic Lockdown */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Card className="bg-rose-950/20 backdrop-blur-xl border-rose-500/30 p-6 relative overflow-hidden">
              {/* Danger glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-rose-500/5" />
              <PanicLockdown 
                onLockdown={() => {
                  toast.error('🚨 EMERGENCY LOCKDOWN ACTIVATED', {
                    description: 'All cards frozen. API access revoked.',
                    duration: 5000,
                  });
                }}
              />
            </Card>
          </motion.div>
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}
