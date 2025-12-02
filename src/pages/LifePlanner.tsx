import { useState } from "react";
import { Helmet } from "react-helmet";
import { AppLayout } from "@/components/layout/AppLayout";
import { EventTimeline } from "@/components/life-planner/EventTimeline";
import { EventCard } from "@/components/life-planner/EventCard";
import { ScenarioComparison } from "@/components/life-planner/ScenarioComparison";
import { CreateEventModal } from "@/components/life-planner/CreateEventModal";
import { PlaybookLibrary } from "@/components/life-events/PlaybookLibrary";
import { ActiveExecutions } from "@/components/life-events/ActiveExecutions";
import { TaskDashboard } from "@/components/life-events/TaskDashboard";
import { DocumentCenter } from "@/components/life-events/DocumentCenter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, Calendar, CheckSquare, Heart, FileText } from "lucide-react";
import { useLifePlans } from "@/hooks/useLifePlans";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export default function LifePlanner() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);
  const { data: lifePlans, isLoading } = useLifePlans();

  // Fetch life event executions
  const { data: executions } = useQuery({
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

  // Fetch playbook templates
  const { data: playbooks } = useQuery({
    queryKey: ['life-event-playbooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('life_event_playbooks' as any)
        .select('*')
        .order('playbook_name');
      
      if (error) throw error;
      return data as any[];
    },
  });

  const activeExecutions = executions?.filter((e: any) => e.status === 'active' || e.status === 'in_progress') || [];
  const completedExecutions = executions?.filter((e: any) => e.status === 'completed').length || 0;

  return (
    <>
      <Helmet>
        <title>Life Planner | $ave+</title>
        <meta name="description" content="Plan major life events with AI-powered insights" />
      </Helmet>

      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Life Planner & Events</h1>
              <p className="text-muted-foreground mt-1">
                Plan major life events, automate milestones, and track progress
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Life Plan
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Plans</p>
                  <p className="text-2xl font-bold text-foreground">
                    {lifePlans?.length || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Events</p>
                  <p className="text-2xl font-bold text-foreground">
                    {lifePlans?.filter(p => new Date(p.target_date) > new Date()).length || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-pink-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Events</p>
                  <p className="text-2xl font-bold text-foreground">
                    {activeExecutions.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground">
                    {completedExecutions}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Playbooks</p>
                  <p className="text-2xl font-bold text-foreground">
                    {playbooks?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="events">All Events</TabsTrigger>
              <TabsTrigger value="playbooks">Playbooks</TabsTrigger>
              <TabsTrigger value="active-events">Active Events</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="mt-6">
              <EventTimeline
                events={lifePlans || []}
                onEventSelect={setSelectedPlan}
              />
            </TabsContent>

            <TabsContent value="events" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lifePlans?.map(plan => (
                  <EventCard
                    key={plan.id}
                    event={plan}
                    onSelect={() => setSelectedPlan(plan.id)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="playbooks" className="mt-6">
              <PlaybookLibrary playbooks={playbooks || []} />
            </TabsContent>

            <TabsContent value="active-events" className="mt-6">
              <ActiveExecutions 
                executions={activeExecutions}
                onSelectExecution={setSelectedExecution}
              />
            </TabsContent>

            <TabsContent value="tasks" className="mt-6">
              <TaskDashboard executionId={selectedExecution} />
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <DocumentCenter executionId={selectedExecution} />
            </TabsContent>

            <TabsContent value="scenarios" className="mt-6">
              {selectedPlan && (
                <ScenarioComparison lifePlanId={selectedPlan} />
              )}
            </TabsContent>
          </Tabs>

          {/* Create Modal */}
          {showCreateModal && (
            <CreateEventModal
              open={showCreateModal}
              onClose={() => setShowCreateModal(false)}
            />
          )}
        </div>
      </AppLayout>
    </>
  );
}
