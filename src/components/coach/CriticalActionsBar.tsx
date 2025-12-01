import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CriticalAction {
  id: string;
  type: "urgent" | "important" | "opportunity";
  title: string;
  description: string;
  action: () => void;
}

interface CriticalActionsBarProps {
  actions: CriticalAction[];
}

/**
 * CriticalActionsBar - Displays 3 urgent/important actions
 * Shown immediately on page load (proactive)
 */
export function CriticalActionsBar({ actions }: CriticalActionsBarProps) {
  if (actions.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="w-4 h-4" />;
      case "opportunity":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case "urgent":
        return "bg-command-rose/10 border-command-rose/30 text-command-rose";
      case "opportunity":
        return "bg-command-emerald/10 border-command-emerald/30 text-command-emerald";
      default:
        return "bg-command-cyan/10 border-command-cyan/30 text-command-cyan";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
    >
      {actions.slice(0, 3).map((action, idx) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            delay: 0.6 + idx * 0.1, 
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`rounded-lg border p-4 ${getColors(action.type)} relative overflow-hidden group cursor-pointer transition-shadow duration-300 hover:shadow-lg`}
        >
          {/* Shimmer effect on hover */}
          <motion.div
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          />
          
          {/* Pulse indicator for urgent actions */}
          {action.type === "urgent" && (
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-2 right-2 w-2 h-2 rounded-full bg-command-rose"
            />
          )}

          <div className="flex items-start gap-3 relative z-10">
            <motion.div 
              initial={{ rotate: 0 }}
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="mt-1"
            >
              {getIcon(action.type)}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1 font-mono truncate">
                {action.title}
              </h4>
              <p className="text-xs opacity-80 mb-3 line-clamp-2">
                {action.description}
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs font-mono relative overflow-hidden group/btn"
                onClick={(e) => {
                  e.stopPropagation();
                  action.action();
                }}
              >
                <span className="relative z-10">Take Action →</span>
                <motion.div
                  whileHover={{ x: 0 }}
                  initial={{ x: '-100%' }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-white/10"
                />
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
