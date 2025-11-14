import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SwipeableGoalCard } from "./SwipeableGoalCard";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { StaggeredList } from "@/components/animations/StaggeredList";
import { EmptyState } from "@/components/ui/empty-state";
import { useNavigate } from "react-router-dom";

export const GoalsSection = () => {
  const navigate = useNavigate();
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
        <StaggeredList staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <SwipeableGoalCard
              key={goal.id}
              id={goal.id}
              title={goal.name}
              current={parseFloat(String(goal.current_amount || 0))}
              target={parseFloat(String(goal.target_amount))}
              contributionHistory={[150, 200, 175, 225]} // Would come from actual data
            />
          ))}
        </StaggeredList>
      ) : (
        <EmptyState
          icon={Target}
          title="No Goals Yet"
          description="Start your savings journey by creating your first goal! Whether it's a vacation, emergency fund, or dream purchase, we'll help you get there."
          actionLabel="Create Your First Goal"
          onAction={() => navigate('/goals')}
          variant="goals"
        />
      )}
    </div>
  );
};
