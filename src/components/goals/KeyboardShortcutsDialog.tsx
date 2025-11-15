import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command } from "lucide-react";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts: Array<{ key: string; action: string }>;
}

export const KeyboardShortcutsDialog = ({
  open,
  onOpenChange,
  shortcuts,
}: KeyboardShortcutsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription>
            Speed up your workflow with these shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors"
            >
              <span className="text-sm text-muted-foreground">
                {shortcut.action}
              </span>
              <kbd className="px-2 py-1 text-xs font-semibold bg-background border border-border rounded shadow-sm">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Press <kbd className="px-1 py-0.5 text-xs bg-background border border-border rounded">?</kbd> anytime to see this list
        </p>
      </DialogContent>
    </Dialog>
  );
};
