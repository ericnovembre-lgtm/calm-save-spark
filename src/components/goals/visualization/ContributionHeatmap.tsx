import { motion } from 'framer-motion';
import { useState } from 'react';

interface ContributionData {
  date: string;
  amount: number;
}

interface ContributionHeatmapProps {
  data: ContributionData[];
  weeks?: number;
}

/**
 * GitHub-style contribution heatmap
 * Shows daily contribution intensity
 */
export const ContributionHeatmap = ({ 
  data, 
  weeks = 12 
}: ContributionHeatmapProps) => {
  const [hoveredCell, setHoveredCell] = useState<ContributionData | null>(null);

  // Generate grid (7 days x N weeks)
  const grid = Array.from({ length: weeks }, (_, weekIdx) =>
    Array.from({ length: 7 }, (_, dayIdx) => {
      const index = weekIdx * 7 + dayIdx;
      return data[index] || { date: '', amount: 0 };
    })
  );

  const getIntensity = (amount: number) => {
    const max = Math.max(...data.map(d => d.amount), 1);
    const normalized = amount / max;
    
    if (normalized === 0) return 'hsl(var(--muted) / 0.1)';
    if (normalized < 0.25) return 'hsl(var(--primary) / 0.25)';
    if (normalized < 0.5) return 'hsl(var(--primary) / 0.5)';
    if (normalized < 0.75) return 'hsl(var(--primary) / 0.75)';
    return 'hsl(var(--primary))';
  };

  return (
    <div className="p-4 rounded-2xl bg-card border border-border">
      <h3 className="text-lg font-semibold mb-4">Contribution Activity</h3>
      
      <div className="flex gap-1">
        {grid.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {week.map((day, dayIdx) => (
              <motion.div
                key={`${weekIdx}-${dayIdx}`}
                className="w-4 h-4 rounded-sm cursor-pointer"
                style={{ backgroundColor: getIntensity(day.amount) }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 0.2,
                  delay: (weekIdx * 7 + dayIdx) * 0.01
                }}
                whileHover={{ scale: 1.2 }}
                onMouseEnter={() => setHoveredCell(day)}
                onMouseLeave={() => setHoveredCell(null)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredCell && hoveredCell.amount > 0 && (
        <motion.div
          className="mt-4 p-2 rounded-lg bg-muted text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="font-semibold">${hoveredCell.amount.toFixed(2)}</div>
          <div className="text-muted-foreground">{hoveredCell.date}</div>
        </motion.div>
      )}
    </div>
  );
};
