import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Target, TrendingUp } from 'lucide-react';
import { useFeatureLimits } from '@/hooks/useFeatureLimits';
import { LimitIndicator } from '@/components/LimitIndicator';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GoalCard } from '@/components/GoalCard';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  icon: string;
}

export default function Goals() {
  const { toast } = useToast();
  const { goals, canCreate, getUpgradeMessage, refresh } = useFeatureLimits();
  const [goalsList, setGoalsList] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load goals',
        variant: 'destructive',
      });
    } else {
      setGoalsList(data || []);
    }
    setLoading(false);
  };

  const handleCreateGoal = () => {
    if (!canCreate('goals')) {
      toast({
        title: 'Limit Reached',
        description: getUpgradeMessage('goals'),
        variant: 'destructive',
      });
      return;
    }
    
    // TODO: Open create goal dialog
    toast({
      title: 'Coming Soon',
      description: 'Goal creation dialog will be implemented next',
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Savings Goals</h1>
              <p className="text-muted-foreground">
                Track your progress and achieve your financial dreams
              </p>
            </div>
            <Button 
              onClick={handleCreateGoal}
              disabled={!canCreate('goals')}
              size="lg"
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              New Goal
            </Button>
          </div>

          {/* Limit Indicator */}
          <Card className="bg-accent/20">
            <CardContent className="p-4">
              <LimitIndicator
                current={goals.current}
                max={goals.max}
                label="Savings Goals"
                showUpgrade={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Goals Grid */}
        {goalsList.length === 0 ? (
          <Card className="text-center p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">No goals yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first savings goal to get started
                </p>
                <Button onClick={handleCreateGoal} disabled={!canCreate('goals')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Goal
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {goalsList.map((goal) => (
                <GoalCard
                  key={goal.id}
                  title={goal.name}
                  current={goal.current_amount}
                  target={goal.target_amount}
                  emoji={goal.icon || "🎯"}
                />
              ))}
            </div>

            {/* Upgrade Prompt if at limit */}
            {!canCreate('goals') && (
              <UpgradePrompt
                feature="More Savings Goals"
                message={getUpgradeMessage('goals')}
                suggestedAmount={goals.max < 5 ? 1 : goals.max < 10 ? 5 : 9}
              />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
