import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';
import { VoiceCommandHistoryItem } from '@/hooks/useVoiceCommandHistory';

interface CommandHistoryChipsProps {
  recentCommands: VoiceCommandHistoryItem[];
  frequentCommands: VoiceCommandHistoryItem[];
  onCommandClick: (command: string) => void;
  onDeleteCommand?: (commandId: string) => void;
  showFrequent?: boolean;
  maxItems?: number;
}

export function CommandHistoryChips({
  recentCommands,
  frequentCommands,
  onCommandClick,
  onDeleteCommand,
  showFrequent = true,
  maxItems = 5,
}: CommandHistoryChipsProps) {
  const displayRecent = recentCommands.slice(0, maxItems);
  const displayFrequent = frequentCommands.slice(0, 3);

  const handleClick = (command: string) => {
    haptics.select();
    onCommandClick(command);
  };

  const handleDelete = (e: React.MouseEvent, commandId: string) => {
    e.stopPropagation();
    haptics.buttonPress();
    onDeleteCommand?.(commandId);
  };

  if (displayRecent.length === 0 && displayFrequent.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Frequent commands */}
      {showFrequent && displayFrequent.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-3 h-3 text-primary/70" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Most used
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <AnimatePresence mode="popLayout">
              {displayFrequent.map((cmd, index) => (
                <motion.button
                  key={cmd.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleClick(cmd.command_text)}
                  className={cn(
                    "group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs",
                    "bg-primary/10 hover:bg-primary/20 border border-primary/20",
                    "text-foreground transition-all cursor-pointer"
                  )}
                >
                  <span className="truncate max-w-[120px]">{cmd.command_text}</span>
                  <span className={cn(
                    "px-1 py-0.5 rounded text-[9px] font-medium",
                    "bg-primary/20 text-primary"
                  )}>
                    {cmd.frequency}×
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Recent commands */}
      {displayRecent.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Clock className="w-3 h-3 text-muted-foreground/70" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Recent
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <AnimatePresence mode="popLayout">
              {displayRecent.map((cmd, index) => (
                <motion.button
                  key={cmd.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleClick(cmd.command_text)}
                  className={cn(
                    "group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs",
                    "bg-muted/50 hover:bg-muted border border-border/50",
                    "text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  )}
                >
                  <span className="truncate max-w-[140px]">{cmd.command_text}</span>
                  {onDeleteCommand && (
                    <button
                      onClick={(e) => handleDelete(e, cmd.id)}
                      className={cn(
                        "opacity-0 group-hover:opacity-100 transition-opacity",
                        "p-0.5 rounded hover:bg-destructive/20 hover:text-destructive"
                      )}
                      aria-label="Delete command"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
