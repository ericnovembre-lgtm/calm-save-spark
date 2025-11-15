import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Target, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { TwinProfileSetup } from "./TwinProfileSetup";
import { TwinAvatar } from "./TwinAvatar";

export function TwinDashboard() {
  const [showSetup, setShowSetup] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['digital-twin-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('digital_twin_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: scenarios } = useQuery({
    queryKey: ['twin-scenarios'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('twin_scenarios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading your digital twin...</div>
      </div>
    );
  }

  if (!profile || showSetup) {
    return <TwinProfileSetup onComplete={() => setShowSetup(false)} />;
  }

  const currentState = profile.current_state as any || {};

  return (
    <div className="space-y-6">
      {/* Avatar and Current State */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Your Digital Twin</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowSetup(true)}>
              Edit Profile
            </Button>
          </div>
          <TwinAvatar 
            age={currentState.age || 30}
            lifeStage={profile.life_stage || 'early-career'}
            netWorth={currentState.netWorth || 0}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Current Financial State</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Net Worth</span>
              </div>
              <span className="font-semibold">
                ${(currentState.netWorth || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Annual Income</span>
              </div>
              <span className="font-semibold">
                ${(currentState.annualIncome || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Age</span>
              </div>
              <span className="font-semibold">{currentState.age || 30}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Life Stage</span>
              </div>
              <span className="font-semibold capitalize">
                {profile.life_stage?.replace('-', ' ')}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Scenarios */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Scenarios</h3>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Scenario
          </Button>
        </div>

        {scenarios && scenarios.length > 0 ? (
          <div className="space-y-3">
            {scenarios.map((scenario, index) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{scenario.scenario_name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {scenario.scenario_type?.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        (scenario.success_probability || 0) >= 75 ? 'text-success' :
                        (scenario.success_probability || 0) >= 50 ? 'text-warning' :
                        'text-destructive'
                      }`}>
                        {scenario.success_probability}%
                      </div>
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No scenarios yet. Create your first scenario to see projections!</p>
          </div>
        )}
      </Card>
    </div>
  );
}
