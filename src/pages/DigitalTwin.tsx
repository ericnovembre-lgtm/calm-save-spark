import { useState } from "react";
import { VoidBackground } from "@/components/digital-twin/VoidBackground";
import { HUDOverlay } from "@/components/digital-twin/HUDOverlay";
import { HolographicAvatar } from "@/components/digital-twin/HolographicAvatar";
import { TimelineSlider } from "@/components/digital-twin/TimelineSlider";
import { NetWorthCounter } from "@/components/digital-twin/NetWorthCounter";
import { BackgroundMorpher } from "@/components/digital-twin/BackgroundMorpher";
import { LifeEventsSidebar, LifeEvent } from "@/components/digital-twin/LifeEventsSidebar";
import { NarrativeOverlay } from "@/components/digital-twin/NarrativeOverlay";
import { useLifeEventSimulation } from "@/hooks/useLifeEventSimulation";
import { useDigitalTwin } from "@/hooks/useDigitalTwin";
import { motion } from "framer-motion";
import { Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { digitalTwinSounds } from "@/lib/digital-twin-sounds";
import "@/styles/digital-twin-theme.css";

export default function DigitalTwin() {
  const { twinState } = useDigitalTwin();
  
  // Use real user data if available, fallback to defaults
  const currentAge = 30; // TODO: Get from user profile
  const retirementAge = 65;
  const initialNetWorth = 50000; // TODO: Calculate from user's actual accounts
  const riskTolerance = twinState?.risk_tolerance || 0.5;
  const annualReturn = 0.05 + (riskTolerance * 0.05); // 5-10% based on risk
  
  const [selectedAge, setSelectedAge] = useState(currentAge);
  const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null);
  const [eventReaction, setEventReaction] = useState<{ type: 'positive' | 'negative'; timestamp: number } | null>(null);

  const {
    injectedEvents,
    calculateNetWorth,
    addEvent,
    clearEvents,
    calculateRetirementImpact,
  } = useLifeEventSimulation(currentAge, initialNetWorth, annualReturn, 20000);

  const currentNetWorth = calculateNetWorth(selectedAge);

  const healthState = 
    currentNetWorth >= 500000 ? 'thriving' : 
    currentNetWorth >= 0 ? 'neutral' : 
    'struggling';

  const handleAgeChange = (age: number) => {
    setSelectedAge(age);
    digitalTwinSounds.playTimelineScrub();
    
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505]">
      {/* Background layers */}
      <VoidBackground />
      <BackgroundMorpher netWorth={currentNetWorth} />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
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
        <motion.div layoutId="net-worth-counter" className="mb-12">
          <NetWorthCounter value={currentNetWorth} age={selectedAge} />
        </motion.div>

        {/* 3D Avatar Container */}
        <motion.div
          layoutId="avatar-container"
          className="mx-auto max-w-4xl mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
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

        {/* Reset button */}
        <motion.div
          className="fixed top-8 right-8 z-50"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="backdrop-blur-xl bg-black/60 border-white/10 hover:border-cyan-500 hover:bg-cyan-500/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Timeline
          </Button>
        </motion.div>

        {/* Injected events display */}
        {injectedEvents.length > 0 && (
          <motion.div
            className="fixed top-24 right-8 max-w-xs"
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
      <LifeEventsSidebar onEventSelect={handleEventSelect} />

      {/* Narrative Overlay */}
      <NarrativeOverlay
        age={selectedAge}
        netWorth={currentNetWorth}
        lifeEvents={injectedEvents.map(e => ({ year: e.year, label: e.event.label }))}
      />

      {/* Timeline Slider */}
      <TimelineSlider
        currentAge={currentAge}
        retirementAge={retirementAge}
        onAgeChange={handleAgeChange}
        lifeEvents={injectedEvents.map(e => ({
          year: e.year,
          label: e.event.label,
          icon: e.event.icon,
        }))}
      />
    </div>
  );
}
