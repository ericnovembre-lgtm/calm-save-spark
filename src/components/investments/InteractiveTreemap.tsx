import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TreemapData {
  name: string;
  value: number;
  color: string;
  children?: TreemapData[];
}

interface InteractiveTreemapProps {
  data: TreemapData[];
}

export function InteractiveTreemap({ data }: InteractiveTreemapProps) {
  const [zoomedItem, setZoomedItem] = useState<TreemapData | null>(null);
  
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const displayData = zoomedItem ? (zoomedItem.children || [zoomedItem]) : data;
  
  return (
    <div className="bg-card rounded-lg p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-foreground">Asset Allocation</h3>
        {zoomedItem && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setZoomedItem(null)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Overview
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={zoomedItem?.name || 'root'}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 min-h-[400px]"
        >
          {displayData.map((item, idx) => {
            const percentage = (item.value / totalValue) * 100;
            const gridSpan = percentage > 30 ? 'col-span-2' : 'col-span-1';
            const minHeight = percentage > 30 ? 'min-h-[200px]' : 'min-h-[150px]';
            
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`${gridSpan} ${minHeight} rounded-xl p-6 cursor-pointer
                  hover:shadow-xl transition-all duration-300 hover:scale-105
                  flex flex-col justify-between`}
                style={{ 
                  backgroundColor: item.color,
                  opacity: 0.9 
                }}
                onClick={() => item.children && setZoomedItem(item)}
              >
                <div>
                  <h4 className="font-semibold text-white text-lg mb-2">
                    {item.name}
                  </h4>
                  <p className="text-white/80 text-sm">
                    {percentage.toFixed(1)}% of portfolio
                  </p>
                </div>
                
                <div className="mt-auto">
                  <p className="text-white text-2xl font-bold">
                    ${item.value.toLocaleString()}
                  </p>
                  {item.children && (
                    <p className="text-white/70 text-xs mt-2">
                      Click to explore {item.children.length} holdings
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {!zoomedItem && (
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Total Portfolio: <span className="font-bold text-foreground">${totalValue.toLocaleString()}</span>
          </p>
        </div>
      )}
    </div>
  );
}