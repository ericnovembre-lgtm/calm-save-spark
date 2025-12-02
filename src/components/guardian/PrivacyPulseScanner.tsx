import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Link2Off, Loader2, Scan, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { haptics } from '@/lib/haptics';
import { soundEffects } from '@/lib/sound-effects';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useConnectedIntegrations, useSeverIntegration, ConnectedIntegration } from '@/hooks/useConnectedIntegrations';

interface EnrichedIntegration extends ConnectedIntegration {
  aiWarning?: string;
  riskLevel?: 'low' | 'medium' | 'high';
}

// Translate permissions using AI
async function translatePermissions(app: ConnectedIntegration): Promise<{ warning: string; riskLevel: 'low' | 'medium' | 'high' }> {
  try {
    const { data, error } = await supabase.functions.invoke('translate-permissions', {
      body: { 
        appName: app.name, 
        permissions: app.permissions 
      }
    });
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error translating permissions:', err);
    // Fallback to simple translation
    const riskLevel = app.permissions.length > 3 ? 'high' : app.permissions.length > 2 ? 'medium' : 'low';
    return {
      warning: `${app.name} has access to ${app.permissions.length} permissions including ${app.permissions.slice(0, 2).join(', ')}.`,
      riskLevel,
    };
  }
}

// Connected app card
function AppCard({ 
  app, 
  onSever,
  isScanning,
  isSevering,
}: { 
  app: EnrichedIntegration; 
  onSever: (id: string, provider: string) => void;
  isScanning: boolean;
  isSevering: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();

  const handleSever = async () => {
    haptics.vibrate('heavy');
    soundEffects.error();
    onSever(app.id, app.provider);
  };

  const riskColors = {
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const formatLastAccess = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 5) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } catch {
      return 'Unknown';
    }
  };

  return (
    <motion.div
      layout
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? {} : { 
        opacity: 0, 
        x: -100,
        scale: 0.8,
        transition: { duration: 0.3 }
      }}
      className="p-4 rounded-lg bg-slate-800/30 border border-white/5 hover:border-white/10 transition-colors"
    >
      <div className="flex items-start gap-3">
        {/* App Icon */}
        <div className="text-2xl w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
          {app.icon}
        </div>
        
        {/* App Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-white">{app.name}</h4>
            {app.riskLevel && (
              <Badge 
                variant="outline" 
                className={`text-[10px] uppercase font-mono ${riskColors[app.riskLevel]}`}
              >
                {app.riskLevel} risk
              </Badge>
            )}
          </div>
          
          {/* AI Warning */}
          {isScanning ? (
            <div className="flex items-center gap-2 text-sm text-white/40">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="font-mono">Analyzing permissions...</span>
            </div>
          ) : app.aiWarning ? (
            <p className="text-sm text-white/60 leading-relaxed">
              {app.aiWarning}
            </p>
          ) : (
            <p className="text-xs text-white/40 font-mono">
              {app.permissions.length} permissions • Last access: {formatLastAccess(app.lastAccess)}
            </p>
          )}
        </div>
        
        {/* Sever Button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          onClick={handleSever}
          disabled={isSevering}
        >
          <AnimatePresence mode="wait">
            {isSevering ? (
              <motion.div
                key="severing"
                initial={prefersReducedMotion ? {} : { scale: 1, rotate: 0 }}
                animate={prefersReducedMotion ? {} : { 
                  scale: [1, 1.2, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{ duration: 0.5 }}
              >
                <Link2Off className="w-4 h-4" />
              </motion.div>
            ) : (
              <motion.div key="sever">
                <Link2Off className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </motion.div>
  );
}

export function PrivacyPulseScanner() {
  const { data: integrations = [], isLoading } = useConnectedIntegrations();
  const severMutation = useSeverIntegration();
  const [enrichedApps, setEnrichedApps] = useState<EnrichedIntegration[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Update enriched apps when integrations change
  useEffect(() => {
    if (integrations.length > 0 && !hasScanned) {
      setEnrichedApps(integrations);
      runScan();
    } else if (integrations.length === 0) {
      setEnrichedApps([]);
    }
  }, [integrations]);

  const runScan = async () => {
    if (integrations.length === 0) return;
    
    setIsScanning(true);
    soundEffects.click();
    
    // Translate permissions for each app
    const updatedApps = await Promise.all(
      integrations.map(async (app) => {
        const result = await translatePermissions(app);
        return {
          ...app,
          aiWarning: result.warning,
          riskLevel: result.riskLevel,
        };
      })
    );
    
    setEnrichedApps(updatedApps);
    setIsScanning(false);
    setHasScanned(true);
    soundEffects.success();
  };

  const handleSever = async (id: string, provider: string) => {
    const app = enrichedApps.find(a => a.id === id);
    await severMutation.mutateAsync({ id, provider, name: app?.name });
    setEnrichedApps(prev => prev.filter(app => app.id !== id));
    toast.success('Connection severed');
  };

  const highRiskCount = enrichedApps.filter(a => a.riskLevel === 'high').length;
  const mediumRiskCount = enrichedApps.filter(a => a.riskLevel === 'medium').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Scan Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasScanned ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <Scan className="w-4 h-4 text-white/40" />
          )}
          <span className="text-xs font-mono text-white/40">
            {isScanning 
              ? 'SCANNING PERMISSIONS...' 
              : hasScanned 
                ? 'SCAN COMPLETE' 
                : enrichedApps.length > 0 ? 'READY TO SCAN' : 'NO CONNECTIONS'}
          </span>
        </div>
        {enrichedApps.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs font-mono"
            onClick={runScan}
            disabled={isScanning}
          >
            {isScanning ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Scan className="w-3 h-3 mr-1" />
            )}
            {isScanning ? 'Scanning' : 'Re-scan'}
          </Button>
        )}
      </div>

      {/* Risk Summary */}
      {hasScanned && (highRiskCount > 0 || mediumRiskCount > 0) && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
        >
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-200">
            {highRiskCount > 0 && `${highRiskCount} high-risk ${highRiskCount === 1 ? 'app' : 'apps'}`}
            {highRiskCount > 0 && mediumRiskCount > 0 && ' and '}
            {mediumRiskCount > 0 && `${mediumRiskCount} medium-risk ${mediumRiskCount === 1 ? 'app' : 'apps'}`}
            {' detected'}
          </p>
        </motion.div>
      )}

      {/* Apps List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {enrichedApps.length > 0 ? (
            enrichedApps.map((app, i) => (
              <motion.div
                key={app.id}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <AppCard 
                  app={app} 
                  onSever={handleSever}
                  isScanning={isScanning}
                  isSevering={severMutation.isPending}
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-white/60">No third-party apps connected</p>
              <p className="text-xs text-white/30 font-mono mt-1">Your data is fully isolated</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
