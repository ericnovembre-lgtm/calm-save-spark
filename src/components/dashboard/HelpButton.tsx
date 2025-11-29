import { useState } from 'react';
import { HelpCircle, Search, Keyboard, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { defaultDashboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDashboardTour } from '@/hooks/useDashboardTour';

/**
 * Help Button Component
 * Provides access to keyboard shortcuts and help documentation
 */
export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { resetTour } = useDashboardTour();

  const filteredShortcuts = defaultDashboardShortcuts.filter(
    (shortcut) =>
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="touch-target"
        aria-label="Help and keyboard shortcuts"
      >
        <HelpCircle className="w-5 h-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Speed up your workflow with these keyboard shortcuts
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search shortcuts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11"
            />
          </div>

          {/* Shortcuts List */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {filteredShortcuts.length > 0 ? (
                filteredShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm text-foreground">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No shortcuts found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Restart Tour Button */}
          <div className="pt-4 border-t">
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

          {/* Footer Tip */}
          <div className="pt-4 text-xs text-muted-foreground text-center">
            <p>
              Tip: Press <kbd className="px-1 py-0.5 bg-muted border rounded">?</kbd> anytime
              to open this dialog
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}