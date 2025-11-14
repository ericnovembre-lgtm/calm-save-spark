import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function KeyboardHints() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Check if user has seen hints before
    const hasSeenHints = localStorage.getItem("keyboard-hints-seen");
    if (!hasSeenHints) {
      setTimeout(() => setIsVisible(true), 2000); // Show after 2 seconds
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem("keyboard-hints-seen", "true");
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-24 right-6 z-40 max-w-xs"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        >
          <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Keyboard className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    Keyboard Shortcuts
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Work faster with hotkeys
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shortcuts list */}
            <div className="space-y-2">
              <ShortcutItem 
                keys={["⌘", "K"]} 
                label="Command Palette" 
                delay={0.1}
              />
              <ShortcutItem 
                keys={["⌘", "G"]} 
                label="Go to Goals" 
                delay={0.15}
              />
              <ShortcutItem 
                keys={["⌘", "A"]} 
                label="View Analytics" 
                delay={0.2}
              />
              <ShortcutItem 
                keys={["⌘", "T"]} 
                label="Quick Transfer" 
                delay={0.25}
              />
            </div>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="w-full mt-3 px-3 py-1.5 text-xs text-center text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              Got it!
            </button>
          </div>

          {/* Pointer */}
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-card border-r border-b border-border/50 rotate-45" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ShortcutItemProps {
  keys: string[];
  label: string;
  delay: number;
}

function ShortcutItem({ keys, label, delay }: ShortcutItemProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="flex items-center justify-between"
      initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <span className="text-xs text-foreground">{label}</span>
      <div className="flex gap-1">
        {keys.map((key, index) => (
          <kbd
            key={index}
            className="px-2 py-0.5 text-xs rounded bg-muted/50 text-muted-foreground font-mono"
          >
            {key}
          </kbd>
        ))}
      </div>
    </motion.div>
  );
}
