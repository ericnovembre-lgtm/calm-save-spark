import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssetIntelligenceModal } from './AssetIntelligenceModal';
import { PriceAlertModal } from './PriceAlertModal';
import CountUp from 'react-countup';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface TreemapData {
  name: string;
  value: number;
  gainPercent?: number;
  color?: string;
  children?: TreemapData[];
}

interface TooltipData {
  name: string;
  value: number;
  gainPercent?: number;
  x: number;
  y: number;
}

interface InteractiveTreemapProps {
  data: TreemapData[];
}

export function InteractiveTreemap({ data }: InteractiveTreemapProps) {
  const prefersReducedMotion = useReducedMotion();
  const [zoomedItem, setZoomedItem] = useState<TreemapData | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<{
    symbol: string;
    name: string;
    value: number;
  } | null>(null);
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
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
    <div ref={containerRef} className="bg-card/80 border border-border rounded-lg p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm">
          <button 
            onClick={() => setZoomedItem(null)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Portfolio
          </button>
          {zoomedItem && (
            <>
              <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
              <span className="text-foreground font-medium">{zoomedItem.name}</span>
            </>
          )}
        </div>
        {zoomedItem && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setZoomedItem(null)}
            className="bg-secondary border-border hover:bg-secondary/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
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
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const containerRect = containerRef.current?.getBoundingClientRect();
                  if (containerRect) {
                    setTooltip({
                      name: item.name,
                      value: item.value,
                      gainPercent: item.gainPercent,
                      x: rect.left - containerRect.left + rect.width / 2,
                      y: rect.top - containerRect.top,
                    });
                  }
                }}
                onMouseLeave={() => setTooltip(null)}
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
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (!item.children) {
                    const symbol = item.name.split(' ')[0];
                    setSelectedAsset({
                      symbol,
                      name: item.name,
                      value: item.value,
                    });
                    setShowPriceAlert(true);
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
                  {item.children ? (
                    <p className="text-white/70 text-xs mt-2">
                      Click to explore {item.children.length} holdings
                    </p>
                  ) : (
                    <p className="text-white/70 text-xs mt-2 flex items-center gap-1">
                      <Bell className="w-3 h-3" />
                      Right-click to set price alert
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
            Total Portfolio: <span className="font-mono tabular-nums text-foreground text-lg">
              $<CountUp 
                end={totalValue} 
                duration={prefersReducedMotion ? 0 : 1.5} 
                decimals={0} 
                separator="," 
                preserveValue
              />
            </span>
          </p>
        </div>
      )}

      {/* Hover Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 pointer-events-none"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y - 10}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-card/95 border border-border rounded-lg shadow-xl p-3 min-w-[200px] backdrop-blur-sm">
              <p className="text-sm font-semibold text-foreground mb-1">{tooltip.name}</p>
              <p className="text-lg font-mono text-foreground">${tooltip.value.toLocaleString()}</p>
              {tooltip.gainPercent !== undefined && (
                <div className="mt-1 flex items-center gap-1">
                  <span className={`text-sm font-medium ${
                    tooltip.gainPercent >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {tooltip.gainPercent >= 0 ? '+' : ''}{tooltip.gainPercent.toFixed(2)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({tooltip.gainPercent >= 0 ? '+' : ''}$
                    {((tooltip.value * tooltip.gainPercent) / (100 + tooltip.gainPercent)).toFixed(0)})
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AssetIntelligenceModal
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        assetSymbol={selectedAsset?.symbol || ''}
        assetName={selectedAsset?.name || ''}
        currentValue={selectedAsset?.value || 0}
      />

      <PriceAlertModal
        open={showPriceAlert}
        onOpenChange={setShowPriceAlert}
        prefilledSymbol={selectedAsset?.symbol || ''}
        prefilledAssetName={selectedAsset?.name || ''}
        prefilledCurrentPrice={selectedAsset?.value}
      />
    </div>
  );
}