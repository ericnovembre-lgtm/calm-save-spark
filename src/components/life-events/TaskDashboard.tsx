import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, DollarSign, Scale, FileText, User, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface TaskDashboardProps {
  executionId: string | null;
}

const CATEGORY_ICONS: Record<string, any> = {
  financial: DollarSign,
  legal: Scale,
  administrative: FileText,
  personal: User,
};

export function TaskDashboard({ executionId }: TaskDashboardProps) {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['playbook-tasks', executionId],
    queryFn: async () => {
      if (!executionId) return [];
      
      const { data, error } = await supabase
        .from('playbook_tasks')
        .select('*')
        .eq('execution_id', executionId)
        .order('task_order');
      
      if (error) throw error;
      return data;
    },
    enabled: !!executionId,
  });

  const toggleTask = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      const { error } = await supabase
        .from('playbook_tasks')
        .update({
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', taskId);

      if (error) throw error;

      // Update execution progress
      if (executionId) {
        const completedCount = (tasks?.filter(t => t.is_completed).length || 0) + (completed ? 1 : -1);
        const totalTasks = tasks?.length || 1;
        const percentage = (completedCount / totalTasks) * 100;

        await supabase
          .from('life_event_executions')
          .update({
            tasks_completed: completedCount,
            completion_percentage: percentage,
            current_step: Math.min(completedCount + 1, totalTasks),
            updated_at: new Date().toISOString(),
          })
          .eq('id', executionId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbook-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['life-event-executions'] });
      toast.success('Task updated');
    },
  });

  if (!executionId) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Select an active event to view tasks</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  const groupedTasks = tasks?.reduce((acc: any, task) => {
    if (!acc[task.task_category]) acc[task.task_category] = [];
    acc[task.task_category].push(task);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([category, categoryTasks]: [string, any]) => {
        const Icon = CATEGORY_ICONS[category] || FileText;
        const completed = categoryTasks.filter((t: any) => t.is_completed).length;
        const total = categoryTasks.length;

        return (
          <Card key={category} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold capitalize">{category} Tasks</h3>
                <Badge variant="outline">
                  {completed} / {total}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              {categoryTasks.map((task: any) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                    task.is_completed ? 'bg-accent/30 border-accent' : 'bg-background border-border'
                  }`}
                >
                  <Checkbox
                    checked={task.is_completed}
                    onCheckedChange={(checked) =>
                      toggleTask.mutate({ taskId: task.id, completed: checked as boolean })
                    }
                    disabled={toggleTask.isPending}
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.task_name}
                    </p>
                    {task.task_description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.task_description}</p>
                    )}
                    {task.automation_status && task.automation_status !== 'manual' && (
                      <Badge variant="outline" className="mt-2">
                        {task.automation_status === 'automated' ? '🤖 Automated' : '⏳ Pending Approval'}
                      </Badge>
                    )}
                  </div>
                  {task.is_completed && (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
