import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Zap, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface SkillTreeProgressProps {
  userId: string;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  progress: number;
  level: number;
  maxLevel: number;
  icon: string;
}

export default function SkillTreeProgress({ userId }: SkillTreeProgressProps) {
  const { data: goals } = useQuery({
    queryKey: ['goals', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data;
    },
  });

  const { data: milestones } = useQuery({
    queryKey: ['milestones', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_milestones')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data;
    },
  });

  // Calculate skills based on user activity
  const skills: Skill[] = [
    {
      id: '1',
      name: 'Goal Setter',
      description: 'Create and complete savings goals',
      progress: goals ? Math.min((goals.length / 5) * 100, 100) : 0,
      level: goals ? Math.min(Math.floor(goals.length / 2), 5) : 0,
      maxLevel: 5,
      icon: 'target',
    },
    {
      id: '2',
      name: 'Milestone Achiever',
      description: 'Unlock achievements and milestones',
      progress: milestones ? Math.min((milestones.length / 10) * 100, 100) : 0,
      level: milestones ? Math.min(Math.floor(milestones.length / 3), 5) : 0,
      maxLevel: 5,
      icon: 'trophy',
    },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'target': return Target;
      case 'zap': return Zap;
      case 'trophy': return Trophy;
      default: return TrendingUp;
    }
  };

  const totalProgress = skills.reduce((sum, skill) => sum + skill.progress, 0) / skills.length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Financial Skills</h2>
        <div className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-semibold">
          {Math.round(totalProgress)}% Complete
        </div>
      </div>

      <div className="space-y-4">
        {skills.map((skill, index) => {
          const Icon = getIcon(skill.icon);
          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{skill.name}</h3>
                    <p className="text-xs text-muted-foreground">{skill.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Lvl {skill.level}/{skill.maxLevel}
                  </span>
                </div>
              </div>
              <Progress value={skill.progress} className="h-2" />
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-muted/50">
        <p className="text-sm text-muted-foreground text-center">
          Keep building your skills to unlock advanced features! 🎯
        </p>
      </div>
    </Card>
  );
}
