import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useGlobalAI } from '@/contexts/GlobalAIContext';
import { AICommandPalette } from './AICommandPalette';
import { motion, AnimatePresence } from 'framer-motion';

export function GlobalAIAssistant() {
  const { isOpen, toggleAI } = useGlobalAI();

  // Keyboard shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleAI();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleAI]);

  return (
    <>
      <AICommandPalette />
      
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="lg"
              onClick={toggleAI}
              className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
            
            {/* Hint tooltip */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute -left-32 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shadow-md"
            >
              Press ⌘K to open
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
