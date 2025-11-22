import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, LogIn, Key, Shield, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SecurityEvent {
  id: string;
  type: 'login' | 'password' | 'mfa' | 'biometric';
  message: string;
  timestamp: string;
  status: 'success' | 'warning';
}

const MOCK_EVENTS: SecurityEvent[] = [
  {
    id: '1',
    type: 'login',
    message: 'New login from Chrome (San Francisco)',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    status: 'success',
  },
  {
    id: '2',
    type: 'password',
    message: 'Password changed',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'success',
  },
  {
    id: '3',
    type: 'mfa',
    message: 'MFA enabled',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'success',
  },
];

export function SecurityEventLog() {
  const prefersReducedMotion = useReducedMotion();

  const getEventIcon = (type: string) => {
    const icons = {
      login: <LogIn className="w-4 h-4" />,
      password: <Key className="w-4 h-4" />,
      mfa: <Shield className="w-4 h-4" />,
      biometric: <CheckCircle2 className="w-4 h-4" />,
    };
    return icons[type as keyof typeof icons] || <Clock className="w-4 h-4" />;
  };

  const getTimeAgo = (timestamp: string) => {
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
  };

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
        </CardTitle>
        <CardDescription>
          Security events from the past 30 days
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {MOCK_EVENTS.map((event, index) => (
              <motion.div
                key={event.id}
                initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="p-2 bg-cyber-green/20 rounded-lg flex-shrink-0">
                  {getEventIcon(event.type)}
                </div>
                
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{event.message}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getTimeAgo(event.timestamp)}
                  </p>
                </div>

                <div className="w-2 h-2 bg-cyber-green rounded-full mt-2 flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            Showing recent activity • Full log available in Settings
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
