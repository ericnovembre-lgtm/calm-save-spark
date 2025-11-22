import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Sparkles, Loader2 } from 'lucide-react';
import { useDebouncedCallback } from '@/hooks/useDebounce';

const PRESETS = [
  'a trip to Tokyo',
  'emergency fund',
  'house down payment',
  'new car',
  'dream wedding',
  'college tuition',
];

interface TypewriterInputProps {
  onSubmit: (input: string) => void;
  isLoading?: boolean;
}

export const TypewriterInput = ({ onSubmit, isLoading }: TypewriterInputProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const debouncedSubmit = useDebouncedCallback((value: string) => {
    if (value.trim().length >= 3) {
      onSubmit(value);
    }
  }, 300);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    debouncedSubmit(value);
  }, [debouncedSubmit]);

  const handlePresetClick = useCallback((preset: string) => {
    setInput(preset);
    onSubmit(preset);
  }, [onSubmit]);

  return (
    <div className="space-y-4">
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative"
      >
        <div
          className={`relative flex items-center gap-3 px-6 py-4 rounded-2xl bg-card/50 backdrop-blur-xl border-2 transition-all duration-300 ${
            isFocused ? 'border-accent shadow-lg shadow-accent/20' : 'border-border'
          }`}
        >
          <span className="text-xl font-semibold text-foreground whitespace-nowrap">
            I want to save for
          </span>
          
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="your dream goal..."
            className="flex-1 bg-transparent text-xl font-semibold text-accent placeholder:text-muted-foreground focus:outline-none min-w-0"
            maxLength={50}
          />
          
          {isLoading ? (
            <Loader2 className="w-6 h-6 text-accent animate-spin flex-shrink-0" />
          ) : (
            <Sparkles className="w-6 h-6 text-accent flex-shrink-0" />
          )}
        </div>
        
        {/* Typing Cursor */}
        {isFocused && !input && (
          <motion.div
            className="absolute right-20 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </motion.div>
      
      {/* Preset Chips */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap gap-2"
      >
        <span className="text-sm text-muted-foreground">Try:</span>
        {PRESETS.map((preset, i) => (
          <motion.button
            key={preset}
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.05 }}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            onClick={() => handlePresetClick(preset)}
            className="px-3 py-1.5 rounded-full bg-accent/10 hover:bg-accent/20 text-sm font-medium text-accent transition-colors border border-accent/20"
          >
            {preset}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};
