import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ComplexityLevel = 'beginner' | 'intermediate' | 'expert';

interface Props {
  onLevelChange: (level: ComplexityLevel) => void;
}

export function AdaptiveComplexity({ onLevelChange }: Props) {
  const [level, setLevel] = useState<ComplexityLevel>('intermediate');
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    // Simulate AI detecting user expertise
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const cycleLevel = () => {
    const levels: ComplexityLevel[] = ['beginner', 'intermediate', 'expert'];
    const currentIndex = levels.indexOf(level);
    const nextLevel = levels[(currentIndex + 1) % levels.length];
    setLevel(nextLevel);
    onLevelChange(nextLevel);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-20 right-20 z-40"
    >
      <Button
        onClick={cycleLevel}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Layers className="w-4 h-4" />
        <span className="capitalize">{level}</span>
        {level === 'beginner' && <ChevronUp className="w-3 h-3" />}
        {level === 'intermediate' && <ChevronUp className="w-3 h-3" />}
        {level === 'expert' && <ChevronDown className="w-3 h-3" />}
      </Button>
      
      {showHint && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute top-full mt-2 right-0 p-2 bg-card rounded-lg shadow-lg text-xs w-48"
        >
          AI detected your expertise level. Click to adjust complexity.
        </motion.div>
      )}
    </motion.div>
  );
}
