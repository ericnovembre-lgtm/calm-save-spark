import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Plane, Home, Car, Heart, GraduationCap, Gift, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ANIMATION_DURATION, ANIMATION_EASING, STAGGER_DELAY } from "@/lib/animation-constants";

interface GoalTemplate {
  id: string;
  template_name: string;
  description: string;
  icon: string;
  target_amount: number;
  suggested_timeline_months: number;
  config: any;
  success_rate: number;
  usage_count: number;
  category: string;
}

const iconMap: Record<string, any> = {
  shield: Shield,
  plane: Plane,
  home: Home,
  car: Car,
  heart: Heart,
  'graduation-cap': GraduationCap,
  gift: Gift,
  'trending-down': TrendingDown,
};

export const QuickGoalTemplates = () => {
  const { toast } = useToast();

  const { data: templates, isLoading } = useQuery<GoalTemplate[]>({
    queryKey: ['goal-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goal_templates' as any)
        .select('*')
        .eq('is_active', true)
        .order('success_rate', { ascending: false });
      
      if (error) throw error;
      return data as unknown as GoalTemplate[];
    }
  });

  const handleCreateFromTemplate = async (template: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const deadline = new Date();
      deadline.setMonth(deadline.getMonth() + template.suggested_timeline_months);

      const { error: goalError } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          name: template.template_name,
          target_amount: template.target_amount,
          deadline: deadline.toISOString(),
          icon: template.config?.icon || 'target'
        });

      if (goalError) throw goalError;

      // Increment usage count
      const { error: updateError } = await supabase
        .from('goal_templates' as any)
        .update({ usage_count: (template.usage_count || 0) + 1 })
        .eq('id', template.id);

      if (updateError) console.error('Error updating usage count:', updateError);

      toast({
        title: "Goal Created! 🎯",
        description: `${template.template_name} has been added to your goals.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading templates...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Quick Start Templates</h3>
        <p className="text-sm text-muted-foreground">
          Proven goal templates used by thousands of successful savers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates?.map((template, index) => {
          const Icon = iconMap[template.config?.icon || 'shield'] || Shield;
          const successRate = Math.round((template.success_rate || 0) * 100);

          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: ANIMATION_DURATION.normal / 1000, 
                delay: index * (STAGGER_DELAY.cards / 1000),
                ease: ANIMATION_EASING.smooth 
              }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow hover:border-primary/40 cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-medium text-green-600">
                        {successRate}% success rate
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {template.usage_count || 0} users
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-base">{template.template_name}</CardTitle>
                  <CardDescription className="text-xs">{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Target:</span>
                      <span className="font-semibold">${template.target_amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Timeline:</span>
                      <span className="font-semibold">{template.suggested_timeline_months} months</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleCreateFromTemplate(template)}
                    className="w-full touch-target"
                    size="sm"
                  >
                    Use This Template
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};