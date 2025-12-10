import { motion } from 'framer-motion';
import { MessageCircle, Calculator, PiggyBank, CreditCard, TrendingUp, Trophy, LucideIcon } from 'lucide-react';
import { useForumCategories, ForumCategory } from '@/hooks/useForumCategories';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: Record<string, LucideIcon> = {
  MessageCircle,
  Calculator,
  PiggyBank,
  CreditCard,
  TrendingUp,
  Trophy,
};

interface CategoryListProps {
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

export function CategoryList({ selectedCategory, onSelectCategory }: CategoryListProps) {
  const { categories, isLoading } = useForumCategories();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => onSelectCategory(null)}
        className={`w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
          selectedCategory === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted/50 hover:bg-muted'
        }`}
      >
        <MessageCircle className="w-5 h-5" />
        <div>
          <p className="font-medium">All Discussions</p>
          <p className="text-xs opacity-70">Browse all categories</p>
        </div>
      </button>

      {categories.map((category, index) => {
        const Icon = iconMap[category.icon || 'MessageCircle'] || MessageCircle;
        
        return (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectCategory(category.slug)}
            className={`w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
              selectedCategory === category.slug
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 hover:bg-muted'
            }`}
          >
            <Icon className="w-5 h-5" />
            <div>
              <p className="font-medium">{category.name}</p>
              {category.description && (
                <p className="text-xs opacity-70 line-clamp-1">{category.description}</p>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
