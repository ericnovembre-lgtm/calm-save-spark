import { useState, useMemo } from 'react';
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

interface StackedSession {
  sessions: SessionWithCoords[];
  x: number;
  y: number;
  hasCurrent: boolean;
  hasUnauthorized: boolean;
}

// Group sessions by approximate location (within 2% distance)
function groupSessionsByLocation(sessions: SessionWithCoords[]): StackedSession[] {
  const groups: StackedSession[] = [];
  const threshold = 2; // 2% distance threshold for grouping

  sessions.forEach(session => {
    const existingGroup = groups.find(g => 
      Math.abs(g.x - session.coordinates.x) < threshold &&
      Math.abs(g.y - session.coordinates.y) < threshold
    );

    if (existingGroup) {
      existingGroup.sessions.push(session);
      if (session.is_current) existingGroup.hasCurrent = true;
      if (!session.is_authorized) existingGroup.hasUnauthorized = true;
    } else {
      groups.push({
        sessions: [session],
        x: session.coordinates.x,
        y: session.coordinates.y,
        hasCurrent: session.is_current,
        hasUnauthorized: !session.is_authorized,
      });
    }
  });

  return groups;
}

// Session beacon component for stacked sessions
function StackedSessionBeacon({ 
  stack, 
  onClick 
}: { 
  stack: StackedSession; 
  onClick: (session: SessionWithCoords) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Sort sessions: current first, then unauthorized, then authorized
  const sortedSessions = [...stack.sessions].sort((a, b) => {
    if (a.is_current) return -1;
    if (b.is_current) return 1;
    if (!a.is_authorized && b.is_authorized) return -1;
    if (a.is_authorized && !b.is_authorized) return 1;
    return 0;
  });

  const primarySession = sortedSessions[0];
  const hasMultiple = stack.sessions.length > 1;
  
  const getBeaconStyle = (session: SessionWithCoords) => {
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

  const style = getBeaconStyle(primarySession);
  const location = [primarySession.city, primarySession.country].filter(Boolean).join(', ') || 'Unknown Location';

  const handleClick = () => {
    if (hasMultiple && !isExpanded) {
      setIsExpanded(true);
      haptics.vibrate('light');
    } else if (hasMultiple && isExpanded) {
      setIsExpanded(false);
    } else {
      onClick(primarySession);
    }
  };

  return (
    <motion.div
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{ 
        left: `${stack.x}%`, 
        top: `${stack.y}%`,
        zIndex: stack.hasCurrent ? 30 : stack.hasUnauthorized ? 20 : 10,
      }}
    >
      {/* Expanded view for multiple sessions */}
      <AnimatePresence>
        {isExpanded && hasMultiple && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50"
          >
            <div className="bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-lg p-2 space-y-1 min-w-[180px]">
              <p className="text-xs text-white/50 font-mono px-2 mb-2">{stack.sessions.length} sessions at this location</p>
              {sortedSessions.map((session, idx) => {
                const sessionStyle = getBeaconStyle(session);
                return (
                  <button
                    key={session.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick(session);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 transition-colors text-left"
                  >
                    <div className={`w-2 h-2 rounded-full ${sessionStyle.bg}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{session.device_name || 'Unknown'}</p>
                      <p className="text-[10px] text-white/40 font-mono">{session.browser || 'Unknown browser'}</p>
                    </div>
                    {session.is_current && (
                      <span className="text-[9px] text-blue-400 font-mono">YOU</span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleClick}
        className="relative cursor-pointer group"
        whileHover={{ scale: 1.5 }}
        whileTap={{ scale: 0.9 }}
      >
        {/* Ripple effect for current device */}
        {stack.hasCurrent && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-500"
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
        {stack.hasUnauthorized && !prefersReducedMotion && (
          <>
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
          animate={stack.hasCurrent && !prefersReducedMotion ? {
            scale: [1, 1.2, 1],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Stack count badge */}
        {hasMultiple && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-700 border border-white/20 flex items-center justify-center"
          >
            <span className="text-[9px] font-bold text-white">{stack.sessions.length}</span>
          </motion.div>
        )}
        
        {/* Tooltip on hover (only for single session) */}
        {!hasMultiple && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
            <div className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs whitespace-nowrap">
              <p className="font-semibold text-white">{primarySession.device_name || 'Unknown Device'}</p>
              <p className="text-white/50 font-mono">{location}</p>
            </div>
          </div>
        )}
      </motion.button>

      {/* Click outside to close expanded view */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsExpanded(false)}
        />
      )}
    </motion.div>
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

// More recognizable continent paths for SVG viewBox 0 0 100 50
const CONTINENT_PATHS = {
  // North America - more recognizable shape
  northAmerica: "M10,8 L18,6 L22,8 L26,6 L28,10 L26,14 L28,16 L26,20 L22,22 L18,24 L14,22 L10,24 L8,20 L6,16 L8,12 Z",
  // South America
  southAmerica: "M20,28 L24,26 L28,28 L30,32 L28,38 L26,42 L22,46 L18,44 L16,40 L18,34 L20,30 Z",
  // Europe
  europe: "M44,8 L48,6 L54,8 L56,12 L54,16 L50,18 L46,16 L44,12 Z",
  // Africa
  africa: "M44,20 L50,18 L56,20 L58,26 L56,34 L52,40 L46,42 L42,38 L40,30 L42,24 Z",
  // Asia - large landmass
  asia: "M56,6 L64,4 L72,6 L80,4 L86,8 L88,14 L86,20 L82,26 L76,28 L70,26 L64,28 L58,24 L56,18 L58,12 Z",
  // Australia
  australia: "M78,34 L84,32 L90,34 L92,38 L90,42 L84,44 L78,42 L76,38 Z",
  // Greenland
  greenland: "M32,4 L38,2 L42,4 L40,8 L36,10 L32,8 Z",
};

export function SentinelSessionMap() {
  const { data: sessions = [], isLoading } = useUserSessions();
  const revokeMutation = useRevokeSession();
  const [selectedSession, setSelectedSession] = useState<SessionWithCoords | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Cast sessions to include coordinates
  const sessionsWithCoords = sessions as SessionWithCoords[];
  
  // Group sessions by location
  const stackedSessions = useMemo(() => 
    groupSessionsByLocation(sessionsWithCoords),
    [sessionsWithCoords]
  );

  const handleBeaconClick = (session: SessionWithCoords) => {
    haptics.vibrate('light');
    soundEffects.click();
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleRevoke = async (id: string) => {
    const session = selectedSession;
    const location = session ? [session.city, session.country].filter(Boolean).join(', ') : undefined;
    await revokeMutation.mutateAsync({ 
      sessionId: id, 
      deviceName: session?.device_name || undefined,
      location 
    });
    soundEffects.success();
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-full min-h-[280px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[280px]">
      {/* SVG World Map - Improved continent shapes */}
      <svg
        viewBox="0 0 100 50"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="2" height="2" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.15" fill="rgba(255,255,255,0.08)" />
          </pattern>
          {/* Latitude/longitude lines */}
          <pattern id="latLong" width="10" height="10" patternUnits="userSpaceOnUse">
            <line x1="0" y1="5" x2="10" y2="5" stroke="rgba(255,255,255,0.03)" strokeWidth="0.1" />
            <line x1="5" y1="0" x2="5" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="0.1" />
          </pattern>
        </defs>
        <rect width="100" height="50" fill="url(#grid)" />
        <rect width="100" height="50" fill="url(#latLong)" />
        
        {/* Continent shapes */}
        <g className="text-white/8" fill="currentColor" stroke="currentColor" strokeWidth="0.2">
          <path d={CONTINENT_PATHS.northAmerica} />
          <path d={CONTINENT_PATHS.southAmerica} />
          <path d={CONTINENT_PATHS.europe} />
          <path d={CONTINENT_PATHS.africa} />
          <path d={CONTINENT_PATHS.asia} />
          <path d={CONTINENT_PATHS.australia} />
          <path d={CONTINENT_PATHS.greenland} />
        </g>

        {/* Continent labels */}
        <g className="text-white/15" fill="currentColor" fontSize="2" fontFamily="monospace">
          <text x="16" y="16">NA</text>
          <text x="22" y="36">SA</text>
          <text x="48" y="12">EU</text>
          <text x="48" y="32">AF</text>
          <text x="70" y="16">AS</text>
          <text x="82" y="38">AU</text>
        </g>
        
        {/* Connection lines between session stacks */}
        {!prefersReducedMotion && stackedSessions.length > 1 && (
          <g className="text-white/5">
            {stackedSessions.slice(1).map((stack, i) => (
              <motion.line
                key={`line-${i}`}
                x1={stackedSessions[0].x}
                y1={stackedSessions[0].y}
                x2={stack.x}
                y2={stack.y}
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
      
      {/* Session Beacons - now stacked */}
      {stackedSessions.map((stack, idx) => (
        <StackedSessionBeacon
          key={`stack-${idx}`}
          stack={stack}
          onClick={handleBeaconClick}
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
