import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Home, Baby, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ActiveExecutionsProps {
  executions: any[];
  onSelectExecution: (id: string) => void;
}

const EVENT_ICONS: Record<string, any> = {
  marriage: Heart,
  home_purchase: Home,
  new_child: Baby,
};

export function ActiveExecutions({ executions, onSelectExecution }: ActiveExecutionsProps) {
  if (executions.length === 0) {
    return (
      <Card className="p-12 text-center space-y-4">
        <Calendar className="w-12 h-12 mx-auto text-muted-foreground" />
        <div>
          <h3 className="text-lg font-semibold">No Active Events</h3>
          <p className="text-muted-foreground mt-2">
            Start a playbook from the library to begin orchestrating your next life event.
          </p>
        </div>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      planning: { label: 'Planning', className: 'bg-blue-500/10 text-blue-600' },
      in_progress: { label: 'In Progress', className: 'bg-yellow-500/10 text-yellow-600' },
      completed: { label: 'Completed', className: 'bg-green-500/10 text-green-600' },
      cancelled: { label: 'Cancelled', className: 'bg-gray-500/10 text-gray-600' },
    };
    return configs[status as keyof typeof configs] || configs.planning;
  };

  return (
    <div className="space-y-6">
      {executions.map((execution) => {
        const Icon = EVENT_ICONS[execution.life_event_playbooks?.event_type] || Calendar;
        const statusConfig = getStatusBadge(execution.status);
        const progress = Number(execution.completion_percentage) || 0;
        
        return (
          <Card key={execution.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{execution.event_name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {execution.life_event_playbooks?.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className={statusConfig.className}>
                      {statusConfig.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(execution.event_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">
                  {execution.tasks_completed} / {execution.total_tasks} tasks
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid gap-3 md:grid-cols-2 mt-4">
              <div className="text-sm">
                <p className="text-muted-foreground">Current Step</p>
                <p className="font-semibold">Step {execution.current_step}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Estimated Cost</p>
                <p className="font-semibold">
                  ${Number(execution.estimated_cost || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <Button 
              className="w-full mt-4" 
              onClick={() => onSelectExecution(execution.id)}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Manage Tasks
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
