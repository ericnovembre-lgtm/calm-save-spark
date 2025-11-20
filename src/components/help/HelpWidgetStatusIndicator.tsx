import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type StatusType = 'online' | 'typing' | 'thinking';

interface HelpWidgetStatusIndicatorProps {
  status: StatusType;
}

export function HelpWidgetStatusIndicator({ status }: HelpWidgetStatusIndicatorProps) {
  const prefersReducedMotion = useReducedMotion();

  const statusConfig = {
    online: {
      color: 'bg-green-500',
      text: 'Online',
    },
    typing: {
      color: 'bg-blue-500',
      text: 'Typing...',
    },
    thinking: {
      color: 'bg-yellow-500',
      text: 'Thinking...',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color}`} />
      <span className="text-xs text-muted-foreground">{config.text}</span>
    </div>
  );
}
