import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface MilestoneFiltersProps {
  onFilterChange: (filter: string) => void;
  onYearChange: (year: string) => void;
  availableYears: string[];
}

const milestoneTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'first_goal', label: 'First Goal' },
  { value: 'first_pot', label: 'First Pot' },
  { value: 'first_account', label: 'First Account' },
  { value: 'onboarding_completed', label: 'Onboarding' },
  { value: 'goal_reached', label: 'Goal Reached' },
  { value: 'streak_milestone', label: 'Streak' },
  { value: 'savings_milestone', label: 'Savings' },
];

export function MilestoneFilters({ onFilterChange, onYearChange, availableYears }: MilestoneFiltersProps) {
  const [activeFilter, setActiveFilter] = useState('all');

  const handleFilterClick = (value: string) => {
    setActiveFilter(value);
    onFilterChange(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {milestoneTypes.slice(0, 5).map(type => (
            <Button
              key={type.value}
              variant={activeFilter === type.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterClick(type.value)}
              className="text-xs"
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select onValueChange={onYearChange} defaultValue="all">
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {availableYears.map(year => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={onFilterChange} defaultValue="all">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Milestone type" />
          </SelectTrigger>
          <SelectContent>
            {milestoneTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
