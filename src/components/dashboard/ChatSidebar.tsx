import { motion } from 'framer-motion';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AIChat } from '@/components/coach/AIChat';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Desktop-only persistent sidebar with AIChat
 * Hidden on mobile and tablet (< 1024px)
 */
export function ChatSidebar({ isOpen, onToggle }: ChatSidebarProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      {/* Toggle button - visible when sidebar is closed */}
      {!isOpen && (
        <motion.button
          initial={false}
          animate={prefersReducedMotion ? {} : { x: isOpen ? 400 : 0 }}
          className={cn(
            "hidden lg:flex fixed right-0 top-24 z-40",
            "w-10 h-16 rounded-l-lg",
            "bg-primary text-primary-foreground",
            "items-center justify-center",
            "shadow-lg hover:shadow-xl",
            "transition-shadow duration-200",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          onClick={onToggle}
          aria-label="Open AI Chat Sidebar"
        >
          <PanelRightOpen className="w-5 h-5" />
        </motion.button>
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={prefersReducedMotion ? { x: isOpen ? 0 : 400 } : { x: isOpen ? 0 : 400 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
        className={cn(
          "hidden lg:block fixed right-0 top-16 bottom-0 w-[400px]",
          "bg-background border-l shadow-2xl z-40"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">AI Financial Coach</h3>
          <Button
            onClick={onToggle}
            size="icon"
            variant="ghost"
            aria-label="Close sidebar"
          >
            <PanelRightClose className="w-5 h-5" />
          </Button>
        </div>
        <div className="h-[calc(100vh-8rem)] p-4 overflow-hidden">
          <AIChat />
        </div>
      </motion.aside>

      {/* Backdrop overlay (optional - only on mobile if needed) */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          className="hidden lg:block fixed inset-0 bg-black z-30"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
    </>
  );
}
