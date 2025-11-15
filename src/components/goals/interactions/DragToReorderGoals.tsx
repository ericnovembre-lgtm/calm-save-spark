import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface GoalItem {
  id: string;
  name: string;
  progress: number;
  icon?: string;
}

interface DragToReorderGoalsProps {
  goals: GoalItem[];
  onReorder: (newOrder: string[]) => void;
  className?: string;
}

/**
 * Drag-to-reorder goals with smooth physics
 */
export const DragToReorderGoals = ({ 
  goals, 
  onReorder,
  className = '' 
}: DragToReorderGoalsProps) => {
  const [items, setItems] = useState(goals);
  const { toast } = useToast();

  const handleReorder = (newOrder: GoalItem[]) => {
    setItems(newOrder);
    onReorder(newOrder.map(item => item.id));
    
    toast({
      title: "Goals reordered",
      description: "Your goal priority has been updated",
      duration: 2000,
    });
  };

  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={handleReorder}
      className={`space-y-3 ${className}`}
    >
      {items.map((item) => (
        <Reorder.Item
          key={item.id}
          value={item}
          className="cursor-grab active:cursor-grabbing"
        >
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileDrag={{ 
              scale: 1.05,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              zIndex: 999,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Card className="p-4 hover:bg-accent/5 transition-colors">
              <div className="flex items-center gap-4">
                {/* Drag handle */}
                <div className="text-muted-foreground cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Goal icon */}
                {item.icon && (
                  <div className="text-2xl">{item.icon}</div>
                )}

                {/* Goal info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {item.progress}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
};
