import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface ActiveFiltersDisplayProps {
  filters: {
    searchQuery?: string;
    category?: string;
    merchant?: string;
    amountMin?: number;
    amountMax?: number;
    dateRange?: { start: string; end: string };
  };
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
}

export function ActiveFiltersDisplay({ filters, onRemoveFilter, onClearAll }: ActiveFiltersDisplayProps) {
  const activeFilters = Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null);

  if (activeFilters.length === 0) return null;

  const formatFilterLabel = (key: string, value: any): string => {
    switch (key) {
      case 'searchQuery':
        return `Search: ${value}`;
      case 'category':
        return `Category: ${value}`;
      case 'merchant':
        return `Merchant: ${value}`;
      case 'amountMin':
        return `Min: $${value}`;
      case 'amountMax':
        return `Max: $${value}`;
      case 'dateRange':
        return `${value.start} to ${value.end}`;
      default:
        return `${key}: ${value}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-2 flex-wrap"
    >
      <span className="text-sm text-muted-foreground">Active filters:</span>
      <AnimatePresence mode="popLayout">
        {activeFilters.map(([key, value]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <Badge variant="secondary" className="gap-1 pr-1">
              {formatFilterLabel(key, value)}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onRemoveFilter(key)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          </motion.div>
        ))}
      </AnimatePresence>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        Clear all
      </Button>
    </motion.div>
  );
}
