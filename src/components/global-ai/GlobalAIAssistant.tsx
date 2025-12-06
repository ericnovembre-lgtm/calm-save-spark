import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useGlobalAI } from '@/contexts/GlobalAIContext';
import { AICommandPalette } from './AICommandPalette';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export function GlobalAIAssistant() {
  const location = useLocation();
  const { isOpen, toggleAI } = useGlobalAI();

  // Hide on dashboard page
  if (location.pathname === '/dashboard') {
    return null;
  }

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
              aria-label="Open AI Assistant"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
