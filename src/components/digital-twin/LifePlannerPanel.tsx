import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Calendar, CheckSquare, Heart, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaybookLibrary } from "@/components/life-events/PlaybookLibrary";
import { ActiveExecutions } from "@/components/life-events/ActiveExecutions";
import { TaskDashboard } from "@/components/life-events/TaskDashboard";
import { DocumentCenter } from "@/components/life-events/DocumentCenter";
import { EventTimeline } from "@/components/life-planner/EventTimeline";
import { EventCard } from "@/components/life-planner/EventCard";
import { CreateEventModal } from "@/components/life-planner/CreateEventModal";
import { useLifePlans } from "@/hooks/useLifePlans";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LifePlannerPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LifePlannerPanel({ isOpen, onClose }: LifePlannerPanelProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);
  const { data: lifePlans } = useLifePlans();

  const { data: executions } = useQuery({
    queryKey: ['life-event-playbooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('life_event_playbooks')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: playbooks } = useQuery({
    queryKey: ['life-event-playbook-templates'],
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-y-4 right-4 w-[90vw] max-w-4xl bg-stone-900/95 backdrop-blur-xl border border-stone-700/50 rounded-2xl z-50 flex flex-col overflow-hidden shadow-2xl"
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  Life Planner & Playbooks
                </h2>
                <p className="text-sm text-white/60 mt-1">
                  Plan major life events and automate milestones
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New Plan
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-3 p-4 border-b border-white/10">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-white/60">Active Plans</p>
                    <p className="text-lg font-bold text-white">{lifePlans?.length || 0}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-xs text-white/60">Upcoming</p>
                    <p className="text-lg font-bold text-white">
                      {lifePlans?.filter(p => new Date(p.target_date) > new Date()).length || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="text-xs text-white/60">Active Events</p>
                    <p className="text-lg font-bold text-white">{activeExecutions.length}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-xs text-white/60">Playbooks</p>
                    <p className="text-lg font-bold text-white">{playbooks?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              <Tabs defaultValue="timeline" className="w-full">
                <TabsList className="bg-white/5 border border-white/10">
                  <TabsTrigger value="timeline" className="data-[state=active]:bg-white/10">Timeline</TabsTrigger>
                  <TabsTrigger value="events" className="data-[state=active]:bg-white/10">All Events</TabsTrigger>
                  <TabsTrigger value="playbooks" className="data-[state=active]:bg-white/10">Playbooks</TabsTrigger>
                  <TabsTrigger value="active" className="data-[state=active]:bg-white/10">Active</TabsTrigger>
                  <TabsTrigger value="tasks" className="data-[state=active]:bg-white/10">Tasks</TabsTrigger>
                  <TabsTrigger value="docs" className="data-[state=active]:bg-white/10">Docs</TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="mt-4">
                  <EventTimeline
                    events={lifePlans || []}
                    onEventSelect={setSelectedPlan}
                  />
                </TabsContent>

                <TabsContent value="events" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lifePlans?.map(plan => (
                      <EventCard
                        key={plan.id}
                        event={plan}
                        onSelect={() => setSelectedPlan(plan.id)}
                      />
                    ))}
                    {(!lifePlans || lifePlans.length === 0) && (
                      <div className="col-span-2 text-center py-12 text-white/40">
                        No life plans yet. Create your first one!
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="playbooks" className="mt-4">
                  <PlaybookLibrary playbooks={playbooks || []} />
                </TabsContent>

                <TabsContent value="active" className="mt-4">
                  <ActiveExecutions 
                    executions={activeExecutions}
                    onSelectExecution={setSelectedExecution}
                  />
                </TabsContent>

                <TabsContent value="tasks" className="mt-4">
                  <TaskDashboard executionId={selectedExecution} />
                </TabsContent>

                <TabsContent value="docs" className="mt-4">
                  <DocumentCenter executionId={selectedExecution} />
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>

          {/* Create Modal */}
          {showCreateModal && (
            <CreateEventModal
              open={showCreateModal}
              onClose={() => setShowCreateModal(false)}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}