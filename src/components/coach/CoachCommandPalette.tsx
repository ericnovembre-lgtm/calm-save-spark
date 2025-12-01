import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Command, Sparkles, Radar, TrendingUp, MessageCircle, RefreshCw, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoachCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScenarioSimulate: (prompt: string) => void;
  onScrollToDNA: () => void;
  onScrollToScenario: () => void;
  onScrollToRadar: () => void;
  onOpenChat: () => void;
  onToggleDarkMode: () => void;
  isDarkMode: boolean;
}

interface CommandAction {
  id: string;
  label: string;
  category: 'Quick Scenarios' | 'Navigation' | 'Actions';
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

export function CoachCommandPalette({
  open,
  onOpenChange,
  onScenarioSimulate,
  onScrollToDNA,
  onScrollToScenario,
  onScrollToRadar,
  onOpenChat,
  onToggleDarkMode,
  isDarkMode,
}: CoachCommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentActions, setRecentActions] = useState<string[]>([]);

  const actions: CommandAction[] = useMemo(() => [
    // Quick Scenarios
    {
      id: 'scenario-job-loss',
      label: 'Simulate: What if I lose my job?',
      category: 'Quick Scenarios',
      icon: <Sparkles className="w-4 h-4 text-command-violet" />,
      action: () => {
        onScenarioSimulate('What if I lose my job?');
        trackAction('scenario-job-loss');
        onOpenChange(false);
      },
      keywords: ['job', 'lose', 'unemployed', 'layoff'],
    },
    {
      id: 'scenario-save-more',
      label: 'Simulate: Save 50% more monthly',
      category: 'Quick Scenarios',
      icon: <Sparkles className="w-4 h-4 text-command-violet" />,
      action: () => {
        onScenarioSimulate('What if I save 50% more each month?');
        trackAction('scenario-save-more');
        onOpenChange(false);
      },
      keywords: ['save', 'savings', 'money', 'increase'],
    },
    {
      id: 'scenario-emergency',
      label: 'Simulate: Build emergency fund',
      category: 'Quick Scenarios',
      icon: <Sparkles className="w-4 h-4 text-command-violet" />,
      action: () => {
        onScenarioSimulate('What if I build a 6-month emergency fund?');
        trackAction('scenario-emergency');
        onOpenChange(false);
      },
      keywords: ['emergency', 'fund', 'safety', 'backup'],
    },
    {
      id: 'scenario-raise',
      label: 'Simulate: Get a 20% raise',
      category: 'Quick Scenarios',
      icon: <Sparkles className="w-4 h-4 text-command-violet" />,
      action: () => {
        onScenarioSimulate('What if I get a 20% raise?');
        trackAction('scenario-raise');
        onOpenChange(false);
      },
      keywords: ['raise', 'promotion', 'salary', 'income'],
    },
    // Navigation
    {
      id: 'nav-dna',
      label: 'Go to Financial DNA',
      category: 'Navigation',
      icon: <TrendingUp className="w-4 h-4 text-command-cyan" />,
      action: () => {
        onScrollToDNA();
        trackAction('nav-dna');
        onOpenChange(false);
      },
      keywords: ['dna', 'health', 'orb'],
    },
    {
      id: 'nav-scenario',
      label: 'Go to Scenario Simulator',
      category: 'Navigation',
      icon: <Sparkles className="w-4 h-4 text-command-cyan" />,
      action: () => {
        onScrollToScenario();
        trackAction('nav-scenario');
        onOpenChange(false);
      },
      keywords: ['scenario', 'simulator', 'what if'],
    },
    {
      id: 'nav-radar',
      label: 'Go to Opportunity Radar',
      category: 'Navigation',
      icon: <Radar className="w-4 h-4 text-command-cyan" />,
      action: () => {
        onScrollToRadar();
        trackAction('nav-radar');
        onOpenChange(false);
      },
      keywords: ['opportunity', 'radar', 'opportunities'],
    },
    // Actions
    {
      id: 'action-chat',
      label: 'Open AI Coach Chat',
      category: 'Actions',
      icon: <MessageCircle className="w-4 h-4 text-command-violet" />,
      action: () => {
        onOpenChat();
        trackAction('action-chat');
        onOpenChange(false);
      },
      keywords: ['chat', 'ai', 'coach', 'talk'],
    },
    {
      id: 'action-dark-mode',
      label: `Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`,
      category: 'Actions',
      icon: isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-400" />,
      action: () => {
        onToggleDarkMode();
        trackAction('action-dark-mode');
        onOpenChange(false);
      },
      keywords: ['theme', 'dark', 'light', 'mode'],
    },
    {
      id: 'action-refresh',
      label: 'Refresh Financial Analysis',
      category: 'Actions',
      icon: <RefreshCw className="w-4 h-4 text-command-cyan" />,
      action: () => {
        window.location.reload();
        trackAction('action-refresh');
      },
      keywords: ['refresh', 'reload', 'update'],
    },
  ], [isDarkMode, onScenarioSimulate, onScrollToDNA, onScrollToScenario, onScrollToRadar, onOpenChat, onToggleDarkMode, onOpenChange]);

  const trackAction = (actionId: string) => {
    const updated = [actionId, ...recentActions.filter(id => id !== actionId)].slice(0, 3);
    setRecentActions(updated);
    localStorage.setItem('coach-command-recent', JSON.stringify(updated));
  };

  useEffect(() => {
    const stored = localStorage.getItem('coach-command-recent');
    if (stored) {
      try {
        setRecentActions(JSON.parse(stored));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const filteredActions = useMemo(() => {
    if (!search.trim()) return actions;
    
    const searchLower = search.toLowerCase();
    return actions.filter(action => 
      action.label.toLowerCase().includes(searchLower) ||
      action.category.toLowerCase().includes(searchLower) ||
      action.keywords?.some(kw => kw.toLowerCase().includes(searchLower))
    );
  }, [actions, search]);

  const groupedActions = useMemo(() => {
    const groups: Record<string, CommandAction[]> = {};
    filteredActions.forEach(action => {
      if (!groups[action.category]) {
        groups[action.category] = [];
      }
      groups[action.category].push(action);
    });
    return groups;
  }, [filteredActions]);

  const recentActionsData = useMemo(() => 
    recentActions.map(id => actions.find(a => a.id === id)).filter(Boolean) as CommandAction[]
  , [recentActions, actions]);

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredActions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const action = filteredActions[selectedIndex];
      if (action) action.action();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 bg-command-surface border-white/10 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Command className="w-5 h-5 text-command-cyan" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              className="flex-1 bg-command-bg border-none text-white font-mono placeholder:text-white/40 focus-visible:ring-0"
              autoFocus
            />
            <kbd className="px-2 py-1 text-xs bg-command-bg border border-white/10 rounded text-white/60 font-mono">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {recentActionsData.length > 0 && !search && (
            <div className="mb-3">
              <div className="px-3 py-2 text-xs font-mono text-white/40 uppercase tracking-wider">
                Recent
              </div>
              {recentActionsData.map((action, index) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                    "hover:bg-command-violet/10 hover:border-command-violet/30",
                    selectedIndex === index && "bg-command-violet/10 border border-command-violet/30"
                  )}
                >
                  {action.icon}
                  <span className="flex-1 text-sm font-mono text-white">{action.label}</span>
                  <span className="text-xs text-white/40 font-mono">{action.category}</span>
                </button>
              ))}
            </div>
          )}

          {Object.entries(groupedActions).map(([category, categoryActions]) => (
            <div key={category} className="mb-3">
              <div className="px-3 py-2 text-xs font-mono text-white/40 uppercase tracking-wider">
                {category}
              </div>
              {categoryActions.map((action, index) => {
                const globalIndex = filteredActions.indexOf(action);
                return (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                      "hover:bg-command-violet/10 hover:border-command-violet/30",
                      selectedIndex === globalIndex && "bg-command-violet/10 border border-command-violet/30"
                    )}
                  >
                    {action.icon}
                    <span className="flex-1 text-sm font-mono text-white">{action.label}</span>
                  </button>
                );
              })}
            </div>
          ))}

          {filteredActions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Command className="w-12 h-12 text-white/20 mb-3" />
              <p className="text-sm text-white/60 font-mono">No commands found</p>
              <p className="text-xs text-white/40 font-mono mt-1">Try different keywords</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/10 bg-command-bg/50">
          <div className="flex items-center justify-between text-xs font-mono text-white/40">
            <div className="flex gap-4">
              <span><kbd className="text-white/60">↑↓</kbd> Navigate</span>
              <span><kbd className="text-white/60">Enter</kbd> Select</span>
            </div>
            <span>{filteredActions.length} commands</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
