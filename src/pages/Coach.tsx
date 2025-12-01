import { useState, useEffect, useRef } from "react";
import { Bot, Moon, Sun, MessageCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { FinancialDNAOrb } from "@/components/coach/FinancialDNAOrb";
import { ScenarioSimulator } from "@/components/coach/ScenarioSimulator";
import { OpportunityRadar } from "@/components/coach/OpportunityRadar";
import { CriticalActionsBar } from "@/components/coach/CriticalActionsBar";
import { ScanningLoader } from "@/components/coach/ScanningLoader";
import { CoachChatDrawer } from "@/components/coach/CoachChatDrawer";
import { CoachQuickActionsMenu } from "@/components/coach/CoachQuickActionsMenu";
import { coachSounds } from "@/lib/coach-sounds";
import { haptics } from "@/lib/haptics";

type HealthState = "stable" | "warning" | "critical";

export default function Coach() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const scenarioSimulatorRef = useRef<HTMLDivElement>(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });

  // Calculate financial health state
  const { data: healthState, isLoading: healthLoading } = useQuery({
    queryKey: ["financial-health-state", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: accounts } = await supabase
        .from("connected_accounts")
        .select("balance")
        .eq("user_id", user.id);

      const { data: transactions } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", user.id)
        .gte("transaction_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance || 0), 0) || 0;
      const weeklySpending = transactions?.reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0) || 0;
      
      const spendingRate = weeklySpending > 0 ? (weeklySpending / (totalBalance + weeklySpending)) * 100 : 0;
      const savingsRate = 100 - spendingRate;

      let state: HealthState = "stable";
      if (totalBalance < weeklySpending * 1.5 || spendingRate > 80) {
        state = "critical";
      } else if (spendingRate > 60 || savingsRate < 20) {
        state = "warning";
      }

      return { state, spendingRate, savingsRate, totalBalance, weeklySpending };
    },
    enabled: !!user?.id,
  });

  // Fetch DNA insight
  const { data: dnaInsight, isLoading: insightLoading } = useQuery({
    queryKey: ["dna-insight", user?.id, healthState?.state],
    queryFn: async () => {
      if (!user?.id || !healthState) return null;

      const { data, error } = await supabase.functions.invoke("generate-dna-insight", {
        body: { userId: user.id, state: healthState.state },
      });

      if (error) throw error;
      return data.insight;
    },
    enabled: !!user?.id && !!healthState,
  });

  // Fetch critical actions dynamically
  const { data: criticalActionsData, isLoading: actionsLoading } = useQuery({
    queryKey: ["critical-actions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase.functions.invoke("generate-critical-actions");

      if (error) throw error;
      return data.actions || [];
    },
    enabled: !!user?.id,
  });

  const criticalActions = (criticalActionsData || []).map((action: any) => ({
    ...action,
    action: () => console.log(`Action: ${action.id}`),
  }));

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleChatButtonPress = () => {
    longPressTimer.current = setTimeout(() => {
      setIsQuickMenuOpen(true);
      haptics.vibrate('medium');
      coachSounds.playQuickMenuOpen();
    }, 500);
  };

  const handleChatButtonRelease = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      if (!isQuickMenuOpen) {
        setIsChatOpen(true);
      }
    }
  };

  const handleScenario = (scenario: string) => {
    scenarioSimulatorRef.current?.scrollIntoView({ behavior: 'smooth' });
    // You can also set the scenario input here if needed
  };

  const handleChatPrompt = (prompt: string) => {
    setIsChatOpen(true);
    // The prompt can be passed to the chat drawer if needed
  };

  const handleScrollToRadar = () => {
    const radarElement = document.querySelector('[data-radar]');
    radarElement?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
          <ScanningLoader text="Authenticating..." />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Helmet>
        <title>AI Financial Coach - Strategic Command Room | $ave+</title>
        <meta
          name="description"
          content="Your Strategic Command Room for financial optimization. Visualize your Financial DNA, simulate scenarios, and discover opportunities."
        />
      </Helmet>

      <div
        className={`min-h-[calc(100vh-10rem)] p-6 transition-colors ${
          isDarkMode ? "bg-command-bg" : "bg-background"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-command-violet/20 border border-command-violet/30">
              <Bot className="w-6 h-6 text-command-violet" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold font-mono ${isDarkMode ? "text-white" : "text-foreground"}`}>
                Strategic Command Room
              </h1>
              <p className={`text-xs font-mono ${isDarkMode ? "text-white/40" : "text-muted-foreground"}`}>
                AI-Powered Financial Analysis
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={isDarkMode ? "border-white/10 bg-command-surface" : ""}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Critical Actions Bar */}
        {!actionsLoading && criticalActions.length > 0 && (
          <CriticalActionsBar actions={criticalActions} />
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Financial DNA Orb */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {healthLoading || insightLoading ? (
              <ScanningLoader text="Analyzing Financial DNA..." className="h-[400px]" />
            ) : (
              <FinancialDNAOrb
                state={healthState?.state || "stable"}
                insight={dnaInsight || "Analyzing your financial health..."}
              />
            )}
          </motion.div>

          {/* Scenario Simulator */}
          <motion.div
            ref={scenarioSimulatorRef}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ScenarioSimulator userId={user.id} />
          </motion.div>
        </div>

        {/* Opportunity Radar */}
        <motion.div
          data-radar
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <OpportunityRadar userId={user.id} />
        </motion.div>

        {/* Floating Chat Button */}
        <motion.div
          className="fixed bottom-6 right-6 z-30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <Button
            size="lg"
            onMouseDown={handleChatButtonPress}
            onMouseUp={handleChatButtonRelease}
            onMouseLeave={handleChatButtonRelease}
            onTouchStart={handleChatButtonPress}
            onTouchEnd={handleChatButtonRelease}
            className="rounded-full w-14 h-14 bg-gradient-to-r from-command-cyan to-command-violet hover:from-command-cyan/80 hover:to-command-violet/80 shadow-lg shadow-command-cyan/20"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </motion.div>

        {/* Quick Actions Menu */}
        <CoachQuickActionsMenu
          isOpen={isQuickMenuOpen}
          onClose={() => setIsQuickMenuOpen(false)}
          onScenario={handleScenario}
          onChatPrompt={handleChatPrompt}
          onScrollToRadar={handleScrollToRadar}
        />

        {/* Chat Drawer */}
        <CoachChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </AppLayout>
  );
}
