import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Leaf, Target, TrendingUp, Award } from "lucide-react";
import { CarbonTracker } from "@/components/sustainability/CarbonTracker";
import { ESGPreferences } from "@/components/sustainability/ESGPreferences";
import { GreenGoals } from "@/components/sustainability/GreenGoals";
import { ESGInvestments } from "@/components/sustainability/ESGInvestments";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Sustainability() {
  const { data: stats } = useQuery({
    queryKey: ['sustainability-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [carbonLogs, goals, investments] = await Promise.all([
        supabase
          .from('carbon_footprint_logs')
          .select('carbon_kg')
          .gte('log_date', thirtyDaysAgo.toISOString()),
        supabase
          .from('sustainable_goals')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),
        supabase
          .from('esg_investments')
          .select('amount'),
      ]);

      const monthlyCarbon = carbonLogs.data?.reduce((sum, log) => sum + parseFloat(log.carbon_kg.toString()), 0) || 0;
      const totalInvestments = investments.data?.reduce((sum, inv) => sum + parseFloat(inv.amount.toString()), 0) || 0;

      return {
        monthlyCarbon: monthlyCarbon.toFixed(2),
        treesNeeded: Math.round(monthlyCarbon / 21.77),
        activeGoals: goals.count || 0,
        esgInvestments: totalInvestments,
      };
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            Sustainable Finance
          </h1>
          <p className="text-muted-foreground">
            Track your carbon footprint and invest in a greener future
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-orbital bg-green-100 dark:bg-green-900">
                <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Carbon</p>
                <p className="text-2xl font-bold">{stats?.monthlyCarbon || 0} kg</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-orbital bg-green-100 dark:bg-green-900">
                <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trees to Offset</p>
                <p className="text-2xl font-bold">{stats?.treesNeeded || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-orbital bg-primary/10">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Green Goals</p>
                <p className="text-2xl font-bold">{stats?.activeGoals || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-orbital bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ESG Invested</p>
                <p className="text-2xl font-bold">${stats?.esgInvestments?.toFixed(0) || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="carbon" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="carbon">
              <Leaf className="w-4 h-4 mr-2" />
              Carbon Tracker
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="w-4 h-4 mr-2" />
              Green Goals
            </TabsTrigger>
            <TabsTrigger value="investments">
              <TrendingUp className="w-4 h-4 mr-2" />
              ESG Investments
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Award className="w-4 h-4 mr-2" />
              ESG Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="carbon" className="mt-6">
            <CarbonTracker />
          </TabsContent>

          <TabsContent value="goals" className="mt-6">
            <GreenGoals />
          </TabsContent>

          <TabsContent value="investments" className="mt-6">
            <ESGInvestments />
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <ESGPreferences />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
