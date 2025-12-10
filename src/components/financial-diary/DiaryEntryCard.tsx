import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DiaryEntry, DiaryMood } from '@/hooks/useDiaryEntries';
import { format } from 'date-fns';
import { Edit2, Trash2, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const moodEmojis: Record<DiaryMood, string> = {
  great: '😊',
  good: '🙂',
  neutral: '😐',
  stressed: '😰',
  anxious: '😟',
};

const moodColors: Record<DiaryMood, string> = {
  great: 'bg-green-100 text-green-800',
  good: 'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-800',
  stressed: 'bg-orange-100 text-orange-800',
  anxious: 'bg-red-100 text-red-800',
};

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  onEdit?: (entry: DiaryEntry) => void;
  onDelete?: (id: string) => void;
}

export function DiaryEntryCard({ entry, onEdit, onDelete }: DiaryEntryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">
                {format(new Date(entry.entry_date), 'MMM d, yyyy')}
              </span>
              {entry.mood && (
                <Badge variant="secondary" className={moodColors[entry.mood]}>
                  {moodEmojis[entry.mood]} {entry.mood}
                </Badge>
              )}
              {entry.financial_event_type && (
                <Badge variant="outline">{entry.financial_event_type}</Badge>
              )}
            </div>

            {entry.title && (
              <h3 className="font-semibold mb-1">{entry.title}</h3>
            )}

            <p className="text-sm text-foreground/80 whitespace-pre-wrap line-clamp-3">
              {entry.content}
            </p>

            {entry.amount_involved !== null && (
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <DollarSign className="w-3 h-3" />
                <span>
                  {entry.amount_involved >= 0 ? '+' : ''}
                  ${Math.abs(entry.amount_involved).toLocaleString()}
                </span>
              </div>
            )}

            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {entry.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(entry)}
                className="h-8 w-8"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(entry.id)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}