import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SoundToggleProps {
  className?: string;
}

/**
 * Floating sound toggle widget
 * Positioned in corner for quick access
 */
export const SoundToggle = ({ className }: SoundToggleProps) => {
  const { preferences, updatePreference, playClickSound } = useSoundEffects();
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleToggle = () => {
    const newState = !preferences.enabled;
    updatePreference('enabled', newState);
    
    // Play sound if enabling
    if (newState) {
      // Small delay to ensure state is updated
      setTimeout(() => playClickSound(), 50);
    }
  };

  return (
    <motion.div
      className={cn(
        "fixed bottom-6 right-6 z-40",
        className
      )}
      initial={prefersReducedMotion ? undefined : { scale: 0, opacity: 0 }}
      animate={prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
    >
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={handleToggle}
          className={cn(
            "h-14 w-14 rounded-full shadow-lg backdrop-blur-xl border-2 transition-all duration-300",
            preferences.enabled
              ? "bg-primary/10 border-primary hover:bg-primary/20"
              : "bg-muted border-border hover:bg-muted/80"
          )}
          aria-label={preferences.enabled ? "Disable sound effects" : "Enable sound effects"}
        >
          <AnimatePresence mode="wait">
            {preferences.enabled ? (
              <motion.div
                key="volume-on"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.2 }}
              >
                <Volume2 className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="volume-off"
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -180 }}
                transition={{ duration: 0.2 }}
              >
                <VolumeX className="w-6 h-6 text-muted-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        {/* Tooltip on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
            >
              <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg text-sm shadow-lg border border-border">
                Sound Effects: <span className="font-semibold">{preferences.enabled ? 'On' : 'Off'}</span>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                  <div className="border-8 border-transparent border-l-popover" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Sound wave indicator when enabled */}
      {preferences.enabled && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-primary" />
        </motion.div>
      )}
    </motion.div>
  );
};
