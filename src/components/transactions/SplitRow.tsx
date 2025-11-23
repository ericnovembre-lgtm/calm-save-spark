import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Split {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  paymentStatus: 'pending' | 'paid' | 'waived';
  paymentMethod?: string;
}

interface SplitRowProps {
  split: Split;
  splitType: 'equal' | 'percentage' | 'custom';
  totalAmount: number;
  onUpdate: (split: Split) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function SplitRow({ split, splitType, totalAmount, onUpdate, onRemove, canRemove }: SplitRowProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-glass rounded-lg border border-glass-border">
      <Input
        value={split.name}
        onChange={(e) => onUpdate({ ...split, name: e.target.value })}
        placeholder="Person name"
        className="flex-1"
      />

      {splitType === 'percentage' ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={split.percentage}
            onChange={(e) => {
              const pct = parseFloat(e.target.value) || 0;
              onUpdate({
                ...split,
                percentage: pct,
                amount: (totalAmount * pct) / 100,
              });
            }}
            className="w-20"
          />
          <span className="text-sm text-muted-foreground">%</span>
          <span className="text-sm text-muted-foreground min-w-[60px]">
            (${split.amount.toFixed(2)})
          </span>
        </div>
      ) : splitType === 'equal' ? (
        <div className="text-sm font-medium min-w-[100px] text-right">
          ${split.amount.toFixed(2)}
        </div>
      ) : (
        <Input
          type="number"
          step="0.01"
          min="0"
          value={split.amount}
          onChange={(e) => {
            const amt = parseFloat(e.target.value) || 0;
            onUpdate({
              ...split,
              amount: amt,
              percentage: (amt / totalAmount) * 100,
            });
          }}
          className="w-28"
        />
      )}

      <Select
        value={split.paymentStatus}
        onValueChange={(status) => onUpdate({ ...split, paymentStatus: status as any })}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="waived">Waived</SelectItem>
        </SelectContent>
      </Select>

      <Button
        size="icon"
        variant="ghost"
        onClick={onRemove}
        disabled={!canRemove}
        className="shrink-0"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
