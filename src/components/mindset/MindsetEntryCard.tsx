import { motion } from 'framer-motion';
import { Trash2, Edit, Calendar } from 'lucide-react';
import { MindsetEntry, useMoneyMindset } from '@/hooks/useMoneyMindset';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

const moodEmojis = ['😢', '😔', '😕', '😐', '🙂', '😊', '😄', '😃', '🤩', '🥳'];

const typeColors = {
  reflection: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  belief: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  goal_statement: 'bg-green-500/10 text-green-500 border-green-500/20',
  affirmation: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
};

interface MindsetEntryCardProps {
  entry: MindsetEntry;
  index: number;
}

export function MindsetEntryCard({ entry, index }: MindsetEntryCardProps) {
  const { deleteEntry } = useMoneyMindset();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 text-xs rounded-full border ${typeColors[entry.entry_type]}`}>
              {entry.entry_type.replace('_', ' ')}
            </span>
            {entry.mood_score && (
              <span className="text-lg" title={`Mood: ${entry.mood_score}/10`}>
                {moodEmojis[entry.mood_score - 1]}
              </span>
            )}
          </div>

          <h4 className="font-medium mb-1">{entry.title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-3">{entry.content}</p>

          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {entry.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}</span>
          </div>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => deleteEntry.mutate(entry.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
