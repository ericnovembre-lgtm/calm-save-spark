import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Briefcase, 
  Laptop, 
  TrendingUp, 
  Home, 
  Building2,
  Sparkles,
  Heart,
  Gift,
  CircleDollarSign,
  HelpCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IncomeEntry, IncomeSourceType, IncomeFrequency } from '@/hooks/useIncomeEntries';
import { motion, AnimatePresence } from 'framer-motion';

interface IncomeSourcesListProps {
  entries: IncomeEntry[];
  onEdit: (entry: IncomeEntry) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

const SOURCE_ICONS: Record<IncomeSourceType, React.ReactNode> = {
  salary: <Briefcase className="w-4 h-4" />,
  freelance: <Laptop className="w-4 h-4" />,
  investment: <TrendingUp className="w-4 h-4" />,
  rental: <Home className="w-4 h-4" />,
  business: <Building2 className="w-4 h-4" />,
  side_hustle: <Sparkles className="w-4 h-4" />,
  pension: <Heart className="w-4 h-4" />,
  benefits: <CircleDollarSign className="w-4 h-4" />,
  gift: <Gift className="w-4 h-4" />,
  other: <HelpCircle className="w-4 h-4" />,
};

const FREQUENCY_LABELS: Record<IncomeFrequency, string> = {
  one_time: 'One-time',
  weekly: 'Weekly',
  bi_weekly: 'Bi-weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually',
};

export function IncomeSourcesList({ entries, onEdit, onDelete, onToggleActive }: IncomeSourcesListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CircleDollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-1">No income sources yet</h3>
          <p className="text-sm text-muted-foreground">
            Add your first income source to start tracking
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-copilot-id="income-sources-list">
      <CardHeader>
        <CardTitle className="text-lg">Income Sources</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <AnimatePresence>
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 border-b last:border-b-0 ${!entry.is_active ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${entry.is_active ? 'bg-amber-500/10' : 'bg-muted'}`}>
                    {SOURCE_ICONS[entry.source_type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{entry.source_name}</p>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {entry.source_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ${entry.amount.toLocaleString()} {FREQUENCY_LABELS[entry.frequency].toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={entry.is_active}
                    onCheckedChange={(checked) => onToggleActive(entry.id, checked)}
                    aria-label={entry.is_active ? 'Pause income' : 'Activate income'}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(entry)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(entry.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {entry.notes && (
                <p className="text-xs text-muted-foreground mt-2 ml-11">
                  {entry.notes}
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
