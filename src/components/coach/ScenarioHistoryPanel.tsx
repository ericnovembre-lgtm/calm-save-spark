import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Edit2, Check, ChevronRight, TrendingUp, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useScenarioHistory, SavedScenario } from '@/hooks/useScenarioHistory';
import { formatCurrency } from '@/lib/utils';

interface ScenarioHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCompare: (scenarioIds: string[]) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

const SCENARIO_COLORS = [
  { line: 'hsl(189, 94%, 43%)', fill: 'hsl(189, 94%, 43%, 0.15)', name: 'cyan' },
  { line: 'hsl(258, 90%, 66%)', fill: 'hsl(258, 90%, 66%, 0.15)', name: 'violet' },
  { line: 'hsl(142, 71%, 45%)', fill: 'hsl(142, 71%, 45%, 0.15)', name: 'green' },
  { line: 'hsl(38, 92%, 50%)', fill: 'hsl(38, 92%, 50%, 0.15)', name: 'amber' },
];

export function ScenarioHistoryPanel({ 
  isOpen, 
  onClose, 
  onCompare, 
  selectedIds,
  onSelectionChange 
}: ScenarioHistoryPanelProps) {
  const { scenarios, isLoading, renameScenario, deleteScenario } = useScenarioHistory();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(sid => sid !== id));
    } else if (selectedIds.length < 4) {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renameScenario({ id, name: editName.trim() });
    }
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this scenario?')) {
      deleteScenario(id);
      onSelectionChange(selectedIds.filter(sid => sid !== id));
    }
  };

  const getScenarioColor = (index: number) => {
    return SCENARIO_COLORS[index % SCENARIO_COLORS.length];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-slate-950 border-l border-white/10 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-mono text-white">Scenario History</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <p className="text-sm text-white/60 mb-4">
                Select up to 4 scenarios to compare
              </p>

              {selectedIds.length >= 2 && (
                <Button
                  onClick={() => onCompare(selectedIds)}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-mono"
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Compare {selectedIds.length} Scenarios
                </Button>
              )}
            </div>

            {/* Scenarios List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {isLoading && (
                <div className="text-center text-white/40 py-12 font-mono">
                  Loading scenarios...
                </div>
              )}

              {!isLoading && scenarios.length === 0 && (
                <div className="text-center text-white/40 py-12 font-mono">
                  No saved scenarios yet
                </div>
              )}

              {scenarios.map((scenario, index) => {
                const isSelected = selectedIds.includes(scenario.id);
                const colorIndex = selectedIds.indexOf(scenario.id);
                const color = colorIndex >= 0 ? getScenarioColor(colorIndex) : null;
                const isEditing = editingId === scenario.id;

                return (
                  <motion.div
                    key={scenario.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative p-4 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-cyan-500/50 bg-cyan-500/5'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    {/* Color indicator */}
                    {color && (
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                        style={{ backgroundColor: color.line }}
                      />
                    )}

                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelect(scenario.id)}
                        disabled={!isSelected && selectedIds.length >= 4}
                        className="mt-1"
                      />

                      <div className="flex-1 min-w-0">
                        {/* Name */}
                        {isEditing ? (
                          <div className="flex gap-2 mb-2">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename(scenario.id);
                                if (e.key === 'Escape') {
                                  setEditingId(null);
                                  setEditName('');
                                }
                              }}
                              className="h-8 bg-black/20 border-white/20 text-white"
                              autoFocus
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleRename(scenario.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <h3 className="font-mono text-white mb-1 truncate">
                            {scenario.scenario_name || 'Untitled Scenario'}
                          </h3>
                        )}

                        {/* Type badge */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-white/40 uppercase px-2 py-0.5 bg-white/5 rounded">
                            {scenario.scenario_type}
                          </span>
                          <span className="text-xs text-white/40">
                            {new Date(scenario.created_at!).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          {scenario.success_probability !== null && (
                            <div className="flex items-center gap-2">
                              <Percent className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="text-xs text-white/60">Success:</span>
                              <span className="text-sm font-mono text-white">
                                {scenario.success_probability.toFixed(1)}%
                              </span>
                            </div>
                          )}
                          
                          {scenario.projected_outcomes && (
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
                              <span className="text-xs text-white/60">Final:</span>
                              <span className="text-sm font-mono text-white truncate">
                                {formatCurrency(scenario.projected_outcomes[scenario.projected_outcomes.length - 1]?.median || 0)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/40 hover:text-white"
                          onClick={() => {
                            setEditingId(scenario.id);
                            setEditName(scenario.scenario_name || '');
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/40 hover:text-red-400"
                          onClick={() => handleDelete(scenario.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
