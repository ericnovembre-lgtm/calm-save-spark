import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SaveplusAnimIcon } from "@/components/icons";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Button } from "@/components/ui/button";
import { Info, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FlippableFeatureCardProps {
  id: string;
  icon: string;
  title: string;
  description: string;
  details: string;
  badge?: "Most Popular" | "New" | "Pro";
  onLearnMore: () => void;
}

export const FlippableFeatureCard = ({
  id,
  icon,
  title,
  description,
  details,
  badge,
  onLearnMore,
}: FlippableFeatureCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const getMiniDemo = () => {
    switch (id) {
      case "smart-pots":
        return (
          <div className="space-y-3">
            <div className="bg-accent/20 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">Vacation Fund</span>
                <span className="text-xs text-muted-foreground">75%</span>
              </div>
              <motion.div 
                className="h-2 bg-background rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="h-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </motion.div>
              <div className="flex justify-between mt-2">
                <span className="text-xs">$1,500</span>
                <span className="text-xs font-semibold">$2,000</span>
              </div>
            </div>
          </div>
        );
      case "automated-savings":
        return (
          <div className="space-y-3">
            <motion.div 
              className="bg-accent/20 rounded-lg p-3 text-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="text-xs text-muted-foreground mb-1">Round-up Savings</p>
              <p className="text-2xl font-bold text-accent">+$12.50</p>
              <p className="text-xs text-muted-foreground mt-1">This week</p>
            </motion.div>
          </div>
        );
      case "ave-plus-card":
        return (
          <div className="relative">
            <motion.div
              className="bg-gradient-to-br from-accent/30 to-accent/10 rounded-lg p-4 aspect-[1.6/1]"
              whileHover={{ rotateY: 180 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="flex flex-col justify-between h-full">
                <div className="text-xs font-semibold">$ave+ Card</div>
                <div>
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="text-xl font-bold">$2,500</p>
                </div>
              </div>
            </motion.div>
          </div>
        );
      case "financial-insights":
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <motion.div 
                className="flex-1 bg-accent/20 rounded h-12"
                initial={{ height: 0 }}
                animate={{ height: 48 }}
                transition={{ delay: 0 }}
              />
              <motion.div 
                className="flex-1 bg-accent/30 rounded h-16"
                initial={{ height: 0 }}
                animate={{ height: 64 }}
                transition={{ delay: 0.1 }}
              />
              <motion.div 
                className="flex-1 bg-accent/40 rounded h-20"
                initial={{ height: 0 }}
                animate={{ height: 80 }}
                transition={{ delay: 0.2 }}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">Savings Growth</p>
          </div>
        );
      default:
        return (
          <div className="bg-accent/10 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Interactive demo available
            </p>
          </div>
        );
    }
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      style={{ perspective: 1000 }}
    >
      <div
        className="relative w-full h-[400px] cursor-pointer"
        onClick={handleFlip}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              className="absolute inset-0 bg-card rounded-2xl border border-border p-6 shadow-[var(--shadow-card)]"
              initial={prefersReducedMotion ? false : { rotateY: 0 }}
              animate={{ rotateY: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { rotateY: 90 }}
              transition={{ duration: 0.3 }}
              style={{ backfaceVisibility: "hidden" }}
            >
              {badge && (
                <Badge className="absolute top-4 right-4" variant={badge === "Most Popular" ? "default" : "secondary"}>
                  {badge}
                </Badge>
              )}
              <div className="flex flex-col h-full">
                <motion.div 
                  className="mb-4"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: [0, -5, 5, 0] }}
                >
                  <div className="inline-block p-4 bg-accent/10 rounded-xl">
                    <SaveplusAnimIcon name={icon as any} size={48} />
                  </div>
                </motion.div>
                <h3 className="text-2xl font-display font-bold mb-3">{title}</h3>
                <p className="text-muted-foreground mb-6 flex-1">{description}</p>
                <div className="flex items-center gap-2 text-sm text-accent">
                  <Info className="w-4 h-4" />
                  <span>Click to see demo</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              className="absolute inset-0 bg-card rounded-2xl border border-accent p-6 shadow-[var(--shadow-soft)]"
              initial={prefersReducedMotion ? { opacity: 0 } : { rotateY: -90 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { rotateY: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { rotateY: 90 }}
              transition={{ duration: 0.3 }}
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <h3 className="text-xl font-display font-bold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{details}</p>
                </div>
                <div className="flex-1 my-4">
                  {getMiniDemo()}
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLearnMore();
                  }}
                  className="w-full"
                  variant="default"
                >
                  Learn More
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
