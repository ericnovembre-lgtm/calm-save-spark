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
import { CoachCommandPalette } from "@/components/coach/CoachCommandPalette";
import { ComparisonTimelineChart } from "@/components/coach/ComparisonTimelineChart";
import { ComparisonSummaryCard } from "@/components/coach/ComparisonSummaryCard";
import { ScenarioHistoryPanel } from "@/components/coach/ScenarioHistoryPanel";
import { useScenarioHistory } from "@/hooks/useScenarioHistory";
import { useCoachLayout } from "@/hooks/useCoachLayout";
import { WidgetWrapper } from "@/components/coach/WidgetWrapper";
import { coachSounds } from "@/lib/coach-sounds";
import { haptics } from "@/lib/haptics";

type HealthState = "stable" | "warning" | "critical";

export default function Coach() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([]);
  const [showConfidenceIntervals, setShowConfidenceIntervals] = useState(true);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const scenarioSimulatorRef = useRef<HTMLDivElement>(null);
  const scenarioInputRef = useRef<HTMLInputElement>(null);
  const dnaOrbRef = useRef<HTMLDivElement>(null);
  const opportunityRadarRef = useRef<HTMLDivElement>(null);

  const { scenarios } = useScenarioHistory();
  const { layout, toggleCollapse, togglePin, resetLayout, getWidgetState } = useCoachLayout();

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

  // Handler functions (defined before hooks that use them)
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
    setTimeout(() => scenarioInputRef.current?.focus(), 300);
  };

  const handleChatPrompt = (prompt: string) => {
    setIsChatOpen(true);
  };

  const handleScrollToRadar = () => {
    opportunityRadarRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToDNA = () => {
    dnaOrbRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToScenario = () => {
    scenarioSimulatorRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => scenarioInputRef.current?.focus(), 300);
  };

  const handleScenarioSimulate = (prompt: string) => {
    handleScrollToScenario();
    // The ScenarioSimulator component will handle the actual simulation
    // We could pass the prompt via state if needed
  };

  const handleEscape = () => {
    setIsCommandPaletteOpen(false);
    setIsChatOpen(false);
    setIsQuickMenuOpen(false);
    setIsHistoryOpen(false);
  };

  const handleCompare = (ids: string[]) => {
    setSelectedScenarioIds(ids);
    setIsCompareMode(true);
    setIsHistoryOpen(false);
    scenarioSimulatorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Prepare comparison data
  const COLORS = [
    { line: 'hsl(189, 94%, 43%)', fill: 'hsl(189, 94%, 43%, 0.15)' },
    { line: 'hsl(258, 90%, 66%)', fill: 'hsl(258, 90%, 66%, 0.15)' },
    { line: 'hsl(142, 71%, 45%)', fill: 'hsl(142, 71%, 45%, 0.15)' },
    { line: 'hsl(38, 92%, 50%)', fill: 'hsl(38, 92%, 50%, 0.15)' },
  ];

  const comparisonScenarios = selectedScenarioIds
    .map((id, index) => {
      const scenario = scenarios.find(s => s.id === id);
      if (!scenario) return null;

      const outcomes = scenario.projected_outcomes as any[];
      const simulated = outcomes?.map(o => ({ date: `${o.year}-01-01`, value: o.median })) || [];
      const confidence = outcomes ? {
        p10: outcomes.map(o => ({ date: `${o.year}-01-01`, value: o.p10 })),
        p90: outcomes.map(o => ({ date: `${o.year}-01-01`, value: o.p90 })),
      } : undefined;

      return {
        id: scenario.id,
        name: scenario.scenario_name || 'Untitled',
        color: COLORS[index % COLORS.length],
        baseline: simulated,
        simulated,
        confidence,
      };
    })
    .filter(Boolean) as any[];

  // Apply dark mode (useEffect must be called after all other hooks)
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

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
        className={`min-h-[calc(100vh-10rem)] p-6 transition-colors relative ${
          isDarkMode ? "bg-command-bg" : "bg-background"
        }`}
      >
        {/* Ambient Background Effects */}
        {isDarkMode && (
          <>
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(hsl(189, 94%, 43%) 1px, transparent 1px), linear-gradient(90deg, hsl(189, 94%, 43%) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }} />
            </div>
            {/* Scan Line Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                animate={{ y: ['-100%', '200%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-x-0 h-[200px] bg-gradient-to-b from-transparent via-command-cyan/5 to-transparent"
              />
            </div>
          </>
        )}

        {/* Header with Entrance Animation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-between mb-6 relative"
        >
          <div className="flex items-center gap-3">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
              className="p-2 rounded-lg bg-command-violet/20 border border-command-violet/30 relative overflow-hidden group"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-command-violet/20 to-transparent"
              />
              <Bot className="w-6 h-6 text-command-violet relative z-10" />
            </motion.div>
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`text-2xl font-bold font-mono ${isDarkMode ? "text-white" : "text-foreground"}`}
              >
                Strategic Command Room
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className={`text-xs font-mono ${isDarkMode ? "text-white/40" : "text-muted-foreground"} flex items-center gap-2`}
              >
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block w-2 h-2 rounded-full bg-command-cyan"
                />
                AI-Powered Financial Analysis
              </motion.p>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center gap-2"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={resetLayout}
              className={`${isDarkMode ? "border-white/10 bg-command-surface text-white/60 hover:text-white hover:border-command-cyan/50" : ""} text-xs font-mono hidden sm:inline-flex transition-all duration-300`}
            >
              Reset Layout
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCommandPaletteOpen(true)}
              className={`${isDarkMode ? "border-white/10 bg-command-surface text-white/60 hover:text-white hover:border-command-cyan/50" : ""} transition-all duration-300`}
            >
              <span className="text-xs font-mono">Command Palette</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`${isDarkMode ? "border-white/10 bg-command-surface hover:border-command-cyan/50" : ""} transition-all duration-300 relative overflow-hidden group`}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isDarkMode ? 0 : 180 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>

        {/* Critical Actions Bar */}
        {!actionsLoading && criticalActions.length > 0 && (
          <CriticalActionsBar actions={criticalActions} />
        )}

        {/* Main Grid - Widget Customizable */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {layout
            .filter(w => w.id === "dna-orb" || w.id === "scenario-simulator")
            .sort((a, b) => a.order - b.order)
            .map((widget) => {
              if (widget.id === "dna-orb") {
                return (
                  <motion.div
                    key="dna-orb"
                    ref={dnaOrbRef}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ order: widget.order }}
                  >
                    <WidgetWrapper
                      id="dna-orb"
                      title="Financial DNA"
                      isCollapsed={widget.isCollapsed}
                      isPinned={widget.isPinned}
                      onToggleCollapse={() => toggleCollapse("dna-orb")}
                      onTogglePin={() => togglePin("dna-orb")}
                    >
                      {healthLoading || insightLoading ? (
                        <ScanningLoader text="Analyzing Financial DNA..." className="h-[400px]" />
                      ) : (
                        <FinancialDNAOrb
                          state={healthState?.state || "stable"}
                          insight={dnaInsight || "Analyzing your financial health..."}
                          financialBreakdown={{
                            spending: healthState?.weeklySpending || 0,
                            savings: (healthState?.totalBalance || 0) * (healthState?.savingsRate || 0) / 100,
                            debts: 0,
                            investments: 0,
                          }}
                        />
                      )}
                    </WidgetWrapper>
                  </motion.div>
                );
              } else if (widget.id === "scenario-simulator") {
                return (
                  <motion.div
                    key="scenario-simulator"
                    ref={scenarioSimulatorRef}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ order: widget.order }}
                  >
                    <WidgetWrapper
                      id="scenario-simulator"
                      title="Scenario Simulator"
                      isCollapsed={widget.isCollapsed}
                      isPinned={widget.isPinned}
                      onToggleCollapse={() => toggleCollapse("scenario-simulator")}
                      onTogglePin={() => togglePin("scenario-simulator")}
                    >
                      <ScenarioSimulator 
                        userId={user.id} 
                        inputRef={scenarioInputRef}
                        onOpenHistory={() => setIsHistoryOpen(true)}
                        onToggleCompare={() => setIsCompareMode(prev => !prev)}
                        isCompareMode={isCompareMode}
                      />
                    </WidgetWrapper>
                  </motion.div>
                );
              }
              return null;
            })}
        </div>

        {/* Comparison View */}
        {isCompareMode && comparisonScenarios.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 mb-6"
          >
            <ComparisonTimelineChart
              scenarios={comparisonScenarios}
              showConfidenceIntervals={showConfidenceIntervals}
              onToggleConfidence={() => setShowConfidenceIntervals(prev => !prev)}
            />
            <ComparisonSummaryCard
              scenarios={comparisonScenarios.map((s, i) => ({
                id: s.id,
                name: s.name,
                color: s.color.line,
                successProbability: scenarios.find(sc => sc.id === s.id)?.success_probability || 0,
                finalNetWorth: {
                  median: s.simulated[s.simulated.length - 1]?.value || 0,
                  p10: s.confidence?.p10[s.confidence.p10.length - 1]?.value || 0,
                  p90: s.confidence?.p90[s.confidence.p90.length - 1]?.value || 0,
                },
                riskLevel: i === 0 ? 'low' : i === 1 ? 'medium' : 'high',
              }))}
            />
          </motion.div>
        )}

        {/* Opportunity Radar - Widget Customizable */}
        <motion.div
          ref={opportunityRadarRef}
          data-radar
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <WidgetWrapper
            id="opportunity-radar"
            title="Opportunity Radar"
            isCollapsed={getWidgetState("opportunity-radar").isCollapsed}
            isPinned={getWidgetState("opportunity-radar").isPinned}
            onToggleCollapse={() => toggleCollapse("opportunity-radar")}
            onTogglePin={() => togglePin("opportunity-radar")}
          >
            <OpportunityRadar userId={user.id} />
          </WidgetWrapper>
        </motion.div>

        {/* Floating Chat Button with Enhanced Animations */}
        <motion.div
          className="fixed bottom-6 right-6 z-30"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
        >
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(6, 182, 212, 0.3)',
                '0 0 40px rgba(6, 182, 212, 0.5)',
                '0 0 20px rgba(6, 182, 212, 0.3)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative"
          >
            <Button
              size="lg"
              onMouseDown={handleChatButtonPress}
              onMouseUp={handleChatButtonRelease}
              onMouseLeave={handleChatButtonRelease}
              onTouchStart={handleChatButtonPress}
              onTouchEnd={handleChatButtonRelease}
              className="rounded-full w-14 h-14 bg-gradient-to-r from-command-cyan to-command-violet hover:from-command-cyan/80 hover:to-command-violet/80 shadow-lg shadow-command-cyan/20 relative overflow-hidden group"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
              <MessageCircle className="w-6 h-6 relative z-10" />
            </Button>
            {/* Pulse rings */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-command-cyan"
            />
          </motion.div>
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

        {/* Command Palette */}
        <CoachCommandPalette
          open={isCommandPaletteOpen}
          onOpenChange={setIsCommandPaletteOpen}
          onScenarioSimulate={handleScenarioSimulate}
          onScrollToDNA={handleScrollToDNA}
          onScrollToScenario={handleScrollToScenario}
          onScrollToRadar={handleScrollToRadar}
          onOpenChat={() => setIsChatOpen(true)}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          isDarkMode={isDarkMode}
        />

        {/* Scenario History Panel */}
        <ScenarioHistoryPanel
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onCompare={handleCompare}
          selectedIds={selectedScenarioIds}
          onSelectionChange={setSelectedScenarioIds}
        />
      </div>
    </AppLayout>
  );
}
