import { useState } from 'react';
import { motion } from 'framer-motion';
import { PenLine, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMoneyMindset, MindsetEntryType } from '@/hooks/useMoneyMindset';
import { MoodTracker } from './MoodTracker';

interface ReflectionEditorProps {
  onClose?: () => void;
}

export function ReflectionEditor({ onClose }: ReflectionEditorProps) {
  const { createEntry } = useMoneyMindset();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [entryType, setEntryType] = useState<MindsetEntryType>('reflection');
  const [moodScore, setMoodScore] = useState<number>(5);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    createEntry.mutate({
      entry_type: entryType,
      title: title.trim(),
      content: content.trim(),
      mood_score: moodScore,
      tags,
    }, {
      onSuccess: () => {
        setTitle('');
        setContent('');
        setMoodScore(5);
        setTags([]);
        onClose?.();
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl bg-card border border-border"
    >
      <div className="flex items-center gap-2 mb-4">
        <PenLine className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">New Entry</h3>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <Select value={entryType} onValueChange={(v) => setEntryType(v as MindsetEntryType)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reflection">Reflection</SelectItem>
              <SelectItem value="belief">Money Belief</SelectItem>
              <SelectItem value="goal_statement">Goal Statement</SelectItem>
              <SelectItem value="affirmation">Affirmation</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1"
          />
        </div>

        <Textarea
          placeholder="What's on your mind about money today?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />

        <MoodTracker value={moodScore} onChange={setMoodScore} />

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary flex items-center gap-1"
              >
                {tag}
                <button onClick={() => handleRemoveTag(tag)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={handleAddTag}>
              Add
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={createEntry.isPending}>
            {createEntry.isPending ? 'Saving...' : 'Save Entry'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
