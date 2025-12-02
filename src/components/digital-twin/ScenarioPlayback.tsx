import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, FastForward, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PlaybackTimeline } from "./PlaybackTimeline";
import { digitalTwinSounds } from "@/lib/digital-twin-sounds";
import CountUp from "react-countup";

interface ScenarioPlaybackProps {
  open: boolean;
  onClose: () => void;
  currentAge: number;
  retirementAge: number;
  initialNetWorth: number;
  events: Array<{ year: number; event: any }>;
  calculateNetWorth: (age: number) => number;
}

export function ScenarioPlayback({
  open,
  onClose,
  currentAge,
  retirementAge,
  initialNetWorth,
  events,
  calculateNetWorth
}: ScenarioPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackAge, setPlaybackAge] = useState(currentAge);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeEventIndex, setActiveEventIndex] = useState<number | null>(null);
  const [prevNetWorth, setPrevNetWorth] = useState(initialNetWorth);

  const currentNetWorth = calculateNetWorth(Math.floor(playbackAge));
  const progress = ((playbackAge - currentAge) / (retirementAge - currentAge)) * 100;

  // Playback animation
  useEffect(() => {
    if (!isPlaying || !open) return;

    const interval = setInterval(() => {
      setPlaybackAge((prev) => {
        if (prev >= retirementAge) {
          setIsPlaying(false);
          digitalTwinSounds.playMilestone();
          return retirementAge;
        }
        return prev + (0.1 * playbackSpeed);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, retirementAge, open]);

  // Check for events at current age
  useEffect(() => {
    const currentAgeFloor = Math.floor(playbackAge);
    const eventAtAge = events.findIndex(e => e.year === currentAgeFloor);
    
    if (eventAtAge !== -1 && eventAtAge !== activeEventIndex) {
      setActiveEventIndex(eventAtAge);
      const event = events[eventAtAge];
      digitalTwinSounds.playLifeEventDrop(event.event.impact >= 0);
      
      // Reset after animation
      setTimeout(() => setActiveEventIndex(null), 2000);
    }
  }, [playbackAge, events, activeEventIndex]);

  // Track net worth changes
  useEffect(() => {
    const delta = currentNetWorth - prevNetWorth;
    if (Math.abs(delta) > 1000) {
      setPrevNetWorth(currentNetWorth);
    }
  }, [currentNetWorth, prevNetWorth]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setPlaybackAge(currentAge);
    setActiveEventIndex(null);
    setPrevNetWorth(initialNetWorth);
  }, [currentAge, initialNetWorth]);

  const handleSpeedChange = useCallback(() => {
    const speeds = [0.5, 1, 2, 4];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
  }, [playbackSpeed]);

  const handleScrub = useCallback((age: number) => {
    setPlaybackAge(age);
    digitalTwinSounds.playTimelineScrub();
  }, []);

  // Health state for visual feedback
  const healthState = 
    currentNetWorth >= 500000 ? 'thriving' : 
    currentNetWorth >= 0 ? 'neutral' : 
    'struggling';

  const healthColors = {
    thriving: 'from-green-500 to-emerald-500',
    neutral: 'from-cyan-500 to-blue-500',
    struggling: 'from-red-500 to-orange-500'
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] bg-slate-950/95 backdrop-blur-xl border-cyan-500/20 text-white p-0 overflow-hidden">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-white/60 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Main Playback Area */}
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-8 border-b border-white/10">
            <h2 className="text-3xl font-mono font-bold text-cyan-500 text-center">
              ◢◤ SCENARIO PLAYBACK ◥◣
            </h2>
            <p className="text-center text-white/60 text-sm mt-2">
              Watch your financial future unfold over time
            </p>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
            {/* Age Display */}
            <motion.div
              className="text-center"
              animate={{ scale: isPlaying ? [1, 1.02, 1] : 1 }}
              transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
            >
              <div className="text-white/40 text-sm font-mono mb-2">CURRENT AGE</div>
              <div className="text-6xl font-bold font-mono text-white">
                {Math.floor(playbackAge)}
              </div>
            </motion.div>

            {/* Net Worth Display */}
            <motion.div
              className={`relative p-12 rounded-2xl bg-gradient-to-br ${healthColors[healthState]} bg-opacity-10 border-2 border-current backdrop-blur-sm`}
              animate={{
                boxShadow: isPlaying 
                  ? ['0 0 20px rgba(0,255,255,0.3)', '0 0 40px rgba(0,255,255,0.6)', '0 0 20px rgba(0,255,255,0.3)']
                  : '0 0 20px rgba(0,255,255,0.2)'
              }}
              transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
            >
              <div className="text-center">
                <div className="text-white/60 text-sm font-mono mb-2">NET WORTH</div>
                <div className="text-5xl font-bold font-mono">
                  $
                  <CountUp
                    start={prevNetWorth}
                    end={currentNetWorth}
                    duration={0.5}
                    separator=","
                    decimals={0}
                    preserveValue
                  />
                </div>
              </div>

              {/* Milestone Celebration */}
              <AnimatePresence>
                {currentNetWorth >= 1000000 && prevNetWorth < 1000000 && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-6xl">🎉</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Active Event Notification */}
            <AnimatePresence>
              {activeEventIndex !== null && events[activeEventIndex] && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.8 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-8 bg-black/90 backdrop-blur-xl border-2 border-cyan-500 rounded-2xl shadow-2xl"
                >
                  <div className="text-center space-y-4">
                    <div className="text-6xl">{events[activeEventIndex].event.icon}</div>
                    <div className="text-2xl font-bold text-white">
                      {events[activeEventIndex].event.label}
                    </div>
                    <div className={`text-xl font-mono ${events[activeEventIndex].event.impact >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {events[activeEventIndex].event.impact >= 0 ? '+' : ''}
                      ${Math.abs(events[activeEventIndex].event.impact).toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls Area */}
          <div className="p-6 space-y-4 border-t border-white/10 bg-black/40">
            {/* Timeline */}
            <PlaybackTimeline
              currentAge={currentAge}
              retirementAge={retirementAge}
              playbackAge={playbackAge}
              events={events}
              onScrub={handleScrub}
              isPlaying={isPlaying}
            />

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handleReset}
                variant="outline"
                size="icon"
                className="border-white/20 hover:border-cyan-500 hover:bg-cyan-500/10"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 px-8"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Play
                  </>
                )}
              </Button>

              <Button
                onClick={handleSpeedChange}
                variant="outline"
                className="border-white/20 hover:border-cyan-500 hover:bg-cyan-500/10"
              >
                <FastForward className="w-4 h-4 mr-2" />
                {playbackSpeed}x
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="text-center text-sm font-mono text-white/40">
              Progress: {Math.round(progress)}% • 
              {retirementAge - Math.floor(playbackAge)} years to retirement
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}