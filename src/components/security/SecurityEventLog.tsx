import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, LogIn, Key, Shield, CheckCircle2, AlertTriangle, Link2Off, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSecurityAuditLog, SecurityEvent } from '@/hooks/useSecurityAuditLog';

const EVENT_ICONS: Record<string, React.ReactNode> = {
  login: <LogIn className="w-4 h-4" />,
  logout: <LogIn className="w-4 h-4" />,
  password_change: <Key className="w-4 h-4" />,
  mfa_enabled: <Shield className="w-4 h-4" />,
  mfa_disabled: <Shield className="w-4 h-4" />,
  session_revoked: <AlertTriangle className="w-4 h-4" />,
  lockdown_activated: <AlertTriangle className="w-4 h-4" />,
  lockdown_deactivated: <CheckCircle2 className="w-4 h-4" />,
  device_authorized: <CheckCircle2 className="w-4 h-4" />,
  connection_severed: <Link2Off className="w-4 h-4" />,
  suspicious_activity: <AlertTriangle className="w-4 h-4" />,
};

const SEVERITY_STYLES: Record<string, { bg: string; icon: string; dot: string }> = {
  info: { bg: 'bg-white/10', icon: 'text-white/60', dot: 'bg-white/40' },
  success: { bg: 'bg-emerald-500/20', icon: 'text-emerald-400', dot: 'bg-emerald-500' },
  warning: { bg: 'bg-amber-500/20', icon: 'text-amber-400', dot: 'bg-amber-500' },
  critical: { bg: 'bg-rose-500/20', icon: 'text-rose-400', dot: 'bg-rose-500' },
};

function getTimeAgo(timestamp: string) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks}w ago`;
}

function EventItem({ 
  event, 
  isNew,
  index,
}: { 
  event: SecurityEvent; 
  isNew: boolean;
  index: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const styles = SEVERITY_STYLES[event.severity] || SEVERITY_STYLES.info;
  const icon = EVENT_ICONS[event.event_type] || <Clock className="w-4 h-4" />;

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: isNew ? 0 : index * 0.05 }}
      className={`flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors ${
        isNew ? 'ring-1 ring-emerald-500/30' : ''
      }`}
    >
      <div className={`p-2 ${styles.bg} rounded-lg flex-shrink-0 ${styles.icon}`}>
        {icon}
      </div>
      
      <div className="flex-1 space-y-1 min-w-0">
        <p className="text-sm font-medium truncate">{event.event_message}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {getTimeAgo(event.created_at)}
        </p>
      </div>

      <motion.div 
        className={`w-2 h-2 ${styles.dot} rounded-full mt-2 flex-shrink-0`}
        animate={isNew && !prefersReducedMotion ? { scale: [1, 1.5, 1] } : {}}
        transition={{ duration: 1, repeat: isNew ? 3 : 0 }}
      />
    </motion.div>
  );
}

export function SecurityEventLog() {
  const { data: events, isLoading, newEventIds } = useSecurityAuditLog(20);
  const prefersReducedMotion = useReducedMotion();

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-cyber-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-cyber-green/20 rounded-lg">
            <Clock 
              className="w-5 h-5 text-cyber-green"
              style={{ filter: 'drop-shadow(var(--cyber-glow-green))' }}
            />
          </div>
          Recent Activity
          {newEventIds.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-auto px-2 py-0.5 text-xs font-mono bg-emerald-500/20 text-emerald-400 rounded-full"
            >
              {newEventIds.length} new
            </motion.span>
          )}
        </CardTitle>
        <CardDescription>
          Real-time security events
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No security events yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Events will appear here as they occur
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {events.map((event, index) => (
                  <EventItem
                    key={event.id}
                    event={event}
                    isNew={newEventIds.includes(event.id)}
                    index={index}
                  />
                ))}
              </div>
            </AnimatePresence>
          </ScrollArea>
        )}

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            {events.length > 0 
              ? `Showing ${events.length} recent events • Live updates enabled`
              : 'Live updates enabled'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
