import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ReactNode } from 'react';

interface Column {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}

interface HolographicTableProps {
  columns: Column[];
  data: Record<string, any>[];
  className?: string;
}

export const HolographicTable = ({
  columns,
  data,
  className = ''
}: HolographicTableProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-card/40 backdrop-blur-xl border border-primary/20" />
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          boxShadow: '0 0 40px hsl(var(--primary) / 0.3)',
        }}
        animate={prefersReducedMotion ? {} : {
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />

      <div className="relative overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/20">
              {columns.map((column, index) => (
                <motion.th
                  key={column.key}
                  className={`px-6 py-4 text-sm font-semibold text-primary uppercase tracking-wider ${
                    column.align === 'right' ? 'text-right' :
                    column.align === 'center' ? 'text-center' :
                    'text-left'
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <span className="relative">
                    {column.label}
                    <motion.span
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-transparent"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                      style={{ originX: 0 }}
                    />
                  </span>
                </motion.th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                className="border-b border-border/30 hover:bg-primary/5 transition-colors group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rowIndex * 0.05 }}
                whileHover={prefersReducedMotion ? {} : {
                  x: 4,
                  transition: { duration: 0.2 }
                }}
              >
                {columns.map((column, colIndex) => (
                  <motion.td
                    key={column.key}
                    className={`px-6 py-4 ${
                      column.align === 'right' ? 'text-right' :
                      column.align === 'center' ? 'text-center' :
                      'text-left'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: rowIndex * 0.05 + colIndex * 0.02 }}
                  >
                    <span className="relative inline-block">
                      {row[column.key]}
                      {/* Hover highlight */}
                      <motion.span
                        className="absolute inset-0 bg-primary/10 -z-10 rounded"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </span>
                  </motion.td>
                ))}
                
                {/* Row glow effect */}
                <motion.div
                  className="absolute left-0 right-0 h-full bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 pointer-events-none opacity-0 group-hover:opacity-100"
                  style={{ zIndex: -1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Scan line effect */}
      <motion.div
        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent pointer-events-none"
        animate={prefersReducedMotion ? {} : {
          top: ['-1px', '100%'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};
