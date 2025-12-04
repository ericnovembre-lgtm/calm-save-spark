import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, TrendingDown, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSentimentAlerts, AlertType } from '@/hooks/useSentimentAlerts';

interface SentimentAlertConfigProps {
  ticker: string;
  isOpen: boolean;
  onClose: () => void;
}

const ALERT_TYPES: { value: AlertType; label: string; icon: typeof Bell; description: string }[] = [
  {
    value: 'sentiment_shift',
    label: 'Score Shift',
    icon: Activity,
    description: 'Alert when sentiment score changes significantly',
  },
  {
    value: 'state_change',
    label: 'State Change',
    icon: TrendingDown,
    description: 'Alert when sentiment changes category (e.g., bullish → bearish)',
  },
  {
    value: 'volume_spike',
    label: 'Volume Spike',
    icon: TrendingUp,
    description: 'Alert when discussion volume reaches high or viral',
  },
  {
    value: 'confidence_drop',
    label: 'Confidence Drop',
    icon: AlertTriangle,
    description: 'Alert when confidence falls below threshold',
  },
];

const SENTIMENT_STATES = ['very_bearish', 'bearish', 'neutral', 'bullish', 'very_bullish'];

export const SentimentAlertConfig = ({ ticker, isOpen, onClose }: SentimentAlertConfigProps) => {
  const { alerts, createAlert, deleteAlert, isCreating } = useSentimentAlerts();
  const [selectedType, setSelectedType] = useState<AlertType>('state_change');
  const [threshold, setThreshold] = useState(30);
  const [fromState, setFromState] = useState<string>('');
  const [toState, setToState] = useState<string>('');

  const existingAlerts = alerts.filter(a => a.ticker === ticker);

  const handleCreate = async () => {
    await createAlert({
      ticker,
      alert_type: selectedType,
      threshold_value: selectedType === 'sentiment_shift' || selectedType === 'confidence_drop' ? threshold : undefined,
      from_state: selectedType === 'state_change' && fromState ? fromState : undefined,
      to_state: selectedType === 'state_change' && toState ? toState : undefined,
    });
    onClose();
  };

  const handleDelete = async (id: string) => {
    await deleteAlert(id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Bell className="h-5 w-5 text-cyan-400" />
            Configure Alerts for {ticker}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Alerts */}
          {existingAlerts.length > 0 && (
            <div className="space-y-2">
              <Label className="text-white/60 text-xs uppercase tracking-wider">Active Alerts</Label>
              <div className="space-y-2">
                {existingAlerts.map(alert => {
                  const typeConfig = ALERT_TYPES.find(t => t.value === alert.alert_type);
                  const Icon = typeConfig?.icon || Bell;
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm text-white">{typeConfig?.label}</span>
                        {alert.threshold_value && (
                          <span className="text-xs text-white/40">
                            ({alert.threshold_value}{alert.alert_type === 'confidence_drop' ? '%' : ' pts'})
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(alert.id)}
                        className="h-6 w-6 p-0 text-white/40 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Create New Alert */}
          <div className="space-y-4">
            <Label className="text-white/60 text-xs uppercase tracking-wider">Create New Alert</Label>

            {/* Alert Type Selection */}
            <div className="grid grid-cols-2 gap-2">
              {ALERT_TYPES.map(type => {
                const Icon = type.icon;
                const isSelected = selectedType === type.value;
                const isDisabled = existingAlerts.some(a => a.alert_type === type.value);

                return (
                  <button
                    key={type.value}
                    onClick={() => !isDisabled && setSelectedType(type.value)}
                    disabled={isDisabled}
                    className={`p-3 rounded-lg border transition-all text-left ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : isDisabled
                        ? 'border-white/5 bg-slate-800/30 opacity-50 cursor-not-allowed'
                        : 'border-white/10 bg-slate-800/50 hover:border-white/20'
                    }`}
                  >
                    <Icon className={`h-4 w-4 mb-1 ${isSelected ? 'text-cyan-400' : 'text-white/40'}`} />
                    <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/60'}`}>
                      {type.label}
                    </div>
                    <div className="text-xs text-white/40 mt-0.5 line-clamp-2">{type.description}</div>
                  </button>
                );
              })}
            </div>

            {/* Type-specific Configuration */}
            <AnimatePresence mode="wait">
              {selectedType === 'sentiment_shift' && (
                <motion.div
                  key="shift"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <Label className="text-white/80 text-sm">
                    Score Change Threshold: <span className="text-cyan-400">{threshold} points</span>
                  </Label>
                  <Slider
                    value={[threshold]}
                    onValueChange={([v]) => setThreshold(v)}
                    min={10}
                    max={80}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-white/40">
                    Alert when sentiment score changes by {threshold} points or more
                  </p>
                </motion.div>
              )}

              {selectedType === 'state_change' && (
                <motion.div
                  key="state"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-white/60 text-xs">From State (optional)</Label>
                      <Select value={fromState} onValueChange={setFromState}>
                        <SelectTrigger className="bg-slate-800 border-white/10">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any</SelectItem>
                          {SENTIMENT_STATES.map(s => (
                            <SelectItem key={s} value={s}>
                              {s.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/60 text-xs">To State (optional)</Label>
                      <Select value={toState} onValueChange={setToState}>
                        <SelectTrigger className="bg-slate-800 border-white/10">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any</SelectItem>
                          {SENTIMENT_STATES.map(s => (
                            <SelectItem key={s} value={s}>
                              {s.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-white/40">
                    Alert when sentiment state changes{fromState ? ` from ${fromState.replace('_', ' ')}` : ''}{toState ? ` to ${toState.replace('_', ' ')}` : ''}
                  </p>
                </motion.div>
              )}

              {selectedType === 'confidence_drop' && (
                <motion.div
                  key="confidence"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <Label className="text-white/80 text-sm">
                    Confidence Threshold: <span className="text-cyan-400">{threshold}%</span>
                  </Label>
                  <Slider
                    value={[threshold]}
                    onValueChange={([v]) => setThreshold(v)}
                    min={50}
                    max={90}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-white/40">
                    Alert when confidence drops below {threshold}%
                  </p>
                </motion.div>
              )}

              {selectedType === 'volume_spike' && (
                <motion.div
                  key="volume"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <p className="text-xs text-white/40">
                    Alert when discussion volume reaches "high" or "viral" levels
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/10 text-white/60 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || existingAlerts.some(a => a.alert_type === selectedType)}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {isCreating ? 'Creating...' : 'Create Alert'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
