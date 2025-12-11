import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AlgoliaSearchBoxProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  autoFocus?: boolean;
}

export function AlgoliaSearchBox({
  placeholder = "Search...",
  onSearch,
  isLoading = false,
  value: controlledValue,
  onChange,
  className,
  autoFocus = false,
}: AlgoliaSearchBoxProps) {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }
    onSearch(newValue);
  }, [onChange, onSearch]);

  const handleClear = useCallback(() => {
    if (onChange) {
      onChange('');
    } else {
      setInternalValue('');
    }
    onSearch('');
  }, [onChange, onSearch]);

  return (
    <motion.div 
      className={cn("relative w-full", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 blur-xl pointer-events-none"
        animate={{
          opacity: isFocused ? 0.6 : 0.2,
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
      />
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus={autoFocus}
          className={cn(
            "relative w-full pl-10 pr-10 h-11",
            "bg-card/80 backdrop-blur-sm",
            "border-border/50 focus:border-primary/50",
            "text-foreground placeholder:text-muted-foreground",
            "rounded-xl shadow-sm",
            "transition-all duration-200"
          )}
        />
        
        <AnimatePresence>
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            </motion.div>
          ) : value ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/50 transition-colors"
              type="button"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
