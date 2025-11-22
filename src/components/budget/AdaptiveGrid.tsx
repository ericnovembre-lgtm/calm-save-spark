import { ReactNode } from 'react';
import { motion } from 'framer-motion';

type Priority = 'hero' | 'large' | 'normal';

interface AdaptiveGridProps<T> {
  items: T[];
  getPriority: (item: T) => Priority;
  children: (item: T, size: Priority) => ReactNode;
}

export function AdaptiveGrid<T extends { id: string }>({ 
  items, 
  getPriority, 
  children 
}: AdaptiveGridProps<T>) {
  // Sort items by priority (hero > large > normal)
  const sortedItems = [...items].sort((a, b) => {
    const priorityOrder: Record<Priority, number> = { hero: 0, large: 1, normal: 2 };
    return priorityOrder[getPriority(a)] - priorityOrder[getPriority(b)];
  });

  return (
    <motion.div 
      className="grid gap-6 auto-rows-auto"
      layout
    >
      {sortedItems.map((item, index) => {
        const priority = getPriority(item);
        
        return (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              layout: { duration: 0.4, type: 'spring', bounce: 0.2 },
              opacity: { duration: 0.3 },
              delay: index * 0.05
            }}
            className={
              priority === 'hero'
                ? 'col-span-full'
                : priority === 'large'
                ? 'md:col-span-2'
                : 'md:col-span-1'
            }
            style={{
              gridColumn: priority === 'hero' ? '1 / -1' : undefined
            }}
          >
            {children(item, priority)}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
