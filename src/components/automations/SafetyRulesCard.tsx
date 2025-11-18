import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Shield, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SafetyRulesCardProps {
  minBalance: number;
  onUpdate: (minBalance: number) => Promise<void>;
}

export function SafetyRulesCard({ minBalance, onUpdate }: SafetyRulesCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(minBalance.toString());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    setEditValue(minBalance.toString());
    setError('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(minBalance.toString());
    setError('');
  };

  const handleSave = async () => {
    const value = parseFloat(editValue);
    
    if (isNaN(value) || value < 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (value < 50) {
      setError('Minimum balance should be at least $50');
      return;
    }

    setSaving(true);
    try {
      await onUpdate(value);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update safety rule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-500/10">
            <Shield className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <CardTitle>Safety Rules</CardTitle>
            <CardDescription>
              Protect your finances with automatic safeguards
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-medium text-foreground mb-1">
                  Low Balance Protection
                </h3>
                <p className="text-sm text-muted-foreground">
                  Automatically pause all scheduled transfers when your account balance falls below the threshold
                </p>
              </div>

              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="min_balance" className="text-xs">
                      Minimum Balance Threshold
                    </Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          id="min_balance"
                          type="number"
                          min="50"
                          step="10"
                          value={editValue}
                          onChange={(e) => {
                            setEditValue(e.target.value);
                            setError('');
                          }}
                          className={error ? 'border-destructive' : ''}
                          disabled={saving}
                        />
                        {error && (
                          <p className="text-xs text-destructive mt-1">{error}</p>
                        )}
                      </div>
                      <Button
                        size="icon"
                        onClick={handleSave}
                        disabled={saving}
                        className="shrink-0"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                        className="shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="display"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between"
                  >
                    <p className="text-sm">
                      <span className="text-muted-foreground">Pause if balance below:</span>{' '}
                      <span className="font-semibold text-foreground">
                        ${minBalance.toLocaleString()}
                      </span>
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleEdit}
                      className="gap-2"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
