import { ListFilter, Calendar, Repeat, Target, CreditCard, Bell, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CalendarFiltersProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
}

const EVENT_TYPES = [
  { id: 'bill', label: 'Bills', icon: CreditCard, color: 'text-red-500' },
  { id: 'income', label: 'Income', icon: DollarSign, color: 'text-green-500' },
  { id: 'subscription', label: 'Subscriptions', icon: Repeat, color: 'text-amber-500' },
  { id: 'goal_milestone', label: 'Goals', icon: Target, color: 'text-emerald-500' },
  { id: 'reminder', label: 'Reminders', icon: Bell, color: 'text-blue-500' },
  { id: 'custom', label: 'Custom', icon: Calendar, color: 'text-purple-500' },
];

export function CalendarFilters({ selectedTypes, onTypesChange }: CalendarFiltersProps) {
  const toggleType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      onTypesChange(selectedTypes.filter(t => t !== typeId));
    } else {
      onTypesChange([...selectedTypes, typeId]);
    }
  };

  const selectAll = () => {
    onTypesChange(EVENT_TYPES.map(t => t.id));
  };

  const clearAll = () => {
    onTypesChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by type</span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={selectAll}
            className="text-xs h-7"
          >
            All
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAll}
            className="text-xs h-7"
          >
            None
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {EVENT_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedTypes.includes(type.id);

          return (
            <Badge
              key={type.id}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer transition-all',
                isSelected && 'ring-1 ring-primary'
              )}
              onClick={() => toggleType(type.id)}
            >
              <Icon className={cn('w-3 h-3 mr-1', !isSelected && type.color)} />
              {type.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
