import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Play, XCircle } from 'lucide-react';

interface SessionHistoryProps {
  sessions: any[];
  onSelectSession: (id: string) => void;
  currentSessionId: string | null;
}

export function SessionHistory({ sessions, onSelectSession, currentSessionId }: SessionHistoryProps) {
  const getStatusBadge = (status: string) => {
    const configs = {
      active: { label: 'Active', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
      completed: { label: 'Completed', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
      failed: { label: 'Failed', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
    };
    return configs[status as keyof typeof configs] || configs.active;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      active: Play,
      completed: Trophy,
      failed: XCircle,
    };
    const Icon = icons[status as keyof typeof icons] || Play;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      {sessions.map((session) => {
        const isActive = session.id === currentSessionId;
        const statusConfig = getStatusBadge(session.game_status);
        const StatusIcon = getStatusIcon(session.game_status);
        const progress = ((session.current_age - 22) / (session.target_age - 22) * 100).toFixed(0);

        return (
          <Card 
            key={session.id} 
            className={`p-6 cursor-pointer transition-all ${isActive ? 'ring-2 ring-primary' : 'hover:bg-accent/50'}`}
            onClick={() => onSelectSession(session.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{session.session_name}</h3>
                  <Badge className={statusConfig.className}>
                    <span className="flex items-center gap-1">
                      <StatusIcon />
                      {statusConfig.label}
                    </span>
                  </Badge>
                </div>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p>Age: {session.current_age} / {session.target_age} ({progress}% complete)</p>
                  <p>Net Worth: ${Number(session.current_capital).toLocaleString()}</p>
                  {session.completion_score && (
                    <p>Score: {session.completion_score}/100</p>
                  )}
                </div>
              </div>
              {isActive && (
                <Badge variant="outline" className="bg-primary/10">
                  Currently Playing
                </Badge>
              )}
            </div>
          </Card>
        );
      })}

      {sessions.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No simulation sessions yet. Start your first game!</p>
        </Card>
      )}
    </div>
  );
}
