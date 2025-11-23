import { Button } from '@/components/ui/button';
import { Eye, Tag, MessageSquare, Split } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  onViewDetails: () => void;
  onCategorize: () => void;
  onAddNote: () => void;
  onSplit: () => void;
  isExpanded?: boolean;
  className?: string;
}

export function QuickActions({
  onViewDetails,
  onCategorize,
  onAddNote,
  onSplit,
  isExpanded,
  className,
}: QuickActionsProps) {
  const actions = [
    { icon: Eye, label: 'Details', onClick: onViewDetails },
    { icon: Tag, label: 'Categorize', onClick: onCategorize },
    { icon: MessageSquare, label: 'Note', onClick: onAddNote },
    { icon: Split, label: 'Split', onClick: onSplit },
  ];

  return (
    <div 
      className={cn(
        'flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
        isExpanded && 'opacity-100',
        className
      )}
      onClick={(e) => e.stopPropagation()} // Prevent expansion when clicking actions
    >
      {actions.map((action, i) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, duration: 0.2 }}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={action.onClick}
            className="gap-1.5 text-xs bg-background/50 hover:bg-secondary/20 backdrop-blur-sm"
          >
            <action.icon className="w-3.5 h-3.5" />
            {action.label}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}