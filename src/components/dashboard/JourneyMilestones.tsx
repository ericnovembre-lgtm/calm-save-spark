import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SaveplusAnimIcon } from "@/components/icons";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Award, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Milestone {
  id: string;
  milestone_type: string;
  milestone_name: string;
  milestone_description: string | null;
  milestone_icon: string;
  completed_at: string;
}

const JourneyMilestones = () => {
  const prefersReducedMotion = useReducedMotion();
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);

  const { data: milestones, isLoading } = useQuery({
    queryKey: ['user-milestones'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_milestones')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data as Milestone[];
    },
  });

  // Calculate progress percentage
  const totalPossibleMilestones = 5; // onboarding, first_goal, first_pot, first_account, and future ones
  const completedCount = milestones?.length || 0;
  const progressPercentage = Math.min((completedCount / totalPossibleMilestones) * 100, 100);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!milestones || milestones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Your Financial Journey
          </CardTitle>
          <CardDescription>
            Complete actions to unlock milestones and track your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <SaveplusAnimIcon name="trophy" size={64} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Start your journey to unlock your first milestone!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Your Financial Journey
        </CardTitle>
        <CardDescription>
          {completedCount} milestone{completedCount !== 1 ? 's' : ''} unlocked
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Journey Progress</span>
            <span className="font-semibold text-primary">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-2 bg-accent rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-primary/80"
            />
          </div>
        </div>

        {/* Milestone timeline */}
        <div className="space-y-3">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <button
                onClick={() => setExpandedMilestone(
                  expandedMilestone === milestone.id ? null : milestone.id
                )}
                className="w-full text-left"
              >
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
                  {/* Icon */}
                  <div className="shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <SaveplusAnimIcon 
                        name={milestone.milestone_icon as any} 
                        size={20}
                        className="text-primary"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-foreground">
                        {milestone.milestone_name}
                      </h4>
                      <ChevronRight 
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          expandedMilestone === milestone.id ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(milestone.completed_at), 'MMM dd, yyyy')}
                    </p>

                    {/* Expanded description */}
                    {expandedMilestone === milestone.id && milestone.milestone_description && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-muted-foreground mt-2 pt-2 border-t border-border"
                      >
                        {milestone.milestone_description}
                      </motion.p>
                    )}
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default JourneyMilestones;
