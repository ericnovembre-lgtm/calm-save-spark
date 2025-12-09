import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IncomeEntry, CreateIncomeEntry, IncomeSourceType, IncomeFrequency } from '@/hooks/useIncomeEntries';

interface AddIncomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CreateIncomeEntry) => void;
  editEntry?: IncomeEntry | null;
  isLoading?: boolean;
}

const SOURCE_TYPES: { value: IncomeSourceType; label: string }[] = [
  { value: 'salary', label: 'Salary' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'investment', label: 'Investment' },
  { value: 'rental', label: 'Rental' },
  { value: 'business', label: 'Business' },
  { value: 'side_hustle', label: 'Side Hustle' },
  { value: 'pension', label: 'Pension' },
  { value: 'benefits', label: 'Benefits' },
  { value: 'gift', label: 'Gift' },
  { value: 'other', label: 'Other' },
];

const FREQUENCIES: { value: IncomeFrequency; label: string }[] = [
  { value: 'one_time', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi_weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

export function AddIncomeModal({ open, onOpenChange, onSave, editEntry, isLoading }: AddIncomeModalProps) {
  const [sourceName, setSourceName] = useState('');
  const [sourceType, setSourceType] = useState<IncomeSourceType>('salary');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<IncomeFrequency>('monthly');
  const [taxWithheld, setTaxWithheld] = useState('');
  const [isTaxable, setIsTaxable] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editEntry) {
      setSourceName(editEntry.source_name);
      setSourceType(editEntry.source_type);
      setAmount(editEntry.amount.toString());
      setFrequency(editEntry.frequency);
      setTaxWithheld(editEntry.tax_withheld?.toString() ?? '');
      setIsTaxable(editEntry.is_taxable);
      setNotes(editEntry.notes ?? '');
    } else {
      resetForm();
    }
  }, [editEntry, open]);

  const resetForm = () => {
    setSourceName('');
    setSourceType('salary');
    setAmount('');
    setFrequency('monthly');
    setTaxWithheld('');
    setIsTaxable(true);
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      source_name: sourceName,
      source_type: sourceType,
      amount: parseFloat(amount) || 0,
      frequency,
      tax_withheld: parseFloat(taxWithheld) || 0,
      is_taxable: isTaxable,
      notes: notes || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editEntry ? 'Edit Income Source' : 'Add Income Source'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source-name">Source Name</Label>
            <Input
              id="source-name"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="e.g., Main Job, Freelance Work"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source-type">Type</Label>
              <Select value={sourceType} onValueChange={(v) => setSourceType(v as IncomeSourceType)}>
                <SelectTrigger id="source-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as IncomeFrequency)}>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map(freq => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-withheld">Tax Withheld ($)</Label>
              <Input
                id="tax-withheld"
                type="number"
                min="0"
                step="0.01"
                value={taxWithheld}
                onChange={(e) => setTaxWithheld(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is-taxable">Taxable Income</Label>
            <Switch
              id="is-taxable"
              checked={isTaxable}
              onCheckedChange={setIsTaxable}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : editEntry ? 'Save Changes' : 'Add Income'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
