import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink, Plus, Check, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import type { WishlistItem } from '@/hooks/useWishlist';
import { useAddToWishlistSavings, useMarkAsPurchased, useDeleteWishlistItem } from '@/hooks/useWishlist';
import { AddSavingsModal } from './AddSavingsModal';

interface WishlistCardProps {
  item: WishlistItem;
  index: number;
}

const PRIORITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Urgent', color: 'text-red-500 bg-red-500/10' },
  2: { label: 'High', color: 'text-orange-500 bg-orange-500/10' },
  3: { label: 'Medium', color: 'text-amber-500 bg-amber-500/10' },
  4: { label: 'Low', color: 'text-blue-500 bg-blue-500/10' },
  5: { label: 'Someday', color: 'text-muted-foreground bg-muted' },
};

export function WishlistCard({ item, index }: WishlistCardProps) {
  const [showAddSavings, setShowAddSavings] = useState(false);
  
  const markAsPurchased = useMarkAsPurchased();
  const deleteItem = useDeleteWishlistItem();

  const progress = item.target_amount > 0 
    ? (Number(item.saved_amount) / Number(item.target_amount)) * 100 
    : 0;
  const remaining = Number(item.target_amount) - Number(item.saved_amount);
  const priority = PRIORITY_LABELS[item.priority] || PRIORITY_LABELS[3];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="rounded-xl border border-border/50 bg-card overflow-hidden hover:border-primary/30 transition-colors"
        data-copilot-id={`wishlist-item-${item.id}`}
      >
        {/* Image */}
        {item.image_url && (
          <div className="aspect-video bg-muted overflow-hidden">
            <img 
              src={item.image_url} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {item.product_url && (
                  <DropdownMenuItem onClick={() => window.open(item.product_url!, '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Product
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => markAsPurchased.mutate(item.id)}
                  disabled={markAsPurchased.isPending}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark as Purchased
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => deleteItem.mutate(item.id)}
                  className="text-red-500"
                  disabled={deleteItem.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Priority & Category */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs px-2 py-0.5 rounded-full ${priority.color}`}>
              {priority.label}
            </span>
            <span className="text-xs text-muted-foreground capitalize">{item.category}</span>
          </div>

          {/* Progress */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                ${Number(item.saved_amount).toFixed(2)} saved
              </span>
              <span className="font-medium">
                ${Number(item.target_amount).toFixed(2)}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {progress >= 100 ? (
                <span className="text-green-600 font-medium">🎉 Ready to purchase!</span>
              ) : (
                `$${remaining.toFixed(2)} remaining`
              )}
            </p>
          </div>

          {/* Stars for priority visualization */}
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= (6 - item.priority) 
                    ? 'text-amber-400 fill-amber-400' 
                    : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          {/* Action button */}
          <Button 
            onClick={() => setShowAddSavings(true)}
            className="w-full"
            variant={progress >= 100 ? 'outline' : 'default'}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Savings
          </Button>
        </div>
      </motion.div>

      <AddSavingsModal
        isOpen={showAddSavings}
        onClose={() => setShowAddSavings(false)}
        item={item}
      />
    </>
  );
}
