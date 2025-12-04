import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircuitEvent } from '@/hooks/useApiHealthMetrics';
import { cn } from '@/lib/utils';

interface CircuitBreakerTimelineProps {
  events: CircuitEvent[];
  isLoading?: boolean;
}

const stateConfig = {
  closed: {
    label: 'Closed',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: CheckCircle,
  },
  'half-open': {
    label: 'Half-Open',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: Clock,
  },
  open: {
    label: 'Open',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    icon: AlertTriangle,
  },
};

export function CircuitBreakerTimeline({ events, isLoading }: CircuitBreakerTimelineProps) {
  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Circuit Breaker Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-16 bg-muted/30 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Circuit Breaker Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-400 mb-2" />
            <p className="text-sm text-muted-foreground">No circuit breaker events</p>
            <p className="text-xs text-muted-foreground/60">System operating normally</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Circuit Breaker Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-3">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border/50" />
          
          {events.map((event, index) => {
            const config = stateConfig[event.state as keyof typeof stateConfig] || stateConfig.closed;
            const Icon = config.icon;
            
            return (
              <motion.div
                key={`${event.timestamp}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative pl-10 py-3 px-4 rounded-lg border",
                  config.bgColor,
                  config.borderColor
                )}
              >
                {/* Timeline dot */}
                <div className={cn(
                  "absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center",
                  config.bgColor,
                  "ring-2 ring-background"
                )}>
                  <Icon className={cn("w-2.5 h-2.5", config.color)} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className={cn("text-sm font-medium", config.color)}>
                      Circuit {config.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                  {event.consecutiveFailures > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {event.consecutiveFailures} failure{event.consecutiveFailures !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
