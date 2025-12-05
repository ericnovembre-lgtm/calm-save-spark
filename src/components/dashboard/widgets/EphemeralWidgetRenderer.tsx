import { motion } from 'framer-motion';
import { X, Pin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EphemeralWidgetSpec, isFeasibilityData, isComparisonData, isProjectionData, isWhatIfData } from '@/lib/ephemeral-widgets';
import { FeasibilityCalculator } from './FeasibilityCalculator';
import { ComparisonWidget } from './ComparisonWidget';
import { ProjectionWidget } from './ProjectionWidget';
import { WhatIfWidget } from './WhatIfWidget';

interface EphemeralWidgetRendererProps {
  spec: EphemeralWidgetSpec;
  onDismiss: () => void;
  onPin?: () => void;
}

export function EphemeralWidgetRenderer({ spec, onDismiss, onPin }: EphemeralWidgetRendererProps) {
  const renderWidget = () => {
    switch (spec.widget_type) {
      case 'feasibility_calculator':
        if (isFeasibilityData(spec.data)) {
          return <FeasibilityCalculator data={spec.data} title={spec.title} />;
        }
        break;
      case 'comparison':
        if (isComparisonData(spec.data)) {
          return <ComparisonWidget data={spec.data} title={spec.title} />;
        }
        break;
      case 'projection':
        if (isProjectionData(spec.data)) {
          return <ProjectionWidget data={spec.data} title={spec.title} />;
        }
        break;
      case 'what_if':
        if (isWhatIfData(spec.data)) {
          return <WhatIfWidget data={spec.data} title={spec.title} />;
        }
        break;
    }
    return null;
  };

  return (
    <motion.div
      className={cn(
        "bg-background/95 backdrop-blur-xl rounded-2xl",
        "border border-border/50 shadow-2xl overflow-hidden"
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">AI Generated</p>
            <p className="text-sm font-medium text-foreground">{spec.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onPin && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onPin}
              title="Pin to dashboard"
            >
              <Pin className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Widget content */}
      <div className="p-4">
        {renderWidget()}
      </div>

      {/* Footer badge */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3" />
          <span>Ephemeral widget • Generated just for you</span>
        </div>
      </div>
    </motion.div>
  );
}
