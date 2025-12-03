import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Command, TrendingUp, Target, DollarSign, 
  Settings, CreditCard, PieChart, Users, X 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Action {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  category: "navigation" | "actions" | "recent";
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [recentActions, setRecentActions] = useState<string[]>([]);
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const allActions: Action[] = [
    // Main Hubs
    {
      id: "hub-manage-money",
      label: "Manage Money Hub",
      icon: <Target className="w-4 h-4" />,
      action: () => navigate("/hubs/manage-money"),
      category: "navigation"
    },
    {
      id: "hub-grow-wealth",
      label: "Grow Wealth Hub",
      icon: <TrendingUp className="w-4 h-4" />,
      action: () => navigate("/hubs/grow-wealth"),
      category: "navigation"
    },
    {
      id: "hub-ai-insights",
      label: "AI & Insights Hub",
      icon: <PieChart className="w-4 h-4" />,
      action: () => navigate("/hubs/ai-insights"),
      category: "navigation"
    },
    {
      id: "hub-lifestyle",
      label: "Lifestyle Hub",
      icon: <Users className="w-4 h-4" />,
      action: () => navigate("/hubs/lifestyle"),
      category: "navigation"
    },
    {
      id: "hub-premium",
      label: "Premium Hub",
      icon: <Settings className="w-4 h-4" />,
      action: () => navigate("/hubs/premium"),
      category: "navigation"
    },
    {
      id: "hub-memory",
      label: "Memory Hub",
      icon: <Users className="w-4 h-4" />,
      action: () => navigate("/hubs/memory"),
      category: "navigation"
    },
    // Money Management
    {
      id: "view-budget",
      label: "Budget",
      icon: <PieChart className="w-4 h-4" />,
      action: () => navigate("/budget"),
      category: "navigation"
    },
    {
      id: "view-transactions",
      label: "Transactions",
      icon: <CreditCard className="w-4 h-4" />,
      action: () => navigate("/transactions"),
      category: "navigation"
    },
    {
      id: "view-subscriptions",
      label: "Subscriptions",
      icon: <CreditCard className="w-4 h-4" />,
      action: () => navigate("/subscriptions"),
      category: "navigation"
    },
    {
      id: "view-debts",
      label: "Debts",
      icon: <CreditCard className="w-4 h-4" />,
      action: () => navigate("/debts"),
      category: "navigation"
    },
    {
      id: "view-pots",
      label: "Pots",
      icon: <Target className="w-4 h-4" />,
      action: () => navigate("/pots"),
      category: "navigation"
    },
    {
      id: "view-automations",
      label: "Automations",
      icon: <DollarSign className="w-4 h-4" />,
      action: () => navigate("/automations"),
      category: "navigation"
    },
    // Wealth Building
    {
      id: "view-goals",
      label: "Goals",
      icon: <Target className="w-4 h-4" />,
      action: () => navigate("/goals"),
      category: "navigation"
    },
    {
      id: "view-investments",
      label: "Investments",
      icon: <TrendingUp className="w-4 h-4" />,
      action: () => navigate("/investments"),
      category: "navigation"
    },
    {
      id: "view-credit",
      label: "Credit Score",
      icon: <CreditCard className="w-4 h-4" />,
      action: () => navigate("/credit"),
      category: "navigation"
    },
    {
      id: "view-wallet",
      label: "Wallet",
      icon: <DollarSign className="w-4 h-4" />,
      action: () => navigate("/wallet"),
      category: "navigation"
    },
    {
      id: "view-card",
      label: "Card",
      icon: <CreditCard className="w-4 h-4" />,
      action: () => navigate("/card"),
      category: "navigation"
    },
    // AI & Insights
    {
      id: "view-coach",
      label: "AI Coach",
      icon: <Users className="w-4 h-4" />,
      action: () => navigate("/coach"),
      category: "navigation"
    },
    {
      id: "view-ai-agents",
      label: "AI Agents",
      icon: <Users className="w-4 h-4" />,
      action: () => navigate("/ai-agents"),
      category: "navigation"
    },
    {
      id: "view-analytics",
      label: "Analytics",
      icon: <PieChart className="w-4 h-4" />,
      action: () => navigate("/analytics"),
      category: "navigation"
    },
    // Quick Actions
    {
      id: "quick-transfer",
      label: "Quick Transfer",
      icon: <DollarSign className="w-4 h-4" />,
      action: () => toast.info("Opening quick transfer..."),
      category: "actions"
    },
    {
      id: "check-balance",
      label: "Check Balance",
      icon: <TrendingUp className="w-4 h-4" />,
      action: () => toast.info("Balance: $3,247.85"),
      category: "actions"
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
      action: () => navigate("/settings"),
      category: "navigation"
    }
  ];

  // Escape key handler to close palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const executeAction = useCallback((action: Action) => {
    action.action();
    setRecentActions(prev => {
      const filtered = prev.filter(id => id !== action.id);
      return [action.id, ...filtered].slice(0, 3);
    });
    setIsOpen(false);
    setSearch("");
  }, []);

  // Fuzzy search
  const filteredActions = allActions.filter(action => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return action.label.toLowerCase().includes(searchLower);
  });

  // Group actions
  const recentActionsFiltered = filteredActions.filter(a => 
    recentActions.includes(a.id)
  );
  const navigationActions = filteredActions.filter(a => 
    a.category === "navigation" && !recentActions.includes(a.id)
  );
  const actionActions = filteredActions.filter(a => 
    a.category === "actions" && !recentActions.includes(a.id)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Palette */}
          <motion.div
            className="relative w-full max-w-2xl bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden"
            initial={{ scale: 0.9, y: -20, filter: "blur(10px)" }}
            animate={{ scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ scale: 0.9, y: -20, filter: "blur(10px)" }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 p-4 border-b border-border/50">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search actions..."
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-lg"
                autoFocus
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <kbd className="px-2 py-1 rounded bg-muted/50">ESC</kbd>
                <span>to close</span>
              </div>
            </div>

            {/* Actions list */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {recentActionsFiltered.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    Recent
                  </div>
                  {recentActionsFiltered.map((action, index) => (
                    <ActionItem 
                      key={action.id} 
                      action={action} 
                      onClick={() => executeAction(action)}
                      delay={index * 0.03}
                    />
                  ))}
                </div>
              )}

              {actionActions.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    Quick Actions
                  </div>
                  {actionActions.map((action, index) => (
                    <ActionItem 
                      key={action.id} 
                      action={action} 
                      onClick={() => executeAction(action)}
                      delay={(recentActionsFiltered.length + index) * 0.03}
                    />
                  ))}
                </div>
              )}

              {navigationActions.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    Navigation
                  </div>
                  {navigationActions.map((action, index) => (
                    <ActionItem 
                      key={action.id} 
                      action={action} 
                      onClick={() => executeAction(action)}
                      delay={(recentActionsFiltered.length + actionActions.length + index) * 0.03}
                    />
                  ))}
                </div>
              )}

              {filteredActions.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  No actions found
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-3 border-t border-border/50 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Command className="w-3 h-3" />
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted/50">↑↓</kbd>
                <span>to navigate</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-muted/50">↵</kbd>
                <span>to select</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ActionItemProps {
  action: Action;
  onClick: () => void;
  delay: number;
}

function ActionItem({ action, onClick, delay }: ActionItemProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left group"
      initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.2 }}
      whileHover={!prefersReducedMotion ? { x: 4 } : undefined}
    >
      <div className="text-muted-foreground group-hover:text-primary transition-colors">
        {action.icon}
      </div>
      <span className="flex-1 text-foreground font-medium">{action.label}</span>
    </motion.button>
  );
}
