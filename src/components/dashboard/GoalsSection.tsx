import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GoalProgressCard } from "./GoalProgressCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export const GoalsSection = () => {
  const prefersReducedMotion = useReducedMotion();
  
  const { data: goals, isLoading } = useQuery({
    queryKey: ['dashboard-goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pots')
        .select('*')
        .eq('is_active', true)
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-display font-semibold text-foreground">Your Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-lg p-6 h-40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-semibold text-foreground">Your Goals</h2>
        <Link to="/goals">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </Link>
      </div>

      {goals && goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1] 
              }}
            >
              <GoalProgressCard
                id={goal.id}
                name={goal.name}
                currentAmount={parseFloat(String(goal.current_amount || 0))}
                targetAmount={parseFloat(String(goal.target_amount))}
                icon={goal.icon}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg p-12 text-center shadow-[var(--shadow-card)]">
          <h3 className="text-lg font-semibold mb-2 text-foreground">No goals yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first savings goal to start tracking your progress
          </p>
          <Link to="/goals">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
