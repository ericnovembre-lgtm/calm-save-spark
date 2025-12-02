import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScenarioHistory, SavedScenario } from '@/hooks/useScenarioHistory';
import { Button } from '@/components/ui/button';
import { X, FolderOpen, Play, Edit2, Trash2, Loader2, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SavedScenariosPanelProps {
  open: boolean;
  onClose: () => void;
  onLoadScenario: (scenario: SavedScenario) => void;
}

export function SavedScenariosPanel({ open, onClose, onLoadScenario }: SavedScenariosPanelProps) {
  const { scenarios, isLoading, renameScenario, deleteScenario } = useScenarioHistory();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const handleRename = (id: string, currentName: string) => {
    setEditingId(id);
    setNewName(currentName || '');
  };

  const handleSaveRename = (id: string) => {
    if (!newName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    renameScenario({ id, name: newName });
    setEditingId(null);
    setNewName('');
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete scenario "${name}"? This cannot be undone.`)) {
      deleteScenario(id);
    }
  };

  const handleLoad = (scenario: SavedScenario) => {
    onLoadScenario(scenario);
    toast.success(`Loaded scenario: ${scenario.scenario_name || 'Unnamed'}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-card border-l border-border z-50 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FolderOpen className="w-6 h-6 text-accent" />
                <div>
                  <h2 className="text-xl font-bold text-foreground font-mono">Saved Scenarios</h2>
                  <p className="text-sm text-muted-foreground">Load previous simulations from database</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-accent animate-spin" />
                </div>
              ) : scenarios.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">No saved scenarios yet</p>
                  <p className="text-muted-foreground/60 text-xs mt-2">Create events and save your first scenario</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scenarios.map((scenario, idx) => (
                    <motion.div
                      key={scenario.id}
                      className="p-4 bg-muted/30 border border-border rounded-lg hover:border-accent/50 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      {/* Scenario Header */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        {editingId === scenario.id ? (
                          <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(scenario.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            onBlur={() => handleSaveRename(scenario.id)}
                            className="bg-muted/50 border-accent/50"
                            autoFocus
                          />
                        ) : (
                          <div className="flex-1">
                            <h3 className="text-foreground font-medium">
                              {scenario.scenario_name || 'Unnamed Scenario'}
                            </h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" />
                              {scenario.created_at && format(new Date(scenario.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRename(scenario.id, scenario.scenario_name || '')}
                            className="h-8 w-8 text-muted-foreground hover:text-accent"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(scenario.id, scenario.scenario_name || '')}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Scenario Stats */}
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="bg-muted/40 rounded p-2">
                          <div className="text-xs text-muted-foreground">Events</div>
                          <div className="text-sm font-mono text-foreground">
                            {(scenario.parameters as any)?.events?.length || 0}
                          </div>
                        </div>
                        <div className="bg-muted/40 rounded p-2">
                          <div className="text-xs text-muted-foreground">Final Worth</div>
                          <div className="text-sm font-mono text-green-500">
                            ${((scenario.projected_outcomes as any)?.finalNetWorth / 1000 || 0).toFixed(0)}K
                          </div>
                        </div>
                        <div className="bg-muted/40 rounded p-2">
                          <div className="text-xs text-muted-foreground">Success</div>
                          <div className="text-sm font-mono text-accent">
                            {Math.round((scenario.success_probability || 0) * 100)}%
                          </div>
                        </div>
                      </div>

                      {/* Load Button */}
                      <Button
                        onClick={() => handleLoad(scenario)}
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Load Scenario
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
