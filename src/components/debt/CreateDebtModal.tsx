import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, GraduationCap, Home, Car, User, FileText } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Debt = Database['public']['Tables']['debts']['Row'];

interface CreateDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  debt?: Debt | null;
}

const debtTypeIcons: Record<string, any> = {
  credit_card: CreditCard,
  student_loan: GraduationCap,
  mortgage: Home,
  auto_loan: Car,
  personal_loan: User,
  other: FileText,
};

export default function CreateDebtModal({ isOpen, onClose, onSave, debt }: CreateDebtModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    debt_name: '',
    debt_type: 'credit_card',
    current_balance: '',
    original_balance: '',
    interest_rate: '',
    minimum_payment: '',
    actual_payment: '',
    payoff_strategy: 'avalanche',
  });

  useEffect(() => {
    if (debt) {
      setFormData({
        debt_name: debt.debt_name,
        debt_type: debt.debt_type,
        current_balance: String(debt.current_balance),
        original_balance: String(debt.original_balance || debt.current_balance),
        interest_rate: String(debt.interest_rate),
        minimum_payment: String(debt.minimum_payment),
        actual_payment: String(debt.actual_payment || debt.minimum_payment),
        payoff_strategy: debt.payoff_strategy || 'avalanche',
      });
    } else {
      setFormData({
        debt_name: '',
        debt_type: 'credit_card',
        current_balance: '',
        original_balance: '',
        interest_rate: '',
        minimum_payment: '',
        actual_payment: '',
        payoff_strategy: 'avalanche',
      });
    }
  }, [debt, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.debt_name.trim()) {
      toast.error('Please enter a debt name');
      return;
    }

    if (!formData.current_balance || parseFloat(formData.current_balance) <= 0) {
      toast.error('Please enter a valid balance');
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        debt_name: formData.debt_name,
        debt_type: formData.debt_type,
        current_balance: parseFloat(formData.current_balance),
        original_balance: formData.original_balance 
          ? parseFloat(formData.original_balance) 
          : parseFloat(formData.current_balance),
        interest_rate: parseFloat(formData.interest_rate) || 0,
        minimum_payment: parseFloat(formData.minimum_payment) || 0,
        actual_payment: formData.actual_payment 
          ? parseFloat(formData.actual_payment) 
          : parseFloat(formData.minimum_payment) || 0,
        payoff_strategy: formData.payoff_strategy,
        principal_amount: formData.original_balance 
          ? parseFloat(formData.original_balance) 
          : parseFloat(formData.current_balance),
      };

      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Error saving debt:', error);
      toast.error('Failed to save debt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{debt ? 'Edit Debt' : 'Add New Debt'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Debt Name */}
          <div>
            <Label htmlFor="debt_name">Debt Name</Label>
            <Input
              id="debt_name"
              value={formData.debt_name}
              onChange={(e) => setFormData({ ...formData, debt_name: e.target.value })}
              placeholder="e.g., Chase Credit Card"
              required
            />
          </div>

          {/* Debt Type */}
          <div>
            <Label htmlFor="debt_type">Debt Type</Label>
            <Select value={formData.debt_type} onValueChange={(v) => setFormData({ ...formData, debt_type: v })}>
              <SelectTrigger id="debt_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(debtTypeIcons).map(([type, Icon]) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Balance Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="current_balance">Current Balance</Label>
              <Input
                id="current_balance"
                type="number"
                step="0.01"
                value={formData.current_balance}
                onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })}
                placeholder="5000"
                required
              />
            </div>
            <div>
              <Label htmlFor="original_balance">Original Balance</Label>
              <Input
                id="original_balance"
                type="number"
                step="0.01"
                value={formData.original_balance}
                onChange={(e) => setFormData({ ...formData, original_balance: e.target.value })}
                placeholder="10000"
              />
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <Label htmlFor="interest_rate">Interest Rate (%)</Label>
            <Input
              id="interest_rate"
              type="number"
              step="0.01"
              value={formData.interest_rate}
              onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
              placeholder="18.99"
            />
          </div>

          {/* Payment Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minimum_payment">Minimum Payment</Label>
              <Input
                id="minimum_payment"
                type="number"
                step="0.01"
                value={formData.minimum_payment}
                onChange={(e) => setFormData({ ...formData, minimum_payment: e.target.value })}
                placeholder="100"
              />
            </div>
            <div>
              <Label htmlFor="actual_payment">Actual Payment</Label>
              <Input
                id="actual_payment"
                type="number"
                step="0.01"
                value={formData.actual_payment}
                onChange={(e) => setFormData({ ...formData, actual_payment: e.target.value })}
                placeholder="150"
              />
            </div>
          </div>

          {/* Payoff Strategy */}
          <div>
            <Label htmlFor="payoff_strategy">Payoff Strategy</Label>
            <Select value={formData.payoff_strategy} onValueChange={(v) => setFormData({ ...formData, payoff_strategy: v })}>
              <SelectTrigger id="payoff_strategy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="avalanche">Avalanche (Highest Interest First)</SelectItem>
                <SelectItem value="snowball">Snowball (Smallest Balance First)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : debt ? 'Update Debt' : 'Add Debt'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
