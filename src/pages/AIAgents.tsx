import { useState } from 'react';
import { ArrowLeft, History, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentSelector } from '@/components/ai-agents/AgentSelector';
import { AgentChat } from '@/components/ai-agents/AgentChat';
import { ConversationHistory } from '@/components/ai-agents/ConversationHistory';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
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
  const prefersReducedMotion = useReducedMotion();

  const handleSelectAgent = (agentType: string) => {
    setSelectedAgent(agentType);
    setConversationId(undefined); // Start new conversation
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

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container max-w-7xl py-4">
          {selectedAgent ? (
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
          ) : (
            <div>
              <h1 className="text-2xl font-bold">AI Agents</h1>
              <p className="text-sm text-muted-foreground">
                Choose an AI agent to help with your financial journey
              </p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedAgent ? (
          <motion.div
            key="selector"
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            className="flex-1 overflow-auto"
          >
            <div className="container max-w-7xl py-6">
              <AgentSelector
                onSelectAgent={handleSelectAgent}
                selectedAgent={selectedAgent || undefined}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <AgentChat
              agentType={selectedAgent}
              conversationId={conversationId}
              placeholder="Type your message..."
              className="flex-1"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
