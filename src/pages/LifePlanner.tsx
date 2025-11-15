import { useState } from "react";
import { Helmet } from "react-helmet";
import { PageLayout } from "@/components/layout/PageLayout";
import { EventTimeline } from "@/components/life-planner/EventTimeline";
import { EventCard } from "@/components/life-planner/EventCard";
import { ScenarioComparison } from "@/components/life-planner/ScenarioComparison";
import { CreateEventModal } from "@/components/life-planner/CreateEventModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, Calendar, CheckSquare } from "lucide-react";
import { useLifePlans } from "@/hooks/useLifePlans";

export default function LifePlanner() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { data: lifePlans, isLoading } = useLifePlans();

  return (
    <>
      <Helmet>
        <title>Life Planner | $ave+</title>
        <meta name="description" content="Plan major life events with AI-powered insights" />
      </Helmet>

      <PageLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Life Planner</h1>
              <p className="text-muted-foreground mt-1">
                Plan major life events with realistic timelines and budgets
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Life Plan
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <CheckSquare className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Progress</p>
                  <p className="text-2xl font-bold text-foreground">
                    {lifePlans?.length || 0}
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
      </PageLayout>
    </>
  );
}
