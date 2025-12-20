import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SwipeableGoalCard } from "./SwipeableGoalCard";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { StaggeredList } from "@/components/animations/StaggeredList";
import { EmptyState } from "@/components/ui/empty-state";
import { useNavigate } from "react-router-dom";
import { DashboardWidgetCard } from "./DashboardWidgetCard";

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

  const { data: contributions } = useQuery({
    queryKey: ['goal-contributions', goals?.map(g => g.id)],
    queryFn: async () => {
      if (!goals || goals.length === 0) return {};
      
      const contribMap: Record<string, number[]> = {};
      
      await Promise.all(goals.map(async (goal) => {
        const { data } = await supabase
          .from('transfer_history')
          .select('amount')
          .eq('pot_id', goal.id)
          .order('created_at', { ascending: false })
          .limit(4);
        
        contribMap[goal.id] = data?.map(c => c.amount) || [];
      }));
      
      return contribMap;
    },
    enabled: !!goals && goals.length > 0,
  });

  const goalCount = goals?.length || 0;

  if (isLoading) {
    return (
      <DashboardWidgetCard
        secondaryContent={<span className="text-xs text-muted-foreground">Loading...</span>}
      >
        <div className="space-y-4">
          <h2 className="text-2xl font-display font-semibold text-foreground">Your Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card/50 rounded-lg p-6 h-40 animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardWidgetCard>
    );
  }

  return (
    <DashboardWidgetCard
      secondaryContent={
        goalCount > 0 ? (
          <span className="text-xs text-muted-foreground">
            {goalCount} active goal{goalCount !== 1 ? 's' : ''}
          </span>
        ) : undefined
      }
    >
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
                contributionHistory={contributions?.[goal.id] || []}
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
    </DashboardWidgetCard>
  );
};
