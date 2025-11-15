import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface StartPlaybookDialogProps {
  playbook: any;
  children: React.ReactNode;
}

export function StartPlaybookDialog({ playbook, children }: StartPlaybookDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState<Date>();

  const startPlaybook = useMutation({
    mutationFn: async () => {
      if (!eventDate) throw new Error('Event date required');

      // Calculate total tasks
      const financialTasks = Array.isArray(playbook.financial_checklist) ? playbook.financial_checklist.length : 0;
      const legalTasks = Array.isArray(playbook.legal_checklist) ? playbook.legal_checklist.length : 0;
      const adminTasks = Array.isArray(playbook.administrative_checklist) ? playbook.administrative_checklist.length : 0;
      const totalTasks = financialTasks + legalTasks + adminTasks;

      const { data: execution, error: execError } = await supabase
        .from('life_event_executions')
        .insert({
          playbook_id: playbook.id,
          event_name: eventName || playbook.playbook_name,
          event_date: format(eventDate, 'yyyy-MM-dd'),
          total_tasks: totalTasks,
        })
        .select()
        .single();

      if (execError) throw execError;

      // Create tasks
      const tasks: any[] = [];
      let taskOrder = 1;

      // Financial tasks
      if (Array.isArray(playbook.financial_checklist)) {
        for (const task of playbook.financial_checklist) {
          tasks.push({
            execution_id: execution.id,
            task_category: 'financial',
            task_name: task.task || task.name || 'Financial Task',
            task_description: task.description,
            task_order: taskOrder++,
          });
        }
      }

      // Legal tasks
      if (Array.isArray(playbook.legal_checklist)) {
        for (const task of playbook.legal_checklist) {
          tasks.push({
            execution_id: execution.id,
            task_category: 'legal',
            task_name: task.task || task.name || 'Legal Task',
            task_description: task.description,
            task_order: taskOrder++,
          });
        }
      }

      // Admin tasks
      if (Array.isArray(playbook.administrative_checklist)) {
        for (const task of playbook.administrative_checklist) {
          tasks.push({
            execution_id: execution.id,
            task_category: 'administrative',
            task_name: task.task || task.name || 'Administrative Task',
            task_description: task.description,
            task_order: taskOrder++,
          });
        }
      }

      if (tasks.length > 0) {
        const { error: tasksError } = await supabase
          .from('playbook_tasks')
          .insert(tasks);

        if (tasksError) throw tasksError;
      }

      return execution;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['life-event-executions'] });
      toast.success('Life event playbook started!');
      setOpen(false);
      setEventName('');
      setEventDate(undefined);
    },
    onError: (error) => {
      console.error('Error starting playbook:', error);
      toast.error('Failed to start playbook');
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start {playbook.playbook_name}</DialogTitle>
          <DialogDescription>
            Configure your life event. The orchestrator will guide you through all financial, legal, and administrative steps.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label htmlFor="eventName">Event Name (Optional)</Label>
            <Input
              id="eventName"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder={`e.g., "Our Wedding 2026"`}
            />
          </div>

          <div>
            <Label>Event Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventDate ? format(eventDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={setEventDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => startPlaybook.mutate()} 
              disabled={!eventDate || startPlaybook.isPending}
            >
              {startPlaybook.isPending ? 'Starting...' : 'Start Playbook'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
