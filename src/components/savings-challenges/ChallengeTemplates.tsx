import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { addDays, addWeeks, format } from "date-fns";
import { CreateChallengeInput } from "@/hooks/useSavingsChallenges";

interface ChallengeTemplatesProps {
  onSelectTemplate: (input: CreateChallengeInput) => void;
}

const templates = [
  {
    id: '52-week',
    name: '52 Week Challenge',
    description: 'Save $1 week 1, $2 week 2... up to $52 week 52. Total: $1,378!',
    icon: '📅',
    type: '52_week' as const,
    target: 1378,
    duration: 364, // 52 weeks
    difficulty: 'Medium',
    color: 'bg-blue-500/20 text-blue-600',
  },
  {
    id: 'no-spend-week',
    name: 'No Spend Week',
    description: 'Challenge yourself to only spend on essentials for 7 days',
    icon: '🚫',
    type: 'no_spend' as const,
    target: 200, // Estimated savings
    duration: 7,
    difficulty: 'Hard',
    color: 'bg-red-500/20 text-red-600',
  },
  {
    id: 'coffee-challenge',
    name: 'Skip the Latte',
    description: 'Make coffee at home for 30 days. Save ~$150!',
    icon: '☕',
    type: 'reduce_category' as const,
    target: 150,
    duration: 30,
    category: 'Coffee',
    difficulty: 'Easy',
    color: 'bg-amber-500/20 text-amber-600',
  },
  {
    id: 'round-up',
    name: 'Round Up Master',
    description: 'Round up every purchase to the nearest dollar for a month',
    icon: '🪙',
    type: 'round_up' as const,
    target: 100,
    duration: 30,
    difficulty: 'Easy',
    color: 'bg-green-500/20 text-green-600',
  },
  {
    id: 'dining-detox',
    name: 'Dining Detox',
    description: 'No restaurants or takeout for 2 weeks. Cook at home!',
    icon: '🍳',
    type: 'reduce_category' as const,
    target: 200,
    duration: 14,
    category: 'Dining Out',
    difficulty: 'Medium',
    color: 'bg-purple-500/20 text-purple-600',
  },
  {
    id: 'emergency-fund',
    name: 'Emergency Fund Sprint',
    description: 'Save $1,000 in 90 days for your emergency fund',
    icon: '🏦',
    type: 'save_amount' as const,
    target: 1000,
    duration: 90,
    difficulty: 'Hard',
    color: 'bg-cyan-500/20 text-cyan-600',
  },
];

export function ChallengeTemplates({ onSelectTemplate }: ChallengeTemplatesProps) {
  const handleSelect = (template: typeof templates[0]) => {
    const startDate = new Date();
    const endDate = addDays(startDate, template.duration);
    
    onSelectTemplate({
      challenge_name: template.name,
      challenge_type: template.type,
      target_amount: template.target,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      category: 'category' in template ? template.category : undefined,
      icon: template.icon,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-foreground">Quick Start Templates</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group bg-card border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{template.icon}</span>
                  <Badge variant="secondary" className={template.color}>
                    {template.difficulty}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {template.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {template.duration} days
                  </span>
                  <span className="font-medium text-primary">
                    ${template.target.toLocaleString()} goal
                  </span>
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleSelect(template)}
                >
                  Start Challenge
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
