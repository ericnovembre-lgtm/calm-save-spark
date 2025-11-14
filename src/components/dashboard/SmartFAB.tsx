import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, X, DollarSign, Target, TrendingUp, 
  MessageSquare, Settings, Sparkles 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SaveplusAnimIcon } from "@/components/icons";

interface FABAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

export function SmartFAB() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const actions: FABAction[] = [
    {
      id: "transfer",
      label: "Quick Transfer",
      icon: <DollarSign className="w-5 h-5" />,
      color: "hsl(var(--primary))",
      action: () => {
        toast.success("Opening quick transfer...");
        setIsExpanded(false);
      }
    },
    {
      id: "goal",
      label: "New Goal",
      icon: <Target className="w-5 h-5" />,
      color: "hsl(var(--accent))",
      action: () => {
        navigate("/goals");
        setIsExpanded(false);
      }
    },
    {
      id: "insights",
      label: "AI Insights",
      icon: <Sparkles className="w-5 h-5" />,
      color: "hsl(var(--accent))",
      action: () => {
        toast.info("Analyzing your finances...");
        setIsExpanded(false);
      }
    },
    {
      id: "chat",
      label: "AI Coach",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "hsl(var(--primary))",
      action: () => {
        navigate("/coach");
        setIsExpanded(false);
      }
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "hsl(var(--accent))",
      action: () => {
        navigate("/analytics");
        setIsExpanded(false);
      }
    }
  ];

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 60;
    const closestAction = actions.find((_, index) => {
      const angle = (index / actions.length) * 360;
      const rad = (angle * Math.PI) / 180;
      const targetX = Math.cos(rad) * 120;
      const targetY = Math.sin(rad) * 120;
      
      const distance = Math.sqrt(
        Math.pow(info.offset.x - targetX, 2) + 
        Math.pow(info.offset.y - targetY, 2)
      );
      
      return distance < threshold;
    });

    if (closestAction) {
      closestAction.action();
    }

    setDragPosition({ x: 0, y: 0 });
  };

  return (
    <>
      {/* Backdrop when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB Container */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Sub-actions */}
        <AnimatePresence>
          {isExpanded && (
            <>
              {actions.map((action, index) => {
                const angle = (index / actions.length) * 360 - 90; // Start from top
                const rad = (angle * Math.PI) / 180;
                const distance = 100;
                const x = Math.cos(rad) * distance;
                const y = Math.sin(rad) * distance;

                return (
                  <motion.button
                    key={action.id}
                    onClick={action.action}
                    className="absolute bottom-0 right-0 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white"
                    style={{ 
                      backgroundColor: action.color,
                      originX: 0.5,
                      originY: 0.5
                    }}
                    initial={{ 
                      x: 0, 
                      y: 0, 
                      scale: 0, 
                      opacity: 0 
                    }}
                    animate={{ 
                      x, 
                      y, 
                      scale: 1, 
                      opacity: 1 
                    }}
                    exit={{ 
                      x: 0, 
                      y: 0, 
                      scale: 0, 
                      opacity: 0 
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                      delay: prefersReducedMotion ? 0 : index * 0.05
                    }}
                    whileHover={!prefersReducedMotion ? { scale: 1.1 } : undefined}
                    whileTap={{ scale: 0.95 }}
                  >
                    {action.icon}
                    
                    {/* Tooltip */}
                    <motion.div
                      className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-3 py-1.5 rounded-lg text-sm whitespace-nowrap shadow-lg border border-border pointer-events-none"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {action.label}
                    </motion.div>
                  </motion.button>
                );
              })}
            </>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center overflow-hidden"
          whileHover={!prefersReducedMotion ? { scale: 1.05 } : undefined}
          whileTap={{ scale: 0.95 }}
          drag={isExpanded && !prefersReducedMotion}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          style={{ x: dragPosition.x, y: dragPosition.y }}
        >
          {/* Ripple effect */}
          <motion.div
            className="absolute inset-0 bg-white/20 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: isExpanded ? [1, 1.5] : 0,
              opacity: isExpanded ? [0.5, 0] : 0
            }}
            transition={{
              duration: 1,
              repeat: isExpanded ? Infinity : 0,
              ease: "easeOut"
            }}
          />

          {/* Icon */}
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {isExpanded ? (
              <X className="w-6 h-6" />
            ) : (
              <Plus className="w-6 h-6" />
            )}
          </motion.div>

          {/* Hint text */}
          {!isExpanded && (
            <motion.div
              className="absolute -top-14 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            >
              Quick Actions
            </motion.div>
          )}
        </motion.button>

        {/* Drag hint when expanded */}
        {isExpanded && !prefersReducedMotion && (
          <motion.div
            className="absolute -top-20 left-1/2 -translate-x-1/2 text-xs text-center text-muted-foreground max-w-[200px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            Drag to action or tap to select
          </motion.div>
        )}
      </div>
    </>
  );
}
