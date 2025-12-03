/**
 * CoachPreview - Preview version of Coach page with mock data
 */

import { useState, useRef, useEffect } from "react";
import { Bot, Moon, Sun, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PreviewWrapper } from "@/components/debug/PreviewWrapper";
import { FinancialDNAOrb } from "@/components/coach/FinancialDNAOrb";
import { ScenarioSimulator } from "@/components/coach/ScenarioSimulator";
import { OpportunityRadar } from "@/components/coach/OpportunityRadar";
import { CriticalActionsBar } from "@/components/coach/CriticalActionsBar";
import { WidgetWrapper } from "@/components/coach/WidgetWrapper";

// Mock data
const MOCK_HEALTH_STATE = {
  state: 'stable' as const,
  spendingRate: 45,
  savingsRate: 55,
  totalBalance: 25000,
  weeklySpending: 850,
};

const MOCK_DNA_INSIGHT = "Your financial health is stable. You're maintaining a healthy savings rate of 55% with consistent weekly spending patterns. Consider increasing retirement contributions by 3% to accelerate your wealth-building trajectory.";

const MOCK_CRITICAL_ACTIONS = [
  {
    id: 'action-1',
    type: 'urgent' as const,
    title: 'Optimize Emergency Fund',
    description: 'Your emergency fund covers 4.2 months. Target 6 months.',
    action: () => console.log('Emergency fund action'),
  },
  {
    id: 'action-2',
    type: 'important' as const,
    title: 'Review Subscriptions',
    description: '3 unused subscriptions detected totaling $47/month',
    action: () => console.log('Subscriptions action'),
  },
  {
    id: 'action-3',
    type: 'opportunity' as const,
    title: 'Tax Optimization',
    description: 'Potential $1,200 savings through HSA contributions',
    action: () => console.log('Tax action'),
  },
];

const MOCK_USER_ID = 'preview-user-123';

export default function CoachPreview() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const scenarioSimulatorRef = useRef<HTMLDivElement>(null);
  const scenarioInputRef = useRef<HTMLInputElement>(null);
  const dnaOrbRef = useRef<HTMLDivElement>(null);
  const opportunityRadarRef = useRef<HTMLDivElement>(null);

  // Mock layout state
  const [layout] = useState([
    { id: 'dna-orb', order: 0, isCollapsed: false, isPinned: false },
    { id: 'scenario-simulator', order: 1, isCollapsed: false, isPinned: false },
    { id: 'opportunity-radar', order: 2, isCollapsed: false, isPinned: false },
  ]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <PreviewWrapper pageName="AI Coach - Strategic Command Room">
      <div
        className={`min-h-[calc(100vh-10rem)] p-6 transition-colors relative ${
          isDarkMode ? "bg-command-bg" : "bg-background"
        }`}
      >
        {/* Ambient Background Effects */}
        {isDarkMode && (
          <>
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(hsl(189, 94%, 43%) 1px, transparent 1px), linear-gradient(90deg, hsl(189, 94%, 43%) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }} />
            </div>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                animate={{ y: ['-100%', '200%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-x-0 h-[200px] bg-gradient-to-b from-transparent via-command-cyan/5 to-transparent"
              />
            </div>
          </>
        )}

        {/* Header */}
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
              className={`${isDarkMode ? "border-white/10 bg-command-surface text-white/60 hover:text-white hover:border-command-cyan/50" : ""} transition-all duration-300`}
            >
              <span className="text-xs font-mono">Command Palette</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`${isDarkMode ? "border-white/10 bg-command-surface hover:border-command-cyan/50" : ""} transition-all duration-300`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </motion.div>
        </motion.div>

        {/* Critical Actions Bar */}
        <CriticalActionsBar actions={MOCK_CRITICAL_ACTIONS} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Financial DNA Orb */}
          <motion.div
            ref={dnaOrbRef}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <WidgetWrapper
              id="dna-orb"
              title="Financial DNA"
              isCollapsed={false}
              isPinned={false}
              onToggleCollapse={() => {}}
              onTogglePin={() => {}}
            >
              <FinancialDNAOrb
                state={MOCK_HEALTH_STATE.state}
                insight={MOCK_DNA_INSIGHT}
                financialBreakdown={{
                  spending: MOCK_HEALTH_STATE.weeklySpending,
                  savings: MOCK_HEALTH_STATE.totalBalance * MOCK_HEALTH_STATE.savingsRate / 100,
                  debts: 2500,
                  investments: 15000,
                }}
              />
            </WidgetWrapper>
          </motion.div>

          {/* Scenario Simulator */}
          <motion.div
            ref={scenarioSimulatorRef}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <WidgetWrapper
              id="scenario-simulator"
              title="Scenario Simulator"
              isCollapsed={false}
              isPinned={false}
              onToggleCollapse={() => {}}
              onTogglePin={() => {}}
            >
              <ScenarioSimulator 
                userId={MOCK_USER_ID} 
                inputRef={scenarioInputRef}
                onOpenHistory={() => {}}
                onToggleCompare={() => {}}
                isCompareMode={false}
              />
            </WidgetWrapper>
          </motion.div>
        </div>

        {/* Opportunity Radar */}
        <motion.div
          ref={opportunityRadarRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <WidgetWrapper
            id="opportunity-radar"
            title="Opportunity Radar"
            isCollapsed={false}
            isPinned={false}
            onToggleCollapse={() => {}}
            onTogglePin={() => {}}
          >
            <OpportunityRadar userId={MOCK_USER_ID} />
          </WidgetWrapper>
        </motion.div>

        {/* Floating Chat Button */}
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <Button
            size="lg"
            className="w-14 h-14 rounded-full bg-gradient-to-br from-command-cyan to-command-violet shadow-lg shadow-command-cyan/20"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </motion.div>
      </div>
    </PreviewWrapper>
  );
}
