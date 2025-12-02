import { motion } from 'framer-motion';
import { useState } from 'react';

interface TimelineSliderProps {
  currentAge: number;
  retirementAge: number;
  onAgeChange: (age: number) => void;
  lifeEvents?: Array<{ year: number; label: string; icon: string }>;
  onScrub?: () => void;
}

export function TimelineSlider({ 
  currentAge, 
  retirementAge, 
  onAgeChange,
  lifeEvents = [],
  onScrub
}: TimelineSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedAge, setSelectedAge] = useState(currentAge);

  const milestones = [
    { label: 'Today', age: currentAge },
    { label: '5y', age: currentAge + 5 },
    { label: '10y', age: currentAge + 10 },
    { label: '25y', age: currentAge + 25 },
    { label: 'Retirement', age: retirementAge },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const age = parseInt(e.target.value);
    setSelectedAge(age);
    onAgeChange(age);
    onScrub?.();
  };

  const progress = ((selectedAge - currentAge) / (retirementAge - currentAge)) * 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 py-4 px-8">
      <div className="container mx-auto">
        {/* Timeline track */}
        <div className="relative h-2 bg-white/5 rounded-full mb-8">
          {/* Progress fill */}
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-magenta-500 rounded-full"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />

          {/* Life event markers */}
          {lifeEvents.map((event, idx) => {
            const eventProgress = ((event.year - currentAge) / (retirementAge - currentAge)) * 100;
            return (
              <motion.div
                key={idx}
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow-lg"
                style={{ left: `${eventProgress}%` }}
                whileHover={{ scale: 1.5 }}
                title={`${event.icon} ${event.label} (Age ${event.year})`}
              />
            );
          })}

          {/* Slider thumb */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-cyan-500 rounded-full border-4 border-white shadow-[0_0_20px_rgba(0,255,255,0.8)] cursor-grab active:cursor-grabbing"
            style={{ left: `${progress}%` }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        </div>

        {/* Input slider (invisible, controls the position) */}
        <input
          type="range"
          min={currentAge}
          max={retirementAge}
          value={selectedAge}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className="absolute bottom-8 left-0 right-0 w-full opacity-0 cursor-pointer"
          style={{ height: '40px' }}
        />

        {/* Milestone labels */}
        <div className="relative flex justify-between text-xs font-mono text-white/60">
          {milestones.map((milestone, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="w-px h-4 bg-white/20 mb-2" />
              <span className={selectedAge === milestone.age ? 'text-cyan-500 font-bold' : ''}>
                {milestone.label}
              </span>
              <span className="text-white/40 text-[10px]">Age {milestone.age}</span>
            </div>
          ))}
        </div>

        {/* Current position indicator */}
        <motion.div
          className="text-center mt-4 text-sm font-mono text-cyan-500"
          animate={{ opacity: isDragging ? 1 : 0 }}
        >
          ▲ You are here: Age {selectedAge}
        </motion.div>
      </div>
    </div>
  );
}
