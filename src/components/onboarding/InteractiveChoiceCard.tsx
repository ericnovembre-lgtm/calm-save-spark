import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useState } from "react";
import { Check, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveChoiceCardProps {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
  isSelected: boolean;
  onSelect: () => void;
  detailedInfo?: string;
}

export const InteractiveChoiceCard = ({
  value,
  label,
  description,
  icon: Icon,
  isSelected,
  onSelect,
  detailedInfo,
}: InteractiveChoiceCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const { triggerHaptic } = useHapticFeedback();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (!isSelected) {
      triggerHaptic("medium");
    }
    onSelect();
  };

  const handleFlip = (e: React.MouseEvent) => {
    if (detailedInfo) {
      e.stopPropagation();
      setIsFlipped(!isFlipped);
      triggerHaptic("light");
    }
  };

  return (
    <motion.div
      className="relative perspective-1000"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -2 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
    >
      <motion.button
        type="button"
        onClick={handleClick}
        className={cn(
          "relative w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden",
          "transform-style-preserve-3d",
          isSelected
            ? "border-primary bg-primary/5 shadow-xl shadow-primary/20 ring-2 ring-primary/20"
            : "border-border bg-card hover:border-primary/40 hover:shadow-lg hover:bg-accent/5"
        )}
        animate={
          prefersReducedMotion
            ? {}
            : {
                rotateY: isFlipped ? 180 : 0,
              }
        }
        transition={{ duration: 0.6 }}
      >
        {/* Front Face */}
        <div
          className={cn(
            "backface-hidden",
            isFlipped && "opacity-0"
          )}
        >
          <div className="flex items-start gap-4">
            {/* Icon with animation */}
            <motion.div
              className={cn(
                "flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-accent/50 text-muted-foreground"
              )}
              animate={
                prefersReducedMotion || !isSelected
                  ? {}
                  : {
                      rotate: [0, -10, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }
              }
              transition={{ duration: 0.5 }}
            >
              <Icon className="w-7 h-7" />
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className={cn(
                  "font-semibold transition-colors text-base",
                  isSelected ? "text-primary" : "text-foreground"
                )}>{label}</h3>
                {isSelected && (
                  <motion.div
                    initial={prefersReducedMotion ? false : { scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                  </motion.div>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

              {/* Flip indicator */}
              {detailedInfo && (
                <motion.button
                  type="button"
                  onClick={handleFlip}
                  className="mt-2 text-xs text-primary hover:underline"
                  animate={
                    prefersReducedMotion || !isHovered
                      ? {}
                      : {
                          x: [0, 3, 0],
                        }
                  }
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Learn more →
                </motion.button>
              )}
            </div>
          </div>

          {/* Selection glow effect */}
          {isSelected && !prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              animate={{
                boxShadow: [
                  "0 0 0 0 hsl(var(--primary) / 0)",
                  "0 0 0 4px hsl(var(--primary) / 0.1)",
                  "0 0 0 0 hsl(var(--primary) / 0)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        {/* Back Face (detailed info) */}
        {detailedInfo && (
          <div
            className={cn(
              "absolute inset-0 backface-hidden p-5 flex items-center justify-center",
              !isFlipped && "opacity-0 pointer-events-none"
            )}
            style={{ transform: "rotateY(180deg)" }}
          >
            <div className="text-center">
              <Icon className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h4 className="font-semibold text-foreground mb-2">{label}</h4>
              <p className="text-sm text-muted-foreground">{detailedInfo}</p>
              <button
                type="button"
                onClick={handleFlip}
                className="mt-3 text-xs text-primary hover:underline"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Hover indicator particles */}
        {isHovered && !isSelected && !prefersReducedMotion && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-primary pointer-events-none"
                style={{
                  top: `${20 + i * 30}%`,
                  right: "10px",
                }}
                animate={{
                  x: [0, 5, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  repeat: Infinity,
                }}
              />
            ))}
          </>
        )}
      </motion.button>
    </motion.div>
  );
};
