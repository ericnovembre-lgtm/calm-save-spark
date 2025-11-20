import { motion } from 'framer-motion';

interface HelpWidgetBackdropProps {
  onClick: () => void;
}

export function HelpWidgetBackdrop({ onClick }: HelpWidgetBackdropProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
      style={{ pointerEvents: 'auto' }}
    />
  );
}
