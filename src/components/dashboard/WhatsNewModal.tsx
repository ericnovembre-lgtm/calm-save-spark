import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, ArrowRight, Rocket, History } from 'lucide-react';
import { useWhatsNew, FEATURE_UPDATES } from '@/hooks/useWhatsNew';
import { useDashboardTour } from '@/hooks/useDashboardTour';
import { cn } from '@/lib/utils';

interface WhatsNewModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function WhatsNewModal({ open, onOpenChange }: WhatsNewModalProps) {
  const navigate = useNavigate();
  const { showWhatsNew, dismissWhatsNew, currentUpdates, currentVersion } = useWhatsNew();
  const { startTour } = useDashboardTour();

  const isOpen = open !== undefined ? open : showWhatsNew;
  const handleOpenChange = onOpenChange || ((open: boolean) => {
    if (!open) dismissWhatsNew();
  });

  const scrollToFeature = (tourStep?: string) => {
    if (!tourStep) return;
    
    handleOpenChange(false);
    
    // Small delay to let modal close
    setTimeout(() => {
      const element = document.querySelector(`[data-tour="${tourStep}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a highlight effect
        element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
        }, 2000);
      }
    }, 300);
  };

  const handleStartTour = () => {
    handleOpenChange(false);
    setTimeout(() => startTour(), 300);
  };

  const handleViewChangelog = () => {
    handleOpenChange(false);
    navigate('/changelog');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="p-2 rounded-lg bg-primary/10"
            >
              <Sparkles className="w-6 h-6 text-primary" />
            </motion.div>
            <span>What's New in $ave+</span>
            <span className="ml-auto text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
              v{currentVersion}
            </span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 py-2">
            <AnimatePresence mode="popLayout">
              {currentUpdates.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className={cn(
                      "group relative p-4 rounded-xl border border-border/50",
                      "bg-card/50 hover:bg-card/80 transition-colors",
                      "hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                      {feature.tourStep && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => scrollToFeature(feature.tourStep)}
                        >
                          Try it
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t border-border/50">
          <Button
            variant="link"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleViewChangelog}
          >
            <History className="w-3 h-3 mr-1" />
            View full changelog
          </Button>
          <div className="flex-1" />
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Got it!
          </Button>
          <Button
            className="gap-2"
            onClick={handleStartTour}
          >
            <Rocket className="w-4 h-4" />
            Take the Full Tour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
