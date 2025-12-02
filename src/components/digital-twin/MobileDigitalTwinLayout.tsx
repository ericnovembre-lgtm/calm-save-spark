import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, BarChart3, FileDown, MessageSquare, TrendingUp, User, Clock, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileCollapsibleSection } from './MobileCollapsibleSection';
import { HorizontalLifeEvents, LifeEvent } from './HorizontalLifeEvents';
import { HolographicAvatar } from './HolographicAvatar';
import { NetWorthCounter } from './NetWorthCounter';
import { MonteCarloChart } from './MonteCarloChart';
import { MobileTwinChatSheet } from './MobileTwinChatSheet';
import { VoidBackground } from './VoidBackground';
import { BackgroundMorpher } from './BackgroundMorpher';
import { DigitalTwinMinimap, MOBILE_SECTIONS } from './DigitalTwinMinimap';
import { useVisibleSection } from '@/hooks/useVisibleSection';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';
import { soundEffects } from '@/lib/sound-effects';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface InjectedEvent {
  id: string;
  event: LifeEvent;
  year: number;
}

interface MobileDigitalTwinLayoutProps {
  currentAge: number;
  retirementAge: number;
  selectedAge: number;
  currentNetWorth: number;
  healthState: 'thriving' | 'neutral' | 'struggling';
  injectedEvents: InjectedEvent[];
  monteCarloTimeline: any;
  onAgeChange: (age: number) => void;
  onEventSelect: (event: LifeEvent) => void;
  onEventDrop: () => void;
  onReset: () => void;
  onSaveScenario: () => void;
  selectedEvent: LifeEvent | null;
  eventReaction: { type: 'positive' | 'negative'; timestamp: number } | null;
  onScenarioCreated?: (event: any) => void;
}

export function MobileDigitalTwinLayout({
  currentAge,
  retirementAge,
  selectedAge,
  currentNetWorth,
  healthState,
  injectedEvents,
  monteCarloTimeline,
  onAgeChange,
  onEventSelect,
  onEventDrop,
  onReset,
  onSaveScenario,
  selectedEvent,
  eventReaction,
  onScenarioCreated
}: MobileDigitalTwinLayoutProps) {
  const [showMonteCarlo, setShowMonteCarlo] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [sectionStates, setSectionStates] = useState<Record<string, boolean>>({
    'financial-status-section': true,
    'twin-avatar-section': true,
    'life-events-section': true,
    'timeline-section': true,
    'projections-section': false,
  });
  const prefersReducedMotion = useReducedMotion();

  // Mini-map section tracking
  const sectionIds = MOBILE_SECTIONS.map(s => s.id);
  const activeSection = useVisibleSection(sectionIds);

  const progress = ((selectedAge - currentAge) / (retirementAge - currentAge)) * 100;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAgeChange(parseInt(e.target.value));
  };

  const handleFabClick = () => {
    if (!prefersReducedMotion) {
      haptics.buttonPress();
      soundEffects.click();
    }
    setIsChatOpen(true);
  };

  const handleMinimapNavigate = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Open the section if it's collapsed
      setSectionStates(prev => ({ ...prev, [sectionId]: true }));
    }
  };

  const handleSectionOpenChange = (sectionId: string, isOpen: boolean) => {
    setSectionStates(prev => ({ ...prev, [sectionId]: isOpen }));
  };

  return (
    <div className="relative min-h-screen bg-[#050505] overflow-hidden">
      {/* Background */}
      <VoidBackground />
      <BackgroundMorpher netWorth={currentNetWorth} />

      {/* Mini-map Navigation */}
      <DigitalTwinMinimap
        sections={MOBILE_SECTIONS}
        activeSection={activeSection}
        onSectionClick={handleMinimapNavigate}
      />

      {/* Scrollable content */}
      <div className="relative z-10 pb-24 px-4 pl-14 pt-4 space-y-4">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-cyan-500" />
            <h1 className="text-xl font-bold cinematic-text">DIGITAL TWIN</h1>
            <Sparkles className="w-5 h-5 text-violet-500" />
          </div>
        </motion.div>

        {/* Financial Status Section */}
        <MobileCollapsibleSection 
          id="financial-status-section"
          title="Financial Status" 
          icon={TrendingUp}
          defaultOpen={true}
          isOpen={sectionStates['financial-status-section']}
          onOpenChange={(open) => handleSectionOpenChange('financial-status-section', open)}
        >
          <div className="scale-75 origin-center -my-4">
            <NetWorthCounter value={currentNetWorth} age={selectedAge} />
          </div>
        </MobileCollapsibleSection>

        {/* Avatar Section */}
        <MobileCollapsibleSection 
          id="twin-avatar-section"
          title="Your Digital Twin" 
          icon={User}
          defaultOpen={true}
          isOpen={sectionStates['twin-avatar-section']}
          onOpenChange={(open) => handleSectionOpenChange('twin-avatar-section', open)}
        >
          <div className="h-64 relative">
            <HolographicAvatar 
              healthState={healthState} 
              onEventDrop={eventReaction}
            />
            
            {/* Drop zone overlay */}
            {selectedEvent && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-cyan-500/10 backdrop-blur-sm border-2 border-dashed border-cyan-500 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onEventDrop}
              >
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">{selectedEvent.icon}</div>
                  <div className="text-white font-mono text-xs">
                    Tap to add {selectedEvent.label} at age {selectedAge}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Active events */}
          {injectedEvents.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {injectedEvents.map((e) => (
                <div 
                  key={e.id} 
                  className="text-xs font-mono text-white/80 bg-white/5 px-2 py-1 rounded-full flex items-center gap-1"
                >
                  <span>{e.event.icon}</span>
                  <span>Age {e.year}</span>
                </div>
              ))}
            </div>
          )}
        </MobileCollapsibleSection>

        {/* Life Events Strip */}
        <div id="life-events-section" className="backdrop-blur-xl bg-slate-950/80 border border-cyan-500/20 rounded-xl overflow-hidden">
          <HorizontalLifeEvents 
            onEventSelect={onEventSelect}
            selectedEvent={selectedEvent}
          />
        </div>

        {/* Timeline Section */}
        <MobileCollapsibleSection 
          id="timeline-section"
          title="Timeline" 
          icon={Clock}
          defaultOpen={true}
          isOpen={sectionStates['timeline-section']}
          onOpenChange={(open) => handleSectionOpenChange('timeline-section', open)}
        >
          <div className="space-y-4">
            {/* Slider */}
            <div className="relative">
              <div className="h-2 bg-muted/30 rounded-full relative">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
                
                {/* Event markers */}
                {injectedEvents.map((event) => {
                  const eventProgress = ((event.year - currentAge) / (retirementAge - currentAge)) * 100;
                  return (
                    <div
                      key={event.id}
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white"
                      style={{ left: `${eventProgress}%` }}
                    />
                  );
                })}
              </div>
              
              <input
                type="range"
                min={currentAge}
                max={retirementAge}
                value={selectedAge}
                onChange={handleSliderChange}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
                style={{ height: '44px', marginTop: '-16px' }}
              />
            </div>

            {/* Labels */}
            <div className="flex justify-between text-xs font-mono text-muted-foreground">
              <div className="text-center">
                <div className="text-cyan-400">Today</div>
                <div className="text-white/40">Age {currentAge}</div>
              </div>
              <div className="text-center">
                <div className="text-violet-400 font-bold">Age {selectedAge}</div>
              </div>
              <div className="text-center">
                <div className="text-cyan-400">Retire</div>
                <div className="text-white/40">Age {retirementAge}</div>
              </div>
            </div>
          </div>
        </MobileCollapsibleSection>

        {/* Projections Section */}
        <MobileCollapsibleSection 
          id="projections-section"
          title="Monte Carlo Projections" 
          icon={BarChart3}
          defaultOpen={false}
          isOpen={sectionStates['projections-section']}
          onOpenChange={(open) => handleSectionOpenChange('projections-section', open)}
        >
          {monteCarloTimeline && monteCarloTimeline.length > 0 ? (
            <div className="h-48">
              <MonteCarloChart timeline={monteCarloTimeline} />
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/40 text-sm">
              Loading projections...
            </div>
          )}
        </MobileCollapsibleSection>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveScenario}
            className="flex-1 backdrop-blur-xl bg-black/60 border-white/10"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="flex-1 backdrop-blur-xl bg-black/60 border-white/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Floating Chat FAB */}
      <motion.button
        onClick={handleFabClick}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full",
          "bg-gradient-to-r from-cyan-500 to-violet-500",
          "shadow-2xl shadow-cyan-500/30",
          "flex items-center justify-center"
        )}
        whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
      >
        <MessageSquare className="w-6 h-6 text-white" />
      </motion.button>

      {/* Chat Bottom Sheet */}
      <MobileTwinChatSheet 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentAge={currentAge}
        onScenarioCreated={onScenarioCreated}
      />
    </div>
  );
}
