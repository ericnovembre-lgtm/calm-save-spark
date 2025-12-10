import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Plus, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { WishlistCard } from '@/components/wishlist/WishlistCard';
import { WishlistStats } from '@/components/wishlist/WishlistStats';
import { AddWishlistItemModal } from '@/components/wishlist/AddWishlistItemModal';
import { useWishlist, type WishlistSortOption } from '@/hooks/useWishlist';

const SORT_OPTIONS: { value: WishlistSortOption; label: string }[] = [
  { value: 'priority', label: 'Priority' },
  { value: 'progress', label: 'Progress' },
  { value: 'amount', label: 'Price (High to Low)' },
  { value: 'date', label: 'Target Date' },
];

export default function WishlistTracker() {
  const [sortBy, setSortBy] = useState<WishlistSortOption>('priority');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { data: items, isLoading } = useWishlist(sortBy);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-12 w-48 bg-muted rounded-lg animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pb-24" data-copilot-id="wishlist-tracker-page">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Gift className="w-6 h-6 text-primary" />
              Wishlist Tracker
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Save for the things you want
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </motion.div>

        {/* Stats */}
        <WishlistStats />

        {/* Sort & Filter */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Wishlist</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SortAsc className="w-4 h-4 mr-2" />
                Sort: {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SORT_OPTIONS.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={sortBy === option.value ? 'bg-muted' : ''}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Items Grid */}
        {items && items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, index) => (
              <WishlistCard key={item.id} item={item} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 rounded-xl border border-dashed border-border"
          >
            <Gift className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Your wishlist is empty</p>
            <p className="text-sm text-muted-foreground/70 mb-4">
              Add items you're saving up for
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Item
            </Button>
          </motion.div>
        )}
      </div>

      <AddWishlistItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
