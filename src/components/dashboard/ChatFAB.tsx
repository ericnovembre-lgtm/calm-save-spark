import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AIChat } from '@/components/coach/AIChat';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

/**
 * Floating Action Button that opens AIChat in a modal dialog
 * Positioned above QuickActionsFAB to avoid overlap
 */
export function ChatFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      {/* FAB Button */}
      <motion.button
        className={cn(
          "fixed bottom-24 right-4 z-30",
          "w-14 h-14 rounded-full",
          "bg-primary text-primary-foreground",
          "shadow-lg hover:shadow-xl",
          "flex items-center justify-center",
          "transition-shadow duration-200",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
        whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Chat"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Dialog with AIChat */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl h-[85vh] p-0 gap-0">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">AI Financial Coach</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="h-[calc(85vh-5rem)] overflow-hidden">
            <AIChat />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
