import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaybookLibrary } from '@/components/life-events/PlaybookLibrary';
import { ActiveExecutions } from '@/components/life-events/ActiveExecutions';
import { TaskDashboard } from '@/components/life-events/TaskDashboard';
import { DocumentCenter } from '@/components/life-events/DocumentCenter';
import { Loader2, Heart, CheckCircle2, FileText } from 'lucide-react';

export default function LifeEvents() {
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);

  const { data: executions, isLoading } = useQuery({
    queryKey: ['life-event-playbooks'],
    queryFn: async () => {
      const { data, error} = await supabase
        .from('life_event_playbooks')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: playbooks } = useQuery({
    queryKey: ['life-event-playbooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('life_event_playbooks')
        .select('*')
        .eq('is_active', true)
        .order('playbook_name');
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeExecutions = executions?.filter(e => e.is_active) || [];
  const completedCount = executions?.filter(e => !e.is_active).length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Life Event Orchestrator</h1>
          <p className="text-muted-foreground mt-2">
            Automated playbooks for major life milestones - marriage, home buying, new children, and more
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Events</p>
              <p className="text-2xl font-bold mt-1">{activeExecutions.length}</p>
            </div>
            <Heart className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed Events</p>
              <p className="text-2xl font-bold mt-1">{completedCount}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available Playbooks</p>
              <p className="text-2xl font-bold mt-1">{playbooks?.length || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-primary" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Events</TabsTrigger>
          <TabsTrigger value="playbooks">Playbook Library</TabsTrigger>
          <TabsTrigger value="tasks">Task Dashboard</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <ActiveExecutions 
            executions={activeExecutions}
            onSelectExecution={setSelectedExecution}
          />
        </TabsContent>

        <TabsContent value="playbooks">
          <PlaybookLibrary playbooks={playbooks || []} />
        </TabsContent>

        <TabsContent value="tasks">
          <TaskDashboard executionId={selectedExecution} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentCenter executionId={selectedExecution} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
