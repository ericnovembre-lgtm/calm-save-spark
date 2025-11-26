import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Target, Lightbulb, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { useFinancialMemory } from '@/hooks/useFinancialMemory';
import { motion } from 'framer-motion';

const formSchema = z.object({
  content: z.string()
    .trim()
    .min(1, 'Memory content is required')
    .max(500, 'Memory must be under 500 characters'),
  category: z.enum(['goal', 'preference', 'insight', 'decision', 'pattern'], {
    required_error: 'Please select a category',
  }),
  importance: z.number().min(0.1).max(1),
});

type FormData = z.infer<typeof formSchema>;

interface MemoryInputFormProps {
  onMemoryStored?: () => void;
}

const categories = [
  { value: 'goal', label: 'Goal', icon: Target, description: 'Financial targets and objectives' },
  { value: 'preference', label: 'Preference', icon: Brain, description: 'Personal financial preferences' },
  { value: 'insight', label: 'Insight', icon: Lightbulb, description: 'Learned patterns or observations' },
  { value: 'decision', label: 'Decision', icon: TrendingUp, description: 'Financial decisions made' },
  { value: 'pattern', label: 'Pattern', icon: Sparkles, description: 'Recurring behaviors or trends' },
];

const templates = [
  { label: 'Add a savings goal', category: 'goal', placeholder: 'I want to save $5,000 for an emergency fund by end of year' },
  { label: 'Record a spending preference', category: 'preference', placeholder: 'I prefer to invest in low-risk index funds for long-term growth' },
  { label: 'Log a financial decision', category: 'decision', placeholder: 'I decided to increase my 401k contribution from 5% to 8%' },
];

export function MemoryInputForm({ onMemoryStored }: MemoryInputFormProps) {
  const { storeMemory, isLoading } = useFinancialMemory();
  const [showSuccess, setShowSuccess] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      importance: 0.5,
    },
  });

  const selectedCategory = watch('category');
  const content = watch('content');
  const importance = watch('importance');

  const onSubmit = async (data: FormData) => {
    try {
      await storeMemory({
        content: data.content,
        category: data.category,
        importance: data.importance,
      });

      setShowSuccess(true);
      reset();
      setCharCount(0);
      setTimeout(() => setShowSuccess(false), 2000);
      onMemoryStored?.();
    } catch (error) {
      console.error('Failed to store memory:', error);
    }
  };

  const applyTemplate = (template: typeof templates[0]) => {
    setValue('category', template.category as any);
    setValue('content', template.placeholder);
    setCharCount(template.placeholder.length);
  };

  const getImportanceLabel = (value: number) => {
    if (value < 0.4) return '🟢 Low';
    if (value < 0.7) return '🟡 Medium';
    return '🔴 High';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Add New Memory
        </CardTitle>
        <CardDescription>
          Store important financial information for AI-powered recall
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Quick Templates */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Templates</Label>
            <div className="flex flex-wrap gap-2">
              {templates.map((template) => (
                <Button
                  key={template.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate(template)}
                  className="text-xs"
                >
                  {template.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Memory Content *</Label>
            <Textarea
              id="content"
              placeholder="E.g., I want to save $5,000 for an emergency fund..."
              {...register('content')}
              onChange={(e) => {
                register('content').onChange(e);
                setCharCount(e.target.value.length);
              }}
              className="min-h-[100px] resize-none"
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{errors.content?.message}</span>
              <span>{charCount}/500</span>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setValue('category', value as any)}
              disabled={isLoading}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{cat.label}</div>
                          <div className="text-xs text-muted-foreground">{cat.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category.message}</p>
            )}
          </div>

          {/* Importance */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label htmlFor="importance">Importance Level</Label>
              <span className="text-sm font-medium">{getImportanceLabel(importance)}</span>
            </div>
            <Slider
              id="importance"
              min={0.1}
              max={1}
              step={0.1}
              value={[importance]}
              onValueChange={(values) => setValue('importance', values[0])}
              disabled={isLoading}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || showSuccess}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Storing Memory...
              </>
            ) : showSuccess ? (
              <>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mr-2"
                >
                  ✓
                </motion.span>
                Memory Stored!
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Store Memory
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
