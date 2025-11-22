import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, MapPin, Clock, X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { haptics } from '@/lib/haptics';
import { announce } from '@/components/layout/LiveRegion';

interface Session {
  id: string;
  user_agent?: string;
  ip?: string;
  last_activity?: string;
  is_current?: boolean;
}

export function ActiveSessions() {
  const prefersReducedMotion = useReducedMotion();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      // Mock sessions for demo - in production would query auth.sessions
      return [
        {
          id: session.access_token.slice(0, 16),
          user_agent: navigator.userAgent,
          ip: 'Current Device',
          last_activity: new Date().toISOString(),
          is_current: true,
        },
      ] as Session[];
    },
  });

  // Subscribe to realtime session changes
  useEffect(() => {
    const channel = supabase
      .channel('security-sessions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'auth', table: 'sessions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Monitor className="w-5 h-5" />;
    if (/mobile|android|iphone|ipad/i.test(userAgent)) {
      return <Smartphone className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  const getDeviceInfo = (userAgent?: string) => {
    if (!userAgent) return { name: 'Unknown Device', browser: 'Unknown' };
    
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
    const name = isMobile ? 'Mobile Device' : 'Desktop Computer';

    return { name, browser };
  };

  const getTimeAgo = (timestamp?: string) => {
    if (!timestamp) return 'Unknown';
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleRevokeSession = async (sessionId: string) => {
    haptics.vibrate('medium');
    
    try {
      // In production, would call API to revoke specific session
      await supabase.auth.signOut({ scope: 'others' });
      
      announce('Session revoked successfully', 'polite');
      toast.success('Session revoked', {
        description: 'The device has been signed out',
      });
      
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    } catch (error) {
      console.error('Failed to revoke session:', error);
      toast.error('Failed to revoke session');
    }
  };

  const suspiciousSessions = sessions.filter(s => !s.is_current && s.ip && !s.ip.includes('Current'));

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-cyber-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-cyber-green/20 rounded-lg">
            <Monitor 
              className="w-5 h-5 text-cyber-green"
              style={{ filter: 'drop-shadow(var(--cyber-glow-green))' }}
            />
          </div>
          Active Sessions
        </CardTitle>
        <CardDescription>
          Devices currently signed into your account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {suspiciousSessions.length > 0 && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Suspicious Activity Detected
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {suspiciousSessions.length} session(s) from unusual locations
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No active sessions found
            </div>
          ) : (
            sessions.map((session, index) => {
              const deviceInfo = getDeviceInfo(session.user_agent);
              const timeAgo = getTimeAgo(session.last_activity);

              return (
                <motion.div
                  key={session.id}
                  initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border transition-colors ${
                    session.is_current
                      ? 'bg-cyber-green/10 border-cyber-green/30'
                      : 'bg-muted/30 border-border hover:border-cyber-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        session.is_current ? 'bg-cyber-green/20' : 'bg-muted'
                      }`}>
                        {getDeviceIcon(session.user_agent)}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {deviceInfo.name}
                          </p>
                          {session.is_current && (
                            <span className="px-2 py-0.5 text-xs bg-cyber-green/20 text-cyber-green border border-cyber-green/30 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{deviceInfo.browser}</span>
                          {session.ip && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {session.ip}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!session.is_current && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRevokeSession(session.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {sessions.length > 1 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleRevokeSession('all')}
          >
            Revoke All Other Sessions
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
