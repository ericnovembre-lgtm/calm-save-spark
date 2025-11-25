import { motion } from 'framer-motion';
import { Shield, Battery, Clock, Layers, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Factor {
  name: string;
  weight: number;
  health: number; // 0-100
  icon: typeof Shield;
  advice: string;
}

const factors: Factor[] = [
  {
    name: 'Payment History',
    weight: 35,
    health: 85,
    icon: Shield,
    advice: 'Never miss a payment. Set up automatic payments to maintain perfect history.',
  },
  {
    name: 'Credit Utilization',
    weight: 30,
    health: 45,
    icon: Battery,
    advice: 'Keep utilization below 30%. Pay down balances or request credit limit increases.',
  },
  {
    name: 'Credit Age',
    weight: 15,
    health: 65,
    icon: Clock,
    advice: 'Keep old accounts open. Average age of accounts improves over time.',
  },
  {
    name: 'Credit Mix',
    weight: 10,
    health: 80,
    icon: Layers,
    advice: 'Having different types of credit (cards, loans) shows responsible management.',
  },
  {
    name: 'New Credit',
    weight: 10,
    health: 90,
    icon: Sparkles,
    advice: 'Limit new credit applications. Hard inquiries temporarily lower your score.',
  },
];

const getHealthColor = (health: number): string => {
  if (health >= 80) return 'hsl(142 76% 36%)'; // Green
  if (health >= 50) return 'hsl(45 93% 47%)'; // Yellow
  return 'hsl(0 84% 60%)'; // Red
};

export const CreditFactorBars = () => {
  return (
    <Card className="p-6 backdrop-blur-glass bg-glass border-glass-border">
      <h3 className="text-xl font-display font-bold text-foreground mb-6">
        Credit Health Factors
      </h3>
      <div className="space-y-5">
        {factors.map((factor, index) => {
          const Icon = factor.icon;
          return (
            <TooltipProvider key={factor.name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-2 cursor-help">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          {factor.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          {factor.health}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({factor.weight}% weight)
                        </span>
                      </div>
                    </div>
                    <div className="relative h-3 bg-muted/20 rounded-full overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          backgroundColor: getHealthColor(factor.health),
                          boxShadow: `0 0 8px ${getHealthColor(factor.health)}40`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${factor.health}%` }}
                        transition={{
                          duration: 1,
                          delay: index * 0.1,
                          ease: [0.34, 1.56, 0.64, 1],
                        }}
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-xs">{factor.advice}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </Card>
  );
};
