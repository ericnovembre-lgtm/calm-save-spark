import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";
import type { Timeframe } from "@/hooks/useAnalyticsData";

interface TimeframePickerProps {
  value: Timeframe;
  onChange: (value: Timeframe) => void;
}

const TIMEFRAME_OPTIONS: { value: Timeframe; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year' },
];

export function TimeframePicker({ value, onChange }: TimeframePickerProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-muted-foreground" />
      <Tabs value={value} onValueChange={(v) => onChange(v as Timeframe)}>
        <TabsList className="h-9">
          {TIMEFRAME_OPTIONS.map((option) => (
            <TabsTrigger
              key={option.value}
              value={option.value}
              className="text-xs px-3"
            >
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
