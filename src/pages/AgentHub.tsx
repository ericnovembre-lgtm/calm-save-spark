import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentCard } from "@/components/agent-hub/AgentCard";
import { ActivityFeed } from "@/components/agent-hub/ActivityFeed";
import { AgentPerformanceChart } from "@/components/agent-hub/AgentPerformanceChart";
import { Bot, Zap, Shield, Clock } from "lucide-react";
import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton";
import { FeatureEmptyState } from "@/components/ui/feature-empty-state";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";

export default function AgentHub() {
  const { data: agents, isLoading } = useQuery({
    queryKey: ['autonomous-agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('autonomous_agents')
        .select('*')
        .eq('is_active', true)
        .order('agent_name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: delegations } = useQuery({
    queryKey: ['agent-delegations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_delegations')
        .select('*, autonomous_agents(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <PageLoadingSkeleton variant="cards" />;
  }

  const hasAgents = agents && agents.length > 0;

  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Autonomous Agent Hub</h1>
              <p className="text-muted-foreground mt-2">
                Delegate financial tasks to AI agents working 24/7 on your behalf
              </p>
            </div>
          </div>

          {!hasAgents ? (
            <FeatureEmptyState
              icon={Bot}
              title="No Active Agents Yet"
              description="Delegate financial tasks to AI agents that work 24/7 on your behalf. From portfolio management to bill negotiation."
              actionLabel="Browse Available Agents"
              features={[
                { icon: Zap, label: '24/7 autonomous operation' },
                { icon: Shield, label: 'Secure & transparent actions' },
                { icon: Clock, label: 'Real-time activity tracking' },
                { icon: Bot, label: 'Multiple specialized agents' },
              ]}
            />
          ) : (
            <Tabs defaultValue="agents" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="agents">My Agents</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="agents" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {agents?.map((agent) => {
                    const delegation = delegations?.find(d => d.agent_id === agent.id);
                    return (
                      <AgentCard 
                        key={agent.id} 
                        agent={agent}
                        delegation={delegation}
                      />
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <ActivityFeed />
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <AgentPerformanceChart />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}
