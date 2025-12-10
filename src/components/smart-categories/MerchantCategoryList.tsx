import { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Edit2, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useMerchantMappings } from '@/hooks/useMerchantMappings';

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

export function MerchantCategoryList() {
  const { mappings, isLoading, createMapping, deleteMapping } = useMerchantMappings();
  const [isOpen, setIsOpen] = useState(false);
  const [merchantName, setMerchantName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState('');

  const handleCreate = () => {
    if (!merchantName || !category) return;
    
    createMapping.mutate({
      merchant_name: merchantName,
      display_name: displayName || undefined,
      category,
    });
    
    setMerchantName('');
    setDisplayName('');
    setCategory('');
    setIsOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Merchant Mappings</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Merchant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Merchant Mapping</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Merchant Name (as it appears)</Label>
                <Input
                  placeholder="e.g., AMZN MKTP US"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Display Name (optional)</Label>
                <Input
                  placeholder="e.g., Amazon"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
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

              <Button onClick={handleCreate} className="w-full">
                Add Mapping
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : mappings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Store className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No merchant mappings yet.</p>
            <p className="text-sm">Add mappings to customize how merchants appear.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {mappings.map((mapping, index) => (
              <motion.div
                key={mapping.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {mapping.display_name || mapping.merchant_name}
                    </p>
                    {mapping.display_name && (
                      <p className="text-xs text-muted-foreground">
                        {mapping.merchant_name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {mapping.category}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMapping.mutate(mapping.id)}
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
