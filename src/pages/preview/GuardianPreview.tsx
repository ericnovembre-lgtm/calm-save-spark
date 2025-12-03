/**
 * GuardianPreview - Preview version of Guardian Security Center
 * Uses mock data for visual debugging without authentication
 */

import { useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AegisShield } from "@/components/guardian/AegisShield";
import { SentinelSessionMap } from "@/components/guardian/SentinelSessionMap";
import { PanicLockdown } from "@/components/guardian/PanicLockdown";
import { Shield, Activity, Eye, AlertTriangle, Lock, Smartphone, Globe, Key, Database } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { PreviewWrapper } from '@/components/debug/PreviewWrapper';
import { 
  useMockUserSessions, 
  useMockSecurityEvents, 
  useMockConnectedIntegrations,
  useMockSecuritySettings,
  type MockSession 
} from '@/hooks/useMockData';

// Scanline background effect
function ScanlineOverlay() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 opacity-[0.015]"
      style={{ 
        backgroundImage: `repeating-linear-gradient(
          0deg, 
          transparent, 
          transparent 2px, 
          rgba(255,255,255,0.03) 2px, 
          rgba(255,255,255,0.03) 4px
        )`
      }}
    />
  );
}

// Hexagonal pattern background
function HexPattern() {
  return (
    <svg 
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-[0.02]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="hex-pattern-preview" width="56" height="100" patternUnits="userSpaceOnUse">
          <path 
            d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66ZM28 100L0 84L0 50L28 34L56 50L56 84L28 100Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hex-pattern-preview)" />
    </svg>
  );
}

// Security Log Card with mock data
function SecurityLogCard() {
  const { data: securityEvents, newEventIds } = useMockSecurityEvents();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-rose-400';
      case 'warning': return 'bg-amber-400';
      case 'success': return 'bg-emerald-400';
      default: return 'bg-white/40';
    }
  };

  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 p-5 h-full">
      <h3 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4" />
        SECURITY LOG
        {newEventIds.length > 0 && (
          <span className="ml-auto px-1.5 py-0.5 text-[10px] font-mono bg-cyan-500/20 text-cyan-400 rounded-full animate-pulse">
            {newEventIds.length} NEW
          </span>
        )}
      </h3>
      <div className="space-y-3">
        {securityEvents.map((event, i) => {
          const isNew = newEventIds.includes(event.id);
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                isNew 
                  ? 'bg-cyan-500/10 border border-cyan-500/20' 
                  : 'bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${getSeverityColor(event.severity)} ${isNew ? 'animate-pulse' : ''}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 truncate">{event.event_message}</p>
                <p className="text-xs text-white/30 font-mono">
                  {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                </p>
              </div>
            </motion.div>
          );
        })}
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
  const statusColors = {
    good: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    critical: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`flex items-center gap-3 p-3 rounded-lg border backdrop-blur-sm ${statusColors[status]}`}
    >
      <div className="p-2 rounded-md bg-white/5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/50 font-mono uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold truncate">{value}</p>
      </div>
    </motion.div>
  );
}

// Mock Privacy Pulse Scanner
function MockPrivacyPulseScanner() {
  const { data: integrations } = useMockConnectedIntegrations();

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-3">
      {integrations.map((integration, i) => (
        <motion.div
          key={integration.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * i }}
          className={`p-3 rounded-lg border ${getRiskColor(integration.riskLevel)}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">{integration.name}</span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5">
              {integration.riskLevel} risk
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {integration.permissions.map(perm => (
              <span 
                key={perm} 
                className="text-[10px] font-mono px-1.5 py-0.5 bg-white/5 rounded text-white/50"
              >
                {perm}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Security score calculation
function calculateSecurityScore(settings: {
  mfa_enabled: boolean;
  biometric_enabled: boolean;
  email_verified: boolean;
  password_strength: number;
}): number {
  let score = 30;
  if (settings.mfa_enabled) score += 30;
  if (settings.biometric_enabled) score += 15;
  if (settings.email_verified) score += 15;
  score += Math.min(settings.password_strength * 2, 10);
  return Math.min(score, 100);
}

export default function GuardianPreview() {
  const { data: sessions } = useMockUserSessions();
  const { data: integrations } = useMockConnectedIntegrations();
  const securitySettings = useMockSecuritySettings();

  const activeSessionCount = sessions.length;
  const connectedAppsCount = integrations.length;
  const appsRequiringReview = integrations.filter(
    app => app.riskLevel === 'medium' || app.riskLevel === 'high'
  ).length;

  const securityScore = useMemo(() => 
    calculateSecurityScore(securitySettings), 
    [securitySettings]
  );

  const staggerDelay = 0.1;

  return (
    <PreviewWrapper pageName="Guardian Security Center">
      {/* Cyber-physical background effects */}
      <div className="fixed inset-0 bg-slate-950 -z-10" />
      <ScanlineOverlay />
      <HexPattern />
      
      <div className="relative z-10 space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-emerald-400" />
              Guardian Security Center
            </h1>
            <p className="text-white/50 font-mono text-sm">
              THREAT DEFENSE DASHBOARD • STATUS: {securityScore >= 70 ? 'SECURE' : securityScore >= 40 ? 'ATTENTION REQUIRED' : 'CRITICAL'}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="border-white/10 bg-slate-800/50 text-white/70 font-mono text-xs"
            >
              <Database className="w-3 h-3 mr-1.5" />
              Load Test Data (Preview)
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-white/10">
              <div className={`w-2 h-2 rounded-full ${securityScore >= 70 ? 'bg-emerald-400' : securityScore >= 40 ? 'bg-amber-400' : 'bg-rose-400'} animate-pulse`} />
              <span className="text-xs font-mono text-white/70">MONITORING</span>
            </div>
          </div>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Shield Hero */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 p-6 h-full flex flex-col items-center justify-center">
              <h2 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-4">
                AEGIS SHIELD
              </h2>
              <AegisShield securityScore={securityScore} />
              <div className="mt-6 text-center">
                <p className="text-4xl font-mono font-bold text-white">
                  {securityScore}
                  <span className="text-lg text-white/40">/100</span>
                </p>
                <p className="text-xs text-white/40 mt-1">SECURITY SCORE</p>
              </div>
            </Card>
          </motion.div>

          {/* Center Column - Security Metrics */}
          <motion.div 
            className="lg:col-span-1 space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 p-5">
              <h3 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                SECURITY STATUS
              </h3>
              <div className="space-y-3">
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

            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 p-5">
              <h3 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                CONNECTED APPS
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-mono font-bold text-white">{connectedAppsCount}</p>
                  <p className="text-xs text-white/40">Third-party integrations</p>
                </div>
                <div className={`p-3 rounded-lg ${appsRequiringReview > 0 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
                  {appsRequiringReview > 0 ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
              </div>
              {appsRequiringReview > 0 && (
                <p className="text-xs text-amber-400/80 mt-3 font-mono">
                  {appsRequiringReview} app{appsRequiringReview !== 1 ? 's' : ''} require permission review
                </p>
              )}
            </Card>
          </motion.div>

          {/* Right Column - Recent Activity */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <SecurityLogCard />
          </motion.div>
        </div>

        {/* Session Map & Privacy Pulse */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sentinel Session Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 p-5 min-h-[340px] flex flex-col">
              <h3 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                SENTINEL SESSION MAP
              </h3>
              <div className="flex-1 relative">
                <SentinelSessionMap sessions={sessions} previewMode />
              </div>
            </Card>
          </motion.div>

          {/* Privacy Pulse Scanner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 p-5 min-h-[340px] flex flex-col">
              <h3 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                PRIVACY PULSE SCANNER
              </h3>
              <div className="flex-1">
                <MockPrivacyPulseScanner />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Panic Lockdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Card className="bg-rose-950/30 backdrop-blur-xl border-rose-500/20 p-6">
            <PanicLockdown previewMode />
          </Card>
        </motion.div>
      </div>
    </PreviewWrapper>
  );
}
