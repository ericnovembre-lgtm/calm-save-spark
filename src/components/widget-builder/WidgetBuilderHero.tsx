import { motion } from 'framer-motion';
import { Palette, Blocks, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WidgetBuilderHeroProps {
  onBrowseTemplates: () => void;
}

export function WidgetBuilderHero({ onBrowseTemplates }: WidgetBuilderHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 via-fuchsia-500/10 to-pink-500/20 p-6 border border-purple-500/20"
      data-copilot-id="widget-builder-hero"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-400/10 via-transparent to-transparent" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20">
              <Palette className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Widget Builder</h1>
              <p className="text-muted-foreground">Create custom dashboard widgets</p>
            </div>
          </div>

          <Button variant="outline" onClick={onBrowseTemplates}>
            <Download className="w-4 h-4 mr-2" />
            Browse Templates
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Blocks className="w-4 h-4" />
              <span className="text-sm">Widget Types</span>
            </div>
            <p className="text-2xl font-bold">8</p>
          </div>

          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Download className="w-4 h-4" />
              <span className="text-sm">Templates</span>
            </div>
            <p className="text-2xl font-bold">24</p>
          </div>

          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Share2 className="w-4 h-4" />
              <span className="text-sm">My Templates</span>
            </div>
            <p className="text-2xl font-bold">3</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
