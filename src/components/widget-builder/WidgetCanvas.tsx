import { motion } from 'framer-motion';
import { WidgetConfig } from '@/hooks/useWidgetBuilder';
import { WidgetPreview } from './WidgetPreview';
import { Trash2, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WidgetCanvasProps {
  widgets: WidgetConfig[];
  selectedWidget: string | null;
  layout: 'grid' | 'freeform';
  onSelectWidget: (id: string | null) => void;
  onRemoveWidget: (id: string) => void;
  onMoveWidget: (id: string, position: { x: number; y: number }) => void;
}

export function WidgetCanvas({
  widgets,
  selectedWidget,
  layout,
  onSelectWidget,
  onRemoveWidget,
}: WidgetCanvasProps) {
  return (
    <div 
      className={`min-h-[500px] rounded-xl border-2 border-dashed border-border bg-muted/30 p-4 ${
        layout === 'grid' ? 'grid grid-cols-3 gap-4 auto-rows-min' : 'relative'
      }`}
      onClick={() => onSelectWidget(null)}
    >
      {widgets.length === 0 ? (
        <div className="col-span-3 flex flex-col items-center justify-center h-[400px] text-muted-foreground">
          <Move className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Drag widgets here</p>
          <p className="text-sm">or select from the palette to add them</p>
        </div>
      ) : (
        widgets.map((widget) => (
          <motion.div
            key={widget.id}
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectWidget(widget.id);
            }}
            className={`relative group cursor-pointer rounded-xl border-2 transition-colors ${
              selectedWidget === widget.id
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-border hover:border-primary/50'
            }`}
            style={layout === 'freeform' ? {
              position: 'absolute',
              left: widget.position.x,
              top: widget.position.y,
              width: widget.size.width,
              height: widget.size.height,
            } : undefined}
          >
            <WidgetPreview widget={widget} />

            {/* Delete button */}
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveWidget(widget.id);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </motion.div>
        ))
      )}
    </div>
  );
}
