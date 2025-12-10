import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoodSelector } from './MoodSelector';
import { DiaryMood } from '@/hooks/useDiaryEntries';
import { format } from 'date-fns';

interface CreateDiaryEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: {
    entry_date: string;
    title?: string;
    content: string;
    mood?: DiaryMood;
    mood_score?: number;
    financial_event_type?: string;
    amount_involved?: number;
    tags?: string[];
  }) => void;
}

const eventTypes = [
  'purchase',
  'income',
  'investment',
  'bill_payment',
  'savings',
  'unexpected_expense',
  'financial_decision',
  'goal_progress',
  'other',
];

export function CreateDiaryEntryModal({ isOpen, onClose, onSubmit }: CreateDiaryEntryModalProps) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<DiaryMood | null>(null);
  const [eventType, setEventType] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      entry_date: date,
      title: title || undefined,
      content,
      mood: mood || undefined,
      financial_event_type: eventType || undefined,
      amount_involved: amount ? parseFloat(amount) : undefined,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
    });

    // Reset form
    setTitle('');
    setContent('');
    setMood(null);
    setEventType('');
    setAmount('');
    setTags('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Diary Entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>How are you feeling about your finances?</Label>
            <MoodSelector value={mood} onChange={setMood} />
          </div>

          <div>
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Give this entry a title..."
            />
          </div>

          <div>
            <Label htmlFor="content">What's on your mind?</Label>
            <Textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write about your financial thoughts, decisions, or events..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount Involved</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="$0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="budgeting, savings, goals..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!content.trim()}>
              Save Entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}