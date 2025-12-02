import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Monitor, Globe, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { haptics } from '@/lib/haptics';
import { soundEffects } from '@/lib/sound-effects';
import { useUserSessions, useRevokeSession, UserSession } from '@/hooks/useUserSessions';
import { formatDistanceToNow } from 'date-fns';

interface SessionWithCoords extends UserSession {
  coordinates: { x: number; y: number };
}

// Session beacon component
function SessionBeacon({ 
  session, 
  onClick 
}: { 
  session: SessionWithCoords; 
  onClick: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  
  const getBeaconStyle = () => {
    if (session.is_current) {
      return {
        bg: 'bg-blue-500',
        ring: 'ring-blue-400/50',
        glow: '0 0 20px rgba(59, 130, 246, 0.6)',
      };
    }
    if (session.is_authorized) {
      return {
        bg: 'bg-emerald-500',
        ring: 'ring-emerald-400/30',
        glow: '0 0 10px rgba(16, 185, 129, 0.4)',
      };
    }
    return {
      bg: 'bg-rose-500',
      ring: 'ring-rose-400/50',
      glow: '0 0 20px rgba(244, 63, 94, 0.6)',
    };
  };

  const style = getBeaconStyle();
  const location = [session.city, session.country].filter(Boolean).join(', ') || 'Unknown Location';

  return (
    <motion.button
      onClick={onClick}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
      style={{ 
        left: `${session.coordinates.x}%`, 
        top: `${session.coordinates.y}%` 
      }}
      whileHover={{ scale: 1.5 }}
      whileTap={{ scale: 0.9 }}
    >
      {/* Ripple effect for current device */}
      {session.is_current && !prefersReducedMotion && (
        <motion.div
          className={`absolute inset-0 rounded-full ${style.bg}`}
          animate={{
            scale: [1, 2.5, 3],
            opacity: [0.6, 0.2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          style={{ width: 12, height: 12, marginLeft: -6, marginTop: -6 }}
        />
      )}
      
      {/* Flashing effect for unknown devices */}
      {!session.is_authorized && !prefersReducedMotion && (
        <>
          {/* Crosshair reticle */}
          <motion.div
            className="absolute w-8 h-8 border-2 border-rose-500 rounded-full"
            style={{ marginLeft: -16, marginTop: -16 }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [1, 0.5, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute w-6 h-0.5 bg-rose-500"
            style={{ marginLeft: -12, marginTop: -1 }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-0.5 h-6 bg-rose-500"
            style={{ marginLeft: -1, marginTop: -12 }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </>
      )}
      
      {/* Main beacon dot */}
      <motion.div
        className={`w-3 h-3 rounded-full ${style.bg} ring-4 ${style.ring}`}
        style={{ boxShadow: style.glow }}
        animate={session.is_current && !prefersReducedMotion ? {
          scale: [1, 1.2, 1],
        } : {}}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
        <div className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs whitespace-nowrap">
          <p className="font-semibold text-white">{session.device_name || 'Unknown Device'}</p>
          <p className="text-white/50 font-mono">{location}</p>
        </div>
      </div>
    </motion.button>
  );
}

// Revoke session modal
function RevokeSessionModal({
  session,
  isOpen,
  onClose,
  onRevoke,
  isRevoking,
}: {
  session: SessionWithCoords | null;
  isOpen: boolean;
  onClose: () => void;
  onRevoke: (id: string) => void;
  isRevoking: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();

  const handleRevoke = () => {
    if (!session) return;
    haptics.vibrate('heavy');
    soundEffects.error();
    onRevoke(session.id);
  };

  const DeviceIcon = session?.device_type === 'mobile' || session?.device_type === 'tablet'
    ? Smartphone 
    : Monitor;

  const location = session ? [session.city, session.country].filter(Boolean).join(', ') || 'Unknown' : '';
  const lastActive = session?.last_active_at 
    ? formatDistanceToNow(new Date(session.last_active_at), { addSuffix: true })
    : 'Unknown';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-3xl border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-white">
            {session?.is_authorized ? (
              <DeviceIcon className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            )}
            Terminate Session?
          </DialogTitle>
        </DialogHeader>
        
        {session && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5 space-y-2">
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Device</span>
                <span className="text-white font-mono text-sm">{session.device_name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Browser</span>
                <span className="text-white font-mono text-sm">{session.browser || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Location</span>
                <span className="text-white font-mono text-sm">{location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">IP Address</span>
                <span className="text-white font-mono text-sm">{session.ip_address || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Last Active</span>
                <span className="text-white font-mono text-sm">{lastActive}</span>
              </div>
            </div>
            
            {session.is_current && (
              <p className="text-amber-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                This is your current session. You will be logged out.
              </p>
            )}
            
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1 border border-white/10"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 bg-rose-600 hover:bg-rose-700"
                onClick={handleRevoke}
                disabled={isRevoking}
              >
                <AnimatePresence mode="wait">
                  {isRevoking ? (
                    <motion.div
                      key="revoking"
                      initial={prefersReducedMotion ? {} : { scale: 1 }}
                      animate={prefersReducedMotion ? {} : { scale: [1, 0.5, 0] }}
                      className="w-4 h-4 rounded-full bg-white"
                    />
                  ) : (
                    <motion.span key="kill">Kill Session</motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function SentinelSessionMap() {
  const { data: sessions = [], isLoading } = useUserSessions();
  const revokeMutation = useRevokeSession();
  const [selectedSession, setSelectedSession] = useState<SessionWithCoords | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleBeaconClick = (session: SessionWithCoords) => {
    haptics.vibrate('light');
    soundEffects.click();
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleRevoke = async (id: string) => {
    await revokeMutation.mutateAsync(id);
    soundEffects.success();
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  // Cast sessions to include coordinates
  const sessionsWithCoords = sessions as SessionWithCoords[];

  if (isLoading) {
    return (
      <div className="relative w-full h-full min-h-[280px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[280px]">
      {/* SVG World Map - Dotted Grid Style */}
      <svg
        viewBox="0 0 100 50"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="2" height="2" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.15" fill="rgba(255,255,255,0.1)" />
          </pattern>
        </defs>
        <rect width="100" height="50" fill="url(#grid)" />
        
        {/* Simplified continent outlines */}
        <g className="text-white/5" fill="currentColor">
          {/* North America */}
          <path d="M5,12 Q15,8 25,15 L22,25 Q12,30 8,25 Z" />
          {/* South America */}
          <path d="M18,30 Q25,28 27,35 L24,45 Q18,48 16,42 Z" />
          {/* Europe */}
          <path d="M42,14 Q50,10 55,15 L52,22 Q45,25 42,20 Z" />
          {/* Africa */}
          <path d="M45,25 Q52,22 55,30 L52,42 Q45,45 42,38 Z" />
          {/* Asia */}
          <path d="M55,10 Q75,8 85,18 L82,30 Q65,35 55,25 Z" />
          {/* Australia */}
          <path d="M78,35 Q85,32 88,38 L86,43 Q80,45 78,40 Z" />
        </g>
        
        {/* Connection lines between sessions */}
        {!prefersReducedMotion && sessionsWithCoords.length > 1 && (
          <g className="text-white/5">
            {sessionsWithCoords.slice(1).map((session, i) => (
              <motion.line
                key={session.id}
                x1={sessionsWithCoords[0].coordinates.x}
                y1={sessionsWithCoords[0].coordinates.y}
                x2={session.coordinates.x}
                y2={session.coordinates.y}
                stroke="currentColor"
                strokeWidth="0.2"
                strokeDasharray="1,1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.3 }}
                transition={{ delay: i * 0.2, duration: 1 }}
              />
            ))}
          </g>
        )}
      </svg>
      
      {/* Session Beacons */}
      {sessionsWithCoords.map(session => (
        <SessionBeacon
          key={session.id}
          session={session}
          onClick={() => handleBeaconClick(session)}
        />
      ))}
      
      {/* Empty state */}
      {sessionsWithCoords.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Globe className="w-12 h-12 text-white/20 mx-auto mb-2" />
            <p className="text-white/40 text-sm font-mono">No active sessions</p>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-white/40 font-mono">Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-white/40 font-mono">Authorized</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="text-white/40 font-mono">Unknown</span>
        </div>
      </div>
      
      {/* Session count */}
      <div className="absolute top-2 right-2 text-xs font-mono text-white/40">
        {sessionsWithCoords.length} active {sessionsWithCoords.length === 1 ? 'session' : 'sessions'}
      </div>
      
      {/* Revoke Modal */}
      <RevokeSessionModal
        session={selectedSession}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRevoke={handleRevoke}
        isRevoking={revokeMutation.isPending}
      />
    </div>
  );
}
