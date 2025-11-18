import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface AutomationFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: {
    id?: string;
    rule_name: string;
    frequency: string;
    start_date: string;
    action_config: { amount: number };
    notes?: string;
  };
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
}

export function AutomationFormModal({ open, mode, initialData, onSubmit, onClose }: AutomationFormModalProps) {
  const [formData, setFormData] = useState({
    rule_name: '',
    amount: '',
    frequency: 'weekly',
    start_date: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        rule_name: initialData.rule_name,
        amount: initialData.action_config.amount.toString(),
        frequency: initialData.frequency,
        start_date: initialData.start_date,
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        rule_name: '',
        amount: '',
        frequency: 'weekly',
        start_date: '',
        notes: '',
      });
    }
    setErrors({});
  }, [initialData, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.rule_name.trim()) {
      newErrors.rule_name = 'Automation name is required';
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    } else {
      const selectedDate = new Date(formData.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.start_date = 'Start date must be today or in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...(mode === 'edit' && initialData?.id ? { id: initialData.id } : {}),
        rule_name: formData.rule_name.trim(),
        frequency: formData.frequency,
        start_date: formData.start_date,
        action_config: {
          amount: parseFloat(formData.amount),
        },
        notes: formData.notes.trim() || null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {mode === 'create' ? 'Create Automation' : 'Edit Automation'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {mode === 'create' 
              ? 'Set up a recurring transfer to automate your savings'
              : 'Update your automation settings'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="rule_name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="rule_name"
              value={formData.rule_name}
              onChange={(e) => handleInputChange('rule_name', e.target.value)}
              placeholder="e.g., Weekly Savings"
              className={errors.rule_name ? 'border-destructive' : ''}
            />
            {errors.rule_name && (
              <p className="text-xs text-destructive">{errors.rule_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount ($) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="e.g., 50"
              className={errors.amount ? 'border-destructive' : ''}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => handleInputChange('frequency', value)}
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">
              Start Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => handleInputChange('start_date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={errors.start_date ? 'border-destructive' : ''}
            />
            {errors.start_date && (
              <p className="text-xs text-destructive">{errors.start_date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add notes about this automation..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={submitting}
            >
              {submitting 
                ? 'Saving...' 
                : mode === 'create' ? 'Create Automation' : 'Update Automation'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
