import { useState } from "react";
import { Plus, Target, DollarSign, Zap, Bot, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const actions = [
  { icon: Target, label: "New Goal", path: "/goals" },
  { icon: DollarSign, label: "Add Transaction", path: "/transactions" },
  { icon: Zap, label: "Quick Transfer", path: "/accounts" },
  { icon: Bot, label: "Ask Coach", path: "/coach" },
];

export const FABMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleAction = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div
      className={`fixed z-50 ${
        isMobile ? "bottom-20 right-4" : "bottom-6 right-6"
      }`}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-3 space-y-2"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 justify-end"
              >
                <span className="bg-background px-3 py-1 rounded-full shadow-lg text-sm font-medium whitespace-nowrap">
                  {action.label}
                </span>
                <Button
                  size="icon"
                  onClick={() => handleAction(action.path)}
                  className="h-12 w-12 rounded-full shadow-lg"
                  variant="secondary"
                >
                  <action.icon className="h-5 w-5" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full shadow-xl"
        aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
        data-copilot-id="fab-menu-button"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </motion.div>
      </Button>
    </div>
  );
};
