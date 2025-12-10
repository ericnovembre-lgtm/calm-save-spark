import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateWishlistItem } from '@/hooks/useWishlist';

interface AddWishlistItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'travel', label: 'Travel' },
  { value: 'experience', label: 'Experience' },
  { value: 'hobby', label: 'Hobby' },
  { value: 'gift', label: 'Gift' },
];

export function AddWishlistItemModal({ isOpen, onClose }: AddWishlistItemModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [priority, setPriority] = useState(3);
  const [category, setCategory] = useState('general');
  const [imageUrl, setImageUrl] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const createItem = useCreateWishlistItem();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount) return;

    await createItem.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      target_amount: parseFloat(targetAmount),
      priority,
      category,
      image_url: imageUrl.trim() || undefined,
      product_url: productUrl.trim() || undefined,
      target_date: targetDate || undefined,
    });

    // Reset form
    setName('');
    setDescription('');
    setTargetAmount('');
    setPriority(3);
    setCategory('general');
    setImageUrl('');
    setProductUrl('');
    setTargetDate('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-card rounded-2xl border border-border/50 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50 sticky top-0 bg-card">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Add to Wishlist</h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., New MacBook Pro"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Why do you want this?"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="targetAmount">Target Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-7"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Priority</Label>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPriority(level)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          level <= (6 - priority)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-muted-foreground/30 hover:text-muted-foreground/50'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    {priority === 1 ? 'Urgent' : priority === 2 ? 'High' : priority === 3 ? 'Medium' : priority === 4 ? 'Low' : 'Someday'}
                  </span>
                </div>
              </div>

              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="targetDate">Target Date (optional)</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="productUrl">Product URL (optional)</Label>
                <Input
                  id="productUrl"
                  type="url"
                  value={productUrl}
                  onChange={e => setProductUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={!name.trim() || !targetAmount || createItem.isPending}
                >
                  {createItem.isPending ? 'Adding...' : 'Add to Wishlist'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
