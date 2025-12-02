import { motion } from "framer-motion";
import { useCallback } from "react";

interface PlaybackTimelineProps {
  currentAge: number;
  retirementAge: number;
  playbackAge: number;
  events: Array<{ year: number; event: any }>;
  onScrub: (age: number) => void;
  isPlaying: boolean;
}

export function PlaybackTimeline({
  currentAge,
  retirementAge,
  playbackAge,
  events,
  onScrub,
  isPlaying
}: PlaybackTimelineProps) {
  const totalYears = retirementAge - currentAge;
  const progress = ((playbackAge - currentAge) / totalYears) * 100;

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isPlaying) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const newAge = currentAge + (totalYears * percentage / 100);
    onScrub(Math.max(currentAge, Math.min(retirementAge, newAge)));
  }, [currentAge, retirementAge, totalYears, onScrub, isPlaying]);

  // Milestone markers
  const milestones = [
    { age: currentAge, label: 'Start' },
    { age: Math.floor((currentAge + retirementAge) / 2), label: 'Midpoint' },
    { age: retirementAge, label: 'Retirement' }
  ];

  return (
    <div className="space-y-2">
      {/* Timeline Track */}
      <div
        className="relative h-16 bg-muted/30 rounded-lg border border-border cursor-pointer overflow-hidden"
        onClick={handleClick}
      >
        {/* Progress Fill */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent/30 to-accent/50"
          style={{ width: `${progress}%` }}
        />

        {/* Event Markers */}
        {events.map((event, index) => {
          const eventProgress = ((event.year - currentAge) / totalYears) * 100;
          const isActive = Math.floor(playbackAge) === event.year;
          
          return (
            <motion.div
              key={index}
              className="absolute inset-y-0 flex items-center"
              style={{ left: `${eventProgress}%` }}
              animate={{
                scale: isActive ? [1, 1.3, 1] : 1
              }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                {/* Event Icon */}
                <div className={`
                  text-2xl transform -translate-x-1/2 
                  ${isActive ? 'animate-bounce' : ''}
                  ${event.event.impact >= 0 ? 'filter drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'filter drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]'}
                `}>
                  {event.event.icon}
                </div>
                
                {/* Vertical Line */}
                <div className={`
                  absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-4
                  ${event.event.impact >= 0 ? 'bg-green-500' : 'bg-red-500'}
                `} />
              </div>
            </motion.div>
          );
        })}

        {/* Playhead */}
        <motion.div
          className="absolute inset-y-0 w-1 bg-accent shadow-[0_0_10px_hsl(var(--accent)_/_0.8)]"
          style={{ left: `${progress}%` }}
          animate={{
            boxShadow: isPlaying
              ? ['0 0 10px hsl(var(--accent) / 0.8)', '0 0 20px hsl(var(--accent) / 1)', '0 0 10px hsl(var(--accent) / 0.8)']
              : '0 0 10px hsl(var(--accent) / 0.8)'
          }}
          transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
        >
          {/* Playhead Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-accent rounded-full border-2 border-background shadow-lg" />
        </motion.div>

        {/* Milestone Labels */}
        {milestones.map((milestone, index) => {
          const position = ((milestone.age - currentAge) / totalYears) * 100;
          return (
            <div
              key={index}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-px h-3 bg-border" />
              <div className="text-xs font-mono text-muted-foreground mt-1 whitespace-nowrap">
                {milestone.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Age Labels */}
      <div className="flex justify-between text-xs font-mono text-muted-foreground px-2">
        <div>Age {currentAge}</div>
        <div>Age {Math.floor(playbackAge)}</div>
        <div>Age {retirementAge}</div>
      </div>
    </div>
  );
}