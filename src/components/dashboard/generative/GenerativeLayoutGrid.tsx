import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GenerativeWidgetRenderer } from './GenerativeWidgetRenderer';
import type { DashboardLayout, GenerativeWidgetSpec } from '@/hooks/useClaudeGenerativeDashboard';

interface GenerativeLayoutGridProps {
  layout: DashboardLayout;
  widgets: Record<string, GenerativeWidgetSpec>;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

export function GenerativeLayoutGrid({ 
  layout, 
  widgets,
  className 
}: GenerativeLayoutGridProps) {
  const getWidget = (widgetId: string) => widgets[widgetId];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("space-y-6", className)}
    >
      {/* Hero Section */}
      <AnimatePresence mode="wait">
        {layout.hero && getWidget(layout.hero.widgetId) && (
          <motion.section
            key="hero"
            variants={itemVariants}
            className="w-full"
          >
            <GenerativeWidgetRenderer
              widget={getWidget(layout.hero.widgetId)!}
              size="hero"
            />
          </motion.section>
        )}
      </AnimatePresence>

      {/* Featured Section */}
      {layout.featured.length > 0 && (
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {layout.featured.map((item, index) => {
            const widget = getWidget(item.widgetId);
            if (!widget) return null;
            return (
              <motion.div
                key={item.widgetId}
                variants={itemVariants}
                className={cn(
                  item.size === 'large' ? 'md:col-span-2' : 'md:col-span-1'
                )}
              >
                <GenerativeWidgetRenderer
                  widget={widget}
                  size={item.size}
                />
              </motion.div>
            );
          })}
        </motion.section>
      )}

      {/* Grid Section */}
      {layout.grid.length > 0 && (
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {layout.grid.map((item) => {
            const widget = getWidget(item.widgetId);
            if (!widget) return null;
            return (
              <motion.div
                key={item.widgetId}
                variants={itemVariants}
              >
                <GenerativeWidgetRenderer
                  widget={widget}
                  size="compact"
                />
              </motion.div>
            );
          })}
        </motion.section>
      )}
    </motion.div>
  );
}
