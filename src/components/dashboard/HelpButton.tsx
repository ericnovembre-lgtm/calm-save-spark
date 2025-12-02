import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Play, Sparkles, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDashboardTour } from '@/hooks/useDashboardTour';
import { useWhatsNew } from '@/hooks/useWhatsNew';
import { WhatsNewModal } from '@/components/dashboard/WhatsNewModal';
import { cn } from '@/lib/utils';

/**
 * Help Button Component
 * Provides access to What's New modal and help documentation
 */
export function HelpButton() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const { resetTour } = useDashboardTour();
  const { hasNewUpdates } = useWhatsNew();

  const handleOpenWhatsNew = () => {
    setIsOpen(false);
    setTimeout(() => setShowWhatsNew(true), 150);
  };

  const handleOpenChangelog = () => {
    setIsOpen(false);
    navigate('/changelog');
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="touch-target relative"
        aria-label="Help menu"
      >
        <HelpCircle className="w-5 h-5" />
        {hasNewUpdates && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Help & Resources
            </DialogTitle>
            <DialogDescription>
              Access tutorials, updates, and help resources
            </DialogDescription>
          </DialogHeader>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* What's New Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 relative"
              onClick={handleOpenWhatsNew}
            >
              <Sparkles className="w-4 h-4" />
              What's New
              {hasNewUpdates && (
                <span className={cn(
                  "ml-auto px-1.5 py-0.5 text-[10px] font-medium rounded-full",
                  "bg-primary text-primary-foreground"
                )}>
                  NEW
                </span>
              )}
            </Button>

            {/* Changelog Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={handleOpenChangelog}
            >
              <History className="w-4 h-4" />
              View Full Changelog
            </Button>

            {/* Restart Tour Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => {
                resetTour();
                setIsOpen(false);
              }}
            >
              <Play className="w-4 h-4" />
              Restart Dashboard Tour
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* What's New Modal */}
      <WhatsNewModal open={showWhatsNew} onOpenChange={setShowWhatsNew} />
    </>
  );
}
