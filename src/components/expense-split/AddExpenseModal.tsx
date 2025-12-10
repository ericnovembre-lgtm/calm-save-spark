import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddSplitExpense, type SplitGroupMember } from '@/hooks/useSplitGroups';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  members: SplitGroupMember[];
}

const EXPENSE_CATEGORIES = [
  { value: 'general', label: 'General', icon: '📦' },
  { value: 'food', label: 'Food & Dining', icon: '🍽️' },
  { value: 'transport', label: 'Transportation', icon: '🚗' },
  { value: 'utilities', label: 'Utilities', icon: '💡' },
  { value: 'rent', label: 'Rent', icon: '🏠' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
];

export function AddExpenseModal({ isOpen, onClose, groupId, members }: AddExpenseModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('general');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(members.map(m => m.id));

  const addExpense = useAddSplitExpense();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    const totalAmount = parseFloat(amount);
    const shareAmount = totalAmount / selectedMembers.length;

    await addExpense.mutateAsync({
      group_id: groupId,
      description: description.trim(),
      total_amount: totalAmount,
      category,
      participants: selectedMembers.map(memberId => ({
        member_id: memberId,
        share_amount: shareAmount,
      })),
    });

    setDescription('');
    setAmount('');
    setCategory('general');
    setSplitType('equal');
    setSelectedMembers(members.map(m => m.id));
    onClose();
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const sharePerPerson = amount && selectedMembers.length > 0
    ? (parseFloat(amount) / selectedMembers.length).toFixed(2)
    : '0.00';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-card rounded-2xl border border-border/50 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50 sticky top-0 bg-card">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Add Expense</h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What was this expense for?"
                  required
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-7"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Split With</Label>
                  <span className="text-xs text-muted-foreground">
                    ${sharePerPerson} each
                  </span>
                </div>
                <div className="space-y-2">
                  {members.map(member => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleMember(member.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        selectedMembers.includes(member.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border/50 hover:border-border'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedMembers.includes(member.id) ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="font-medium">
                        {member.nickname || member.email || 'Member'}
                      </span>
                      {selectedMembers.includes(member.id) && (
                        <span className="ml-auto text-sm text-primary">${sharePerPerson}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={!description.trim() || !amount || selectedMembers.length === 0 || addExpense.isPending}
                >
                  {addExpense.isPending ? 'Adding...' : 'Add Expense'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
