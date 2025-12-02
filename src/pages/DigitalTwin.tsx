import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { VoidBackground } from "@/components/digital-twin/VoidBackground";
import { HUDOverlay } from "@/components/digital-twin/HUDOverlay";
import { HolographicAvatar } from "@/components/digital-twin/HolographicAvatar";
import { TimelineSlider } from "@/components/digital-twin/TimelineSlider";
import { NetWorthCounter } from "@/components/digital-twin/NetWorthCounter";
import { BackgroundMorpher } from "@/components/digital-twin/BackgroundMorpher";
import { LifeEventsSidebar, LifeEvent } from "@/components/digital-twin/LifeEventsSidebar";
import { NarrativeOverlay } from "@/components/digital-twin/NarrativeOverlay";
import { MonteCarloChart } from "@/components/digital-twin/MonteCarloChart";
import { ScenarioComparisonMode } from "@/components/digital-twin/ScenarioComparisonMode";
import { EnhancedScenarioComparison } from "@/components/digital-twin/EnhancedScenarioComparison";
import { useLifeEventSimulation } from "@/hooks/useLifeEventSimulation";
import { useDigitalTwinProfile } from "@/hooks/useDigitalTwinProfile";
import { ProfileRequiredPrompt } from "@/components/digital-twin/ProfileRequiredPrompt";
import { DigitalTwinMinimap, DESKTOP_SECTIONS } from "@/components/digital-twin/DigitalTwinMinimap";
import { useVisibleSection } from "@/hooks/useVisibleSection";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RotateCcw, Loader2, BarChart3, GitBranch, FileDown, Share2, Play, FolderOpen, Brain, MoreVertical, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScenarioExportModal } from "@/components/digital-twin/ScenarioExportModal";
import { ShareScenarioModal } from "@/components/digital-twin/ShareScenarioModal";
import { ScenarioPlayback } from "@/components/digital-twin/ScenarioPlayback";
import { SaveScenarioModal } from "@/components/digital-twin/SaveScenarioModal";
import { SavedScenariosPanel } from "@/components/digital-twin/SavedScenariosPanel";
import { DigitalTwinTour } from "@/components/digital-twin/DigitalTwinTour";
import { MemoryExplorerPanel } from "@/components/digital-twin/MemoryExplorerPanel";
import { useDigitalTwinTour } from "@/hooks/useDigitalTwinTour";
import { SavedScenario } from "@/hooks/useScenarioHistory";
import { toast } from "sonner";
import { digitalTwinSounds } from "@/lib/digital-twin-sounds";
import { AppLayout } from "@/components/layout/AppLayout";
import { TwinChatPanel } from "@/components/digital-twin/TwinChatPanel";
import "@/styles/digital-twin-theme.css";

export default function DigitalTwin() {
  const navigate = useNavigate();
  const { profile, isLoading, hasProfile } = useDigitalTwinProfile();
  const isMobile = useIsMobile();
  
  // Use real user data from profile
  const currentAge = profile?.currentAge || 30;
  const retirementAge = profile?.retirementAge || 65;
  const initialNetWorth = profile?.initialNetWorth || 50000;
  const annualReturn = profile?.annualReturn || 0.07;
  const annualSavings = profile?.annualSavings || 20000;
  
  const [selectedAge, setSelectedAge] = useState(currentAge);
  const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null);
  const [eventReaction, setEventReaction] = useState<{ type: 'positive' | 'negative'; timestamp: number } | null>(null);
  const [showMonteCarlo, setShowMonteCarlo] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [savedScenario, setSavedScenario] = useState<any>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPlayback, setShowPlayback] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  const [showMemoryExplorer, setShowMemoryExplorer] = useState(false);
  const [showEnhancedComparison, setShowEnhancedComparison] = useState(false);

  const {
    injectedEvents,
    calculateNetWorth,
    addEvent,
    clearEvents,
    loadScenario,
    calculateRetirementImpact,
    monteCarloTimeline,
    generateMonteCarloProjection,
  } = useLifeEventSimulation(currentAge, initialNetWorth, annualReturn, annualSavings);

  // Digital Twin Tour
  const { run: tourRun, steps: tourSteps, stepIndex: tourStepIndex, handleJoyrideCallback } = useDigitalTwinTour(addEvent);

  // Mini-map section tracking - must be before any early returns to follow React hooks rules
  const sectionIds = DESKTOP_SECTIONS.map(s => s.id);
  const activeSection = useVisibleSection(sectionIds);

  // Generate Monte Carlo on mount and when events change
  useEffect(() => {
    generateMonteCarloProjection();
  }, [injectedEvents, generateMonteCarloProjection]);

  const currentNetWorth = calculateNetWorth(selectedAge);

  const healthState = 
    currentNetWorth >= 500000 ? 'thriving' : 
    currentNetWorth >= 0 ? 'neutral' : 
    'struggling';

  const handleAgeChange = (age: number) => {
    setSelectedAge(age);
    
    // Check for milestones
    const netWorth = calculateNetWorth(age);
    if (netWorth >= 1000000 && calculateNetWorth(age - 1) < 1000000) {
      digitalTwinSounds.playMilestone();
    }
  };

  const handleEventSelect = (event: LifeEvent) => {
    setSelectedEvent(event);
  };

  const handleEventDrop = () => {
    if (!selectedEvent) return;
    
    addEvent(selectedEvent, selectedAge);
    digitalTwinSounds.playLifeEventDrop(selectedEvent.impact >= 0);
    
    // Trigger avatar reaction
    setEventReaction({
      type: selectedEvent.impact >= 0 ? 'positive' : 'negative',
      timestamp: Date.now()
    });
    
    // Calculate retirement impact
    const impact = calculateRetirementImpact(1000000);
    const delayText = impact.delay > 0
      ? `delays retirement by ${Math.abs(impact.delay)} years`
      : impact.delay < 0
      ? `accelerates retirement by ${Math.abs(impact.delay)} years`
      : `has minimal impact on retirement`;
    
    toast.success(`${selectedEvent.icon} ${selectedEvent.label} added at age ${selectedAge} - ${delayText}`);
    setSelectedEvent(null);
  };

  const handleReset = () => {
    clearEvents();
    setSelectedAge(currentAge);
    toast.info('Timeline reset to baseline');
  };

  const handleSaveScenario = () => {
    setShowSaveModal(true);
  };

  const handleLoadScenario = (scenario: SavedScenario) => {
    const events = (scenario.parameters as any)?.events || [];
    loadScenario(events);
    toast.success(`Loaded: ${scenario.scenario_name}`);
  };

  const handleSaveForComparison = () => {
    const timeline = Array.from({ length: 40 }, (_, i) => ({
      year: currentAge + i,
      netWorth: calculateNetWorth(currentAge + i),
    }));
    
    setSavedScenario({
      id: 'path-a',
      name: 'Current Path',
      events: injectedEvents.map(e => ({
        year: e.year,
        label: e.event.label,
        impact: e.event.impact,
      })),
      timeline,
    });
    
    toast.success('Current scenario saved as Path A');
  };

  const handleCompare = () => {
    if (!savedScenario) {
      handleSaveForComparison();
      return;
    }
    setShowComparison(true);
  };

  // Create alternate scenario for comparison
  const alternateScenario = {
    id: 'path-b',
    name: 'Alternate Path',
    events: injectedEvents.map(e => ({
      year: e.year,
      label: e.event.label,
      impact: e.event.impact,
    })),
    timeline: Array.from({ length: 40 }, (_, i) => ({
      year: currentAge + i,
      netWorth: calculateNetWorth(currentAge + i),
    })),
  };

  // Show loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
            <p className="text-white/60 font-mono">Initializing Digital Twin...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show setup prompt if no profile
  if (!hasProfile) {
    return (
      <AppLayout>
        <ProfileRequiredPrompt />
      </AppLayout>
    );
  }

  // Mobile layout handler for scenario creation
  const handleMobileScenarioCreated = (event: any) => {
    if (event) {
      const lifeEvent: LifeEvent = {
        id: event.event_type || 'custom',
        icon: event.icon || '⭐',
        label: event.label || 'Custom Event',
        impact: event.financial_impact || 0,
        description: event.description || '',
        color: 'border-cyan-500'
      };
      addEvent(lifeEvent, event.year || selectedAge);
    }
  };

  // Mobile layout
  if (isMobile) {
    const { MobileDigitalTwinLayout } = require('@/components/digital-twin/MobileDigitalTwinLayout');
    return (
      <AppLayout>
        <MobileDigitalTwinLayout
          currentAge={currentAge}
          retirementAge={retirementAge}
          selectedAge={selectedAge}
          currentNetWorth={currentNetWorth}
          healthState={healthState}
          injectedEvents={injectedEvents}
          monteCarloTimeline={monteCarloTimeline}
          onAgeChange={handleAgeChange}
          onEventSelect={handleEventSelect}
          onEventDrop={handleEventDrop}
          onReset={handleReset}
          onSaveScenario={handleSaveScenario}
          selectedEvent={selectedEvent}
          eventReaction={eventReaction}
          onScenarioCreated={handleMobileScenarioCreated}
          onShowMemories={() => setShowMemoryExplorer(true)}
          onShowSavedScenarios={() => setShowSavedPanel(true)}
          onShowComparison={() => setShowEnhancedComparison(true)}
          onShowShare={() => setShowShareModal(true)}
        />
      </AppLayout>
    );
  }

  const handleMinimapNavigate = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <AppLayout>
      <div className="relative min-h-screen overflow-hidden bg-[#050505]">
      {/* Background layers */}
      <VoidBackground />
      <BackgroundMorpher netWorth={currentNetWorth} />

      {/* Mini-map Navigation */}
      <DigitalTwinMinimap
        activeSection={activeSection}
        onSectionClick={handleMinimapNavigate}
      />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
        {/* Header */}
        <motion.div
          id="header-section"
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
        <motion.div id="net-worth-section" layoutId="net-worth-counter" className="mb-12">
          <NetWorthCounter value={currentNetWorth} age={selectedAge} />
        </motion.div>

        {/* 3D Avatar Container */}
        <motion.div
          id="avatar-section"
          layoutId="avatar-container"
          className="mx-auto max-w-4xl mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          data-tour="dt-avatar"
        >
          <HUDOverlay>
            <div className="h-96 relative">
              <HolographicAvatar 
                healthState={healthState} 
                onEventDrop={eventReaction}
              />
              
              {/* Drop zone overlay */}
              {selectedEvent && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-cyan-500/10 backdrop-blur-sm border-2 border-dashed border-cyan-500 rounded-lg cursor-pointer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleEventDrop}
                  onDrop={handleEventDrop}
                  onDragOver={(e) => e.preventDefault()}
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

        {/* Compact Action Toolbar */}
        <motion.div
          className="fixed top-20 right-16 z-50 flex items-center gap-1.5"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Primary action icons */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleSaveScenario}
            data-tour="dt-save"
            className="h-9 w-9 backdrop-blur-xl bg-black/70 border-white/10 hover:border-green-500 hover:bg-green-500/10"
            title="Save Scenario"
          >
            <FileDown className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowMonteCarlo(!showMonteCarlo)}
            data-tour="dt-projections"
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
            onClick={handleReset}
            className="h-9 w-9 backdrop-blur-xl bg-black/70 border-white/10 hover:border-white/30"
            title="Reset Timeline"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          {/* Dropdown for all secondary actions */}
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
              <DropdownMenuItem onClick={() => setShowMemoryExplorer(true)} className="gap-2 text-white/80 hover:text-white">
                <Brain className="w-4 h-4" />
                Memories
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSavedPanel(true)} className="gap-2 text-white/80 hover:text-white">
                <FolderOpen className="w-4 h-4" />
                My Scenarios
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowEnhancedComparison(true)} className="gap-2 text-white/80 hover:text-white">
                <GitBranch className="w-4 h-4" />
                Compare Paths
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowPlayback(true)} className="gap-2 text-white/80 hover:text-white">
                <Play className="w-4 h-4" />
                Play Timeline
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowShareModal(true)} data-tour="dt-share" className="gap-2 text-white/80 hover:text-white">
                <Share2 className="w-4 h-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowExportModal(true)} className="gap-2 text-white/80 hover:text-white">
                <FileDown className="w-4 h-4" />
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={() => navigate('/digital-twin/analytics')} className="gap-2 text-white/80 hover:text-white">
                <LineChart className="w-4 h-4" />
                Analytics Dashboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        {/* Injected events display - positioned below toolbar */}
        {injectedEvents.length > 0 && (
          <motion.div
            className="fixed top-32 right-16 max-w-xs z-40"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="backdrop-blur-xl bg-black/60 border border-white/10 rounded-lg p-4">
              <h3 className="text-xs font-mono text-white/60 mb-2">ACTIVE EVENTS</h3>
              <div className="space-y-2">
                {injectedEvents.map((e) => (
                  <div key={e.id} className="text-xs font-mono text-white flex items-center gap-2">
                    <span>{e.event.icon}</span>
                    <span>{e.event.label}</span>
                    <span className="text-white/40">Age {e.year}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Life Events Sidebar */}
      <div id="events-section" data-tour="dt-events">
        <LifeEventsSidebar onEventSelect={handleEventSelect} />
      </div>

      {/* Narrative Overlay */}
      <NarrativeOverlay
        age={selectedAge}
        netWorth={currentNetWorth}
        lifeEvents={injectedEvents.map(e => ({ year: e.year, label: e.event.label }))}
      />

      {/* Timeline Slider */}
      <div id="timeline-section" data-tour="dt-timeline">
        <TimelineSlider
          currentAge={currentAge}
          retirementAge={retirementAge}
          onAgeChange={handleAgeChange}
          onScrub={() => digitalTwinSounds.playTimelineScrub()}
          lifeEvents={injectedEvents.map(e => ({
            year: e.year,
            label: e.event.label,
            icon: e.event.icon,
          }))}
        />
      </div>

      {/* Monte Carlo Panel */}
      <AnimatePresence>
        {showMonteCarlo && monteCarloTimeline.length > 0 && (
          <motion.div
            id="projections-section"
            className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-40"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
          >
            <MonteCarloChart timeline={monteCarloTimeline} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scenario Comparison Mode */}
      <AnimatePresence>
        {showComparison && savedScenario && (
          <ScenarioComparisonMode
            onClose={() => setShowComparison(false)}
            baseScenario={savedScenario}
            alternateScenario={alternateScenario}
          />
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <ScenarioExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        scenarioData={{
          name: 'Digital Twin Scenario',
          currentAge,
          retirementAge,
          initialNetWorth,
          events: injectedEvents,
          timeline: Array.from({ length: retirementAge - currentAge }, (_, i) => ({
            year: currentAge + i,
            netWorth: calculateNetWorth(currentAge + i),
          })),
          monteCarloData: monteCarloTimeline,
          comparison: savedScenario && alternateScenario ? {
            pathA: savedScenario,
            pathB: alternateScenario,
          } : undefined,
        }}
      />

      {/* Share Modal */}
      <ShareScenarioModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        scenarioData={{
          name: 'Digital Twin Scenario',
          currentAge,
          retirementAge,
          initialNetWorth,
          events: injectedEvents,
          timeline: Array.from({ length: retirementAge - currentAge }, (_, i) => ({
            year: currentAge + i,
            netWorth: calculateNetWorth(currentAge + i),
          })),
          monteCarloData: monteCarloTimeline,
        }}
      />

      {/* Playback Modal */}
      <ScenarioPlayback
        open={showPlayback}
        onClose={() => setShowPlayback(false)}
        currentAge={currentAge}
        retirementAge={retirementAge}
        initialNetWorth={initialNetWorth}
        events={injectedEvents}
        calculateNetWorth={calculateNetWorth}
      />

      {/* Save Scenario Modal */}
      <SaveScenarioModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        scenarioData={{
          events: injectedEvents,
          timeline: Array.from({ length: retirementAge - currentAge }, (_, i) => ({
            year: currentAge + i,
            netWorth: calculateNetWorth(currentAge + i),
          })),
          monteCarloData: monteCarloTimeline,
          currentAge,
          retirementAge,
        }}
      />

      {/* Saved Scenarios Panel */}
      <SavedScenariosPanel
        open={showSavedPanel}
        onClose={() => setShowSavedPanel(false)}
        onLoadScenario={handleLoadScenario}
      />

      {/* Memory Explorer Panel */}
      <MemoryExplorerPanel
        open={showMemoryExplorer}
        onClose={() => setShowMemoryExplorer(false)}
      />

      {/* Enhanced Scenario Comparison */}
      <EnhancedScenarioComparison
        open={showEnhancedComparison}
        onClose={() => setShowEnhancedComparison(false)}
        currentAge={currentAge}
        initialNetWorth={initialNetWorth}
        annualReturn={annualReturn}
        annualSavings={annualSavings}
      />

      {/* Digital Twin Tour */}
      <DigitalTwinTour
        run={tourRun}
        steps={tourSteps}
        stepIndex={tourStepIndex}
        onCallback={handleJoyrideCallback}
      />

      {/* AI Chat Panel with NL Scenario Creation */}
      <div id="chat-section">
        <TwinChatPanel 
          currentAge={currentAge}
          onScenarioCreated={(event) => {
            // Add the parsed event to timeline
            const totalImpact = event.financial_impact + (event.ongoing_impact * 12);
            addEvent({
              id: event.event_type,
              label: event.label,
              icon: event.icon,
              impact: totalImpact,
              description: `${totalImpact >= 0 ? '+' : ''}$${Math.abs(totalImpact).toLocaleString()} impact`,
              color: totalImpact >= 0 ? 'border-green-500' : 'border-red-500',
            }, event.year);
            
            // Recalculate Monte Carlo
            generateMonteCarloProjection();
          }}
        />
      </div>
    </div>
    </AppLayout>
  );
}
