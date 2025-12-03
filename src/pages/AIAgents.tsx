import { useState } from 'react';
import { ArrowLeft, History, Plus, Bot, Zap, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentSelector } from '@/components/ai-agents/AgentSelector';
import { AgentChat } from '@/components/ai-agents/AgentChat';
import { ConversationHistory } from '@/components/ai-agents/ConversationHistory';
import { AgentCard } from '@/components/agent-hub/AgentCard';
import { ActivityFeed } from '@/components/agent-hub/ActivityFeed';
import { AgentPerformanceChart } from '@/components/agent-hub/AgentPerformanceChart';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { AppLayout } from '@/components/layout/AppLayout';
import { FeatureEmptyState } from '@/components/ui/feature-empty-state';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function AIAgents() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('chat');
  const prefersReducedMotion = useReducedMotion();

  // Autonomous agents data
  const { data: autonomousAgents } = useQuery({
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

  const handleSelectAgent = (agentType: string) => {
    setSelectedAgent(agentType);
    setConversationId(undefined);
  };

  const handleBack = () => {
    setSelectedAgent(null);
    setConversationId(undefined);
  };

  const handleSelectConversation = (id: string) => {
    setConversationId(id || undefined);
  };

  const handleNewConversation = () => {
    setConversationId(undefined);
  };

  const getAgentName = (type: string) => {
    const names: Record<string, string> = {
      financial_coach: 'Financial Coach',
      onboarding_guide: 'Onboarding Guide',
      tax_assistant: 'Tax Assistant',
      investment_research: 'Investment Research',
      debt_advisor: 'Debt Advisor',
      life_planner: 'Life Planner',
      help_agent: '$ave+ Help',
    };
    return names[type] || type;
  };

  const hasAutonomousAgents = autonomousAgents && autonomousAgents.length > 0;

  // If an agent is selected for chat, show chat view
  if (selectedAgent) {
    return (
      <AppLayout>
        <div className="h-full flex flex-col">
          <div className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="container max-w-7xl py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="shrink-0"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold">{getAgentName(selectedAgent)}</h1>
                    <p className="text-sm text-muted-foreground">
                      Your AI-powered {getAgentName(selectedAgent).toLowerCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewConversation}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Chat
                  </Button>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <History className="w-4 h-4" />
                        History
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Conversation History</SheetTitle>
                      </SheetHeader>
                      <ConversationHistory
                        agentType={selectedAgent}
                        onSelectConversation={handleSelectConversation}
                        currentConversationId={conversationId}
                      />
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            key="chat"
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <AgentChat
              agentType={selectedAgent}
              conversationId={conversationId}
              placeholder="Type your message..."
              className="flex-1"
            />
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        <div className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="container max-w-7xl py-4">
            <h1 className="text-2xl font-bold">AI Agents</h1>
            <p className="text-sm text-muted-foreground">
              Chat with AI assistants or delegate tasks to autonomous agents
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="container max-w-7xl py-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="chat">Chat Agents</TabsTrigger>
                <TabsTrigger value="delegations">Autonomous Delegations</TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="selector"
                    initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                  >
                    <AgentSelector
                      onSelectAgent={handleSelectAgent}
                      selectedAgent={selectedAgent || undefined}
                    />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="delegations" className="space-y-6">
                {!hasAutonomousAgents ? (
                  <FeatureEmptyState
                    icon={Bot}
                    title="No Active Delegations"
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
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                      <TabsTrigger value="agents">My Agents</TabsTrigger>
                      <TabsTrigger value="activity">Activity</TabsTrigger>
                      <TabsTrigger value="performance">Performance</TabsTrigger>
                    </TabsList>

                    <TabsContent value="agents" className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {autonomousAgents?.map((agent) => {
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}