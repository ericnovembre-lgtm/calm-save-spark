import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InsightImpactLevel } from '@/hooks/useInsightsArchive';
import { X } from 'lucide-react';

interface InsightFiltersProps {
  filters: {
    insightType?: string;
    impactLevel?: InsightImpactLevel;
    actionTaken?: boolean;
    dismissed?: boolean;
    sourceAgent?: string;
  };
  onFiltersChange: (filters: any) => void;
}

const insightTypes = [
  'recommendation',
  'alert',
  'opportunity',
  'automation',
  'prediction',
  'analysis',
];

const impactLevels: InsightImpactLevel[] = ['low', 'medium', 'high', 'critical'];

const agents = [
  'AI Coach',
  'Digital Twin',
  'Budget Analyzer',
  'Savings Coach',
  'Investment Advisor',
];

export function InsightFilters({ filters, onFiltersChange }: InsightFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div>
          <Label className="text-xs">Type</Label>
          <Select
            value={filters.insightType || ''}
            onValueChange={v => onFiltersChange({ ...filters, insightType: v || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              {insightTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Impact</Label>
          <Select
            value={filters.impactLevel || ''}
            onValueChange={v => onFiltersChange({ ...filters, impactLevel: v || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any impact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any impact</SelectItem>
              {impactLevels.map(level => (
                <SelectItem key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Source</Label>
          <Select
            value={filters.sourceAgent || ''}
            onValueChange={v => onFiltersChange({ ...filters, sourceAgent: v || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any agent</SelectItem>
              {agents.map(agent => (
                <SelectItem key={agent} value={agent}>
                  {agent}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Action Status</Label>
          <Select
            value={filters.actionTaken === undefined ? '' : String(filters.actionTaken)}
            onValueChange={v => onFiltersChange({ 
              ...filters, 
              actionTaken: v === '' ? undefined : v === 'true' 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any status</SelectItem>
              <SelectItem value="true">Action taken</SelectItem>
              <SelectItem value="false">Pending action</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Show Dismissed</Label>
          <Select
            value={filters.dismissed === undefined ? 'false' : String(filters.dismissed)}
            onValueChange={v => onFiltersChange({ 
              ...filters, 
              dismissed: v === 'true' ? true : v === 'false' ? false : undefined 
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Hide dismissed</SelectItem>
              <SelectItem value="true">Show only dismissed</SelectItem>
              <SelectItem value="">Show all</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}