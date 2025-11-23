import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssetIntelligenceModal } from './AssetIntelligenceModal';

interface TreemapData {
  name: string;
  value: number;
  gainPercent?: number;
  color?: string;
  children?: TreemapData[];
}

interface InteractiveTreemapProps {
  data: TreemapData[];
}

export function InteractiveTreemap({ data }: InteractiveTreemapProps) {
  const [zoomedItem, setZoomedItem] = useState<TreemapData | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<{
    symbol: string;
    name: string;
    value: number;
  } | null>(null);
  
  // Dynamic color based on performance
  const getPerformanceColor = (gainPercent: number = 0) => {
    if (gainPercent >= 5) return 'hsl(142 76% 36%)'; // Bright Emerald
    if (gainPercent >= 1) return 'hsl(142 71% 45%)'; // Muted Green
    if (gainPercent >= -1) return 'hsl(43 96% 56%)'; // Neutral Amber
    if (gainPercent >= -5) return 'hsl(0 84% 60%)'; // Muted Red
    return 'hsl(0 72% 51%)'; // Bright Rose
  };
  
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
            const gainPercent = item.gainPercent || 0;
            const isBigMover = Math.abs(gainPercent) > 3;
            const color = item.color || getPerformanceColor(gainPercent);
            
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`${gridSpan} ${minHeight} rounded-xl p-6 cursor-pointer
                  hover:shadow-xl transition-all duration-300 hover:scale-105
                  flex flex-col justify-between relative overflow-hidden`}
                style={{ 
                  backgroundColor: color,
                  opacity: 0.9,
                  boxShadow: isBigMover 
                    ? `0 0 30px ${gainPercent > 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`
                    : undefined
                }}
                onClick={() => {
                  if (item.children) {
                    setZoomedItem(item);
                  } else {
                    // Extract symbol from name (e.g., "NVDA Holdings" -> "NVDA")
                    const symbol = item.name.split(' ')[0];
                    setSelectedAsset({
                      symbol,
                      name: item.name,
                      value: item.value,
                    });
                  }
                }}
              >
                {/* Pulsing glow for big movers */}
                {isBigMover && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    animate={{
                      boxShadow: [
                        `0 0 20px ${gainPercent > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        `0 0 40px ${gainPercent > 0 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'}`,
                        `0 0 20px ${gainPercent > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-white text-lg">
                      {item.name}
                    </h4>
                    {/* Performance badge */}
                    {item.gainPercent !== undefined && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.05 + 0.2 }}
                        className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                          gainPercent >= 0 
                            ? 'bg-green-900/50 text-green-100' 
                            : 'bg-red-900/50 text-red-100'
                        }`}
                      >
                        {gainPercent >= 0 ? '↑' : '↓'}
                        {Math.abs(gainPercent).toFixed(1)}%
                      </motion.div>
                    )}
                  </div>
                  <p className="text-white/80 text-sm">
                    {percentage.toFixed(1)}% of portfolio
                  </p>
                </div>
                
                <div className="mt-auto relative z-10">
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

      <AssetIntelligenceModal
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        assetSymbol={selectedAsset?.symbol || ''}
        assetName={selectedAsset?.name || ''}
        currentValue={selectedAsset?.value || 0}
      />
    </div>
  );
}