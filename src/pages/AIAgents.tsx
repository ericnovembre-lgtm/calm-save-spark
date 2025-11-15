import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentSelector } from '@/components/ai-agents/AgentSelector';
import { AgentChat } from '@/components/ai-agents/AgentChat';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function AIAgents() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleSelectAgent = (agentType: string) => {
    setSelectedAgent(agentType);
  };

  const handleBack = () => {
    setSelectedAgent(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container max-w-7xl py-4">
          {selectedAgent ? (
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
                <h1 className="text-2xl font-bold">AI Agents</h1>
                <p className="text-sm text-muted-foreground">
                  Chat with your {selectedAgent.replace('_', ' ')}
                </p>
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
              placeholder="Type your message..."
              className="flex-1"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
