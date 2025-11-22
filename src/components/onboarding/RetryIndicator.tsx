import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface RetryIndicatorProps {
  attempt: number;
  maxAttempts: number;
  message?: string;
}

export function RetryIndicator({ attempt, maxAttempts, message = 'Personalizing your experience...' }: RetryIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{message}</span>
      {attempt > 1 && (
        <motion.span 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xs bg-muted px-2 py-1 rounded"
        >
          Attempt {attempt}/{maxAttempts}
        </motion.span>
      )}
    </motion.div>
  );
}
