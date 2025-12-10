import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, TrendingUp, MessageCircle, Heart } from 'lucide-react';

interface PostFiltersProps {
  sortBy: 'newest' | 'popular' | 'most_comments' | 'most_liked';
  onSortChange: (sort: 'newest' | 'popular' | 'most_comments' | 'most_liked') => void;
}

export function PostFilters({ sortBy, onSortChange }: PostFiltersProps) {
  const sortOptions = [
    { value: 'newest', label: 'Newest', icon: Clock },
    { value: 'popular', label: 'Most Viewed', icon: TrendingUp },
    { value: 'most_comments', label: 'Most Comments', icon: MessageCircle },
    { value: 'most_liked', label: 'Most Liked', icon: Heart },
  ] as const;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Sort by:</span>
      
      {/* Desktop buttons */}
      <div className="hidden md:flex gap-1">
        {sortOptions.map(option => {
          const Icon = option.icon;
          return (
            <Button
              key={option.value}
              variant={sortBy === option.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onSortChange(option.value)}
            >
              <Icon className="w-4 h-4 mr-1" />
              {option.label}
            </Button>
          );
        })}
      </div>

      {/* Mobile select */}
      <div className="md:hidden">
        <Select value={sortBy} onValueChange={(v) => onSortChange(v as typeof sortBy)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
