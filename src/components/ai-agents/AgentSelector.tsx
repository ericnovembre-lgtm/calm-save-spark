import { useState } from 'react';
import { Brain, GraduationCap, Receipt, TrendingUp, CreditCard, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface Agent {
  type: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const AGENTS: Agent[] = [
  {
    type: 'financial_coach',
    name: 'Financial Coach',
    description: 'Your personal financial advisor helping with budgets, spending, and money questions',
    icon: Brain,
    color: 'hsl(var(--primary))',
  },
  {
    type: 'onboarding_guide',
    name: 'Onboarding Guide',
    description: 'Friendly guide helping you set up your $ave+ account step-by-step',
    icon: GraduationCap,
    color: 'hsl(var(--accent))',
  },
  {
    type: 'tax_assistant',
    name: 'Tax Assistant',
    description: 'Smart tax advisor helping maximize deductions and plan for tax season',
    icon: Receipt,
    color: 'hsl(142 76% 36%)',
  },
  {
    type: 'investment_research',
    name: 'Investment Research',
    description: 'Investment analyst helping research opportunities and understand markets',
    icon: TrendingUp,
    color: 'hsl(221 83% 53%)',
  },
  {
    type: 'debt_advisor',
    name: 'Debt Advisor',
    description: 'Strategic debt management advisor helping you become debt-free faster',
    icon: CreditCard,
    color: 'hsl(0 84% 60%)',
  },
  {
    type: 'life_planner',
    name: 'Life Planner',
    description: 'Holistic life planning advisor for major milestones and big decisions',
    icon: Heart,
    color: 'hsl(280 65% 60%)',
  },
];

interface AgentSelectorProps {
  onSelectAgent: (agentType: string) => void;
  selectedAgent?: string;
}

export function AgentSelector({ onSelectAgent, selectedAgent }: AgentSelectorProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {AGENTS.map((agent, index) => {
        const Icon = agent.icon;
        const isSelected = selectedAgent === agent.type;

        return (
          <motion.div
            key={agent.type}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={cn(
                'cursor-pointer transition-all hover:shadow-lg',
                isSelected && 'ring-2 ring-primary'
              )}
              onClick={() => onSelectAgent(agent.type)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${agent.color}20` }}
                  >
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {agent.description}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
