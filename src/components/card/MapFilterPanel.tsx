import { motion } from "framer-motion";
import { Calendar, DollarSign, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface MapFilterPanelProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  dateRange: { start: Date; end: Date };
  onDateRangeChange: (range: { start: Date; end: Date }) => void;
  minAmount: number;
  onMinAmountChange: (amount: number) => void;
}

const CATEGORIES = [
  'Dining',
  'Shopping',
  'Groceries',
  'Transportation',
  'Healthcare',
  'Electronics',
  'Entertainment',
];

const DATE_PRESETS = [
  { label: 'This Week', days: 7 },
  { label: 'This Month', days: 30 },
  { label: 'Last 3 Months', days: 90 },
];

export function MapFilterPanel({
  selectedCategories,
  onCategoriesChange,
  dateRange,
  onDateRangeChange,
  minAmount,
  onMinAmountChange,
}: MapFilterPanelProps) {
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const setDatePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onDateRangeChange({ start, end });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-6 right-6 z-10"
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-background/95 backdrop-blur-sm shadow-xl border-border"
          >
            <Filter className="h-4 w-4" />
            Filters
            {(selectedCategories.length > 0 || minAmount > 0) && (
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                {selectedCategories.length + (minAmount > 0 ? 1 : 0)}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            {/* Date Range */}
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                Date Range
              </Label>
              <div className="flex flex-wrap gap-2">
                {DATE_PRESETS.map(preset => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    onClick={() => setDatePreset(preset.days)}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4" />
                Categories
              </Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategories.includes(category) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCategory(category)}
                    className="text-xs"
                  >
                    {category}
                  </Button>
                ))}
              </div>
              {selectedCategories.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCategoriesChange([])}
                  className="mt-2 text-xs w-full"
                >
                  Clear Categories
                </Button>
              )}
            </div>

            {/* Min Amount */}
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" />
                Minimum Amount
              </Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={minAmount}
                onChange={(e) => onMinAmountChange(Number(e.target.value))}
                placeholder="$0"
                className="text-sm"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </motion.div>
  );
}
