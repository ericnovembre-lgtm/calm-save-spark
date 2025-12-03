/**
 * DigitalTwinPreview - Preview version of Digital Twin page with mock data
 */

import { useState, useEffect } from "react";
import { VoidBackground } from "@/components/digital-twin/VoidBackground";
import { HUDOverlay } from "@/components/digital-twin/HUDOverlay";
import { HolographicAvatar } from "@/components/digital-twin/HolographicAvatar";
import { TimelineSlider } from "@/components/digital-twin/TimelineSlider";
import { NetWorthCounter } from "@/components/digital-twin/NetWorthCounter";
import { BackgroundMorpher } from "@/components/digital-twin/BackgroundMorpher";
import { LifeEventsSidebar, LifeEvent } from "@/components/digital-twin/LifeEventsSidebar";
import { MonteCarloChart } from "@/components/digital-twin/MonteCarloChart";
import { PreviewWrapper } from "@/components/debug/PreviewWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RotateCcw, BarChart3, MoreVertical, Brain, FolderOpen, GitBranch, Play, Share2, FileDown, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import "@/styles/digital-twin-theme.css";

// Mock profile data
const MOCK_PROFILE = {
  currentAge: 32,
  retirementAge: 65,
  initialNetWorth: 85000,
  annualReturn: 0.07,
  annualSavings: 24000,
};

// Mock life events
const MOCK_INJECTED_EVENTS = [
  {
    year: 35,
    event: {
      id: 'promotion',
      icon: '📈',
      label: 'Career Promotion',
      impact: 25000,
      description: 'Salary increase from promotion',
      color: 'border-green-500',
    },
  },
  {
    year: 38,
    event: {
      id: 'home-purchase',
      icon: '🏠',
      label: 'Home Purchase',
      impact: -80000,
      description: 'Down payment on first home',
      color: 'border-amber-500',
    },
  },
  {
    year: 42,
    event: {
      id: 'child',
      icon: '👶',
      label: 'New Child',
      impact: -15000,
      description: 'First year expenses for new baby',
      color: 'border-pink-500',
    },
  },
];

// Mock Monte Carlo timeline
const generateMockMonteCarloTimeline = (startAge: number, endAge: number, initialNetWorth: number) => {
  const timeline = [];
  let netWorth = initialNetWorth;
  
  for (let age = startAge; age <= endAge; age++) {
    const growth = netWorth * 0.07;
    const savings = 24000;
    netWorth += growth + savings;
    
    // Add event impacts
    const event = MOCK_INJECTED_EVENTS.find(e => e.year === age);
    if (event) {
      netWorth += event.event.impact;
    }
    
    timeline.push({
      year: age,
      median: Math.round(netWorth),
      p10: Math.round(netWorth * 0.7),
      p25: Math.round(netWorth * 0.85),
      p75: Math.round(netWorth * 1.15),
      p90: Math.round(netWorth * 1.35),
    });
  }
  
  return timeline;
};

export default function DigitalTwinPreview() {
  const { currentAge, retirementAge, initialNetWorth } = MOCK_PROFILE;
  
  const [selectedAge, setSelectedAge] = useState(currentAge);
  const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null);
  const [showMonteCarlo, setShowMonteCarlo] = useState(true);
  
  const monteCarloTimeline = generateMockMonteCarloTimeline(currentAge, retirementAge, initialNetWorth);
  
  // Calculate net worth at selected age
  const calculateNetWorth = (age: number) => {
    const yearData = monteCarloTimeline.find(d => d.year === age);
    return yearData?.median || initialNetWorth;
  };
  
  const currentNetWorth = calculateNetWorth(selectedAge);
  
  const healthState = 
    currentNetWorth >= 500000 ? 'thriving' : 
    currentNetWorth >= 0 ? 'neutral' : 
    'struggling';

  const handleEventSelect = (event: LifeEvent) => {
    setSelectedEvent(event);
  };

  return (
    <PreviewWrapper pageName="Digital Twin - Financial Future">
      <div className="relative min-h-screen overflow-hidden bg-[#050505]">
        {/* Background layers */}
        <VoidBackground />
        <BackgroundMorpher netWorth={currentNetWorth} />

        {/* Main content */}
        <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-cyan-500" />
              <h1 className="text-4xl font-bold cinematic-text additive-text">
                ◢◤ DIGITAL TWIN ◥◣
              </h1>
              <Sparkles className="w-8 h-8 text-magenta-500" />
            </div>
            <p className="text-white/60 font-mono text-sm">
              Your Financial Future as a Living Entity
            </p>
          </motion.div>

          {/* Net Worth Counter */}
          <motion.div className="mb-12">
            <NetWorthCounter value={currentNetWorth} age={selectedAge} />
          </motion.div>

          {/* 3D Avatar Container */}
          <motion.div
            className="mx-auto max-w-4xl mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <HUDOverlay>
              <div className="h-96 relative">
                <HolographicAvatar healthState={healthState} />
                
                {/* Drop zone overlay */}
                {selectedEvent && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-cyan-500/10 backdrop-blur-sm border-2 border-dashed border-cyan-500 rounded-lg cursor-pointer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{selectedEvent.icon}</div>
                      <div className="text-white font-mono text-sm">
                        Drop here to add {selectedEvent.label} at age {selectedAge}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </HUDOverlay>
          </motion.div>

          {/* Action Toolbar */}
          <motion.div
            className="fixed top-20 right-16 z-50 flex items-center gap-1.5"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 backdrop-blur-xl bg-black/70 border-white/10 hover:border-green-500 hover:bg-green-500/10"
              title="Save Scenario"
            >
              <FileDown className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowMonteCarlo(!showMonteCarlo)}
              className={cn(
                "h-9 w-9 backdrop-blur-xl bg-black/70 border-white/10",
                showMonteCarlo ? "border-cyan-500 bg-cyan-500/20" : "hover:border-cyan-500 hover:bg-cyan-500/10"
              )}
              title={showMonteCarlo ? 'Hide Projections' : 'Show Projections'}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 backdrop-blur-xl bg-black/70 border-white/10 hover:border-white/30"
              title="Reset Timeline"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 backdrop-blur-xl bg-black/70 border-white/10 hover:border-accent hover:bg-accent/10"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 backdrop-blur-xl bg-slate-950/95 border-white/10"
              >
                <DropdownMenuItem className="gap-2 text-white/80 hover:text-white">
                  <Brain className="w-4 h-4" />
                  Memories
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-white/80 hover:text-white">
                  <FolderOpen className="w-4 h-4" />
                  My Scenarios
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-white/80 hover:text-white">
                  <GitBranch className="w-4 h-4" />
                  Compare Paths
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-white/80 hover:text-white">
                  <Play className="w-4 h-4" />
                  Play Timeline
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-white/80 hover:text-white">
                  <Share2 className="w-4 h-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="gap-2 text-white/80 hover:text-white">
                  <LineChart className="w-4 h-4" />
                  Analytics Dashboard
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          {/* Injected events display */}
          <AnimatePresence>
            {MOCK_INJECTED_EVENTS.length > 0 && (
              <motion.div
                className="fixed top-32 right-16 max-w-xs z-40"
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
              >
                <div className="backdrop-blur-xl bg-slate-950/80 border border-white/10 rounded-xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  <h4 className="text-xs font-mono text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500"
                    />
                    Active Life Events
                  </h4>
                  <div className="space-y-2.5">
                    {MOCK_INJECTED_EVENTS.slice(0, 3).map((item, index) => (
                      <motion.div
                        key={`${item.event.id}-${item.year}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 text-sm group"
                      >
                        <span className="text-lg">{item.event.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">{item.event.label}</div>
                          <div className="text-white/40 text-xs font-mono">Age {item.year}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <motion.div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              item.event.impact >= 0 ? "bg-green-500" : "bg-red-500"
                            )}
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.7, 1, 0.7],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <span className={cn(
                            "text-xs font-mono",
                            item.event.impact >= 0 ? "text-green-400" : "text-red-400"
                          )}>
                            {item.event.impact >= 0 ? '+' : ''}{(item.event.impact / 1000).toFixed(0)}k
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Life Events Sidebar */}
          <LifeEventsSidebar onEventSelect={handleEventSelect} />

          {/* Timeline Slider */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TimelineSlider
              currentAge={currentAge}
              retirementAge={retirementAge}
              onAgeChange={setSelectedAge}
              lifeEvents={MOCK_INJECTED_EVENTS.map(e => ({ year: e.year, label: e.event.label, icon: e.event.icon }))}
            />
          </motion.div>

          {/* Monte Carlo Chart */}
          <AnimatePresence>
            {showMonteCarlo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <MonteCarloChart
                  timeline={monteCarloTimeline.map(d => ({
                    year: d.year,
                    age: d.year,
                    median: d.median,
                    p10: d.p10,
                    p90: d.p90,
                  }))}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PreviewWrapper>
  );
}
