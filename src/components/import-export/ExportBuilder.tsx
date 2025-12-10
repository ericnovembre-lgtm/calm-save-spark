import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, FileJson, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format as formatDate, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { useExportJobs } from '@/hooks/useExportJobs';

const EXPORT_TYPES = [
  { id: 'transactions', label: 'Transactions', description: 'Export all transactions', icon: FileText },
  { id: 'tax_report', label: 'Tax Report', description: 'Summarized for taxes', icon: FileSpreadsheet },
  { id: 'full_backup', label: 'Full Backup', description: 'Complete data export', icon: FileJson },
];

const FORMATS = [
  { id: 'csv', label: 'CSV', description: 'For spreadsheets' },
  { id: 'json', label: 'JSON', description: 'For developers' },
];

export function ExportBuilder() {
  const { createExport } = useExportJobs();
  const [exportType, setExportType] = useState('transactions');
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });

  const handleExport = () => {
    createExport.mutate({
      export_type: exportType,
      format: exportFormat,
      date_range_start: dateRange.from ? formatDate(dateRange.from, 'yyyy-MM-dd') : undefined,
      date_range_end: dateRange.to ? formatDate(dateRange.to, 'yyyy-MM-dd') : undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Export Type</Label>
          <div className="grid gap-3">
            {EXPORT_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <motion.button
                  key={type.id}
                  onClick={() => setExportType(type.id)}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-lg border text-left transition-all',
                    exportType === type.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  )}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', exportType === type.id ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{type.label}</p>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {exportType !== 'full_backup' && (
          <div className="space-y-3">
            <Label>Date Range</Label>
            <div className="flex gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    {dateRange.from ? formatDate(dateRange.from, 'PP') : 'Start'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={dateRange.from} onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))} />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    {dateRange.to ? formatDate(dateRange.to, 'PP') : 'End'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={dateRange.to} onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Label>Format</Label>
          <RadioGroup value={exportFormat} onValueChange={setExportFormat} className="grid grid-cols-2 gap-3">
            {FORMATS.map((fmt) => (
              <Label key={fmt.id} className={cn('flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer', exportFormat === fmt.id ? 'border-primary bg-primary/5' : 'border-border')}>
                <RadioGroupItem value={fmt.id} className="sr-only" />
                <span className="font-medium uppercase">{fmt.id}</span>
                <span className="text-xs text-muted-foreground">{fmt.description}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <Button onClick={handleExport} className="w-full" disabled={createExport.isPending}>
          <Download className="w-4 h-4 mr-2" />
          {createExport.isPending ? 'Exporting...' : 'Export Now'}
        </Button>
      </CardContent>
    </Card>
  );
}
