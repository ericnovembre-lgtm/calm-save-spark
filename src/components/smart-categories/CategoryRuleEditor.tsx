import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Power } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategoryRules } from '@/hooks/useCategoryRules';

const CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Bills & Utilities',
  'Health',
  'Travel',
  'Income',
  'Transfer',
  'Other',
];

export function CategoryRuleEditor() {
  const { rules, isLoading, createRule, updateRule, deleteRule } = useCategoryRules();
  const [isOpen, setIsOpen] = useState(false);
  const [pattern, setPattern] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('0');

  const handleCreate = () => {
    if (!pattern || !category) return;
    
    createRule.mutate({
      merchant_pattern: pattern,
      assigned_category: category,
      priority: parseInt(priority) || 0,
    });
    
    setPattern('');
    setCategory('');
    setPriority('0');
    setIsOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Category Rules</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Category Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Merchant Pattern</Label>
                <Input
                  placeholder="e.g., AMZN*, *COFFEE*, UBER*"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Use * as wildcard. Pattern matches merchant names.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Assign to Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority (higher = checked first)</Label>
                <Input
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  min="0"
                  max="100"
                />
              </div>

              <Button onClick={handleCreate} className="w-full">
                Create Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading rules...</div>
        ) : rules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No custom rules yet.</p>
            <p className="text-sm">Create rules to auto-categorize transactions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule, index) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-background px-2 py-0.5 rounded">
                      {rule.merchant_pattern}
                    </code>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-sm font-medium">{rule.assigned_category}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>Priority: {rule.priority}</span>
                    <span>Matched: {rule.match_count}x</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={(checked) => 
                      updateRule.mutate({ id: rule.id, is_active: checked })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRule.mutate(rule.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
