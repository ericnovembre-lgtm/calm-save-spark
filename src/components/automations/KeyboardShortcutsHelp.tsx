import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command } from "lucide-react";

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts: Array<{ key: string; action: string }>;
}

export function KeyboardShortcutsHelp({
  open,
  onOpenChange,
  shortcuts,
}: KeyboardShortcutsHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md circuit-board-container">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Command className="h-5 w-5 text-circuit-accent" />
            <DialogTitle className="glow-text">Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription>
            Speed up your automation workflow with these shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-circuit-bg/50 border border-circuit-line/20 hover:border-circuit-line/40 transition-colors"
            >
              <span className="text-sm text-muted-foreground">
                {shortcut.action}
              </span>
              <kbd className="px-2 py-1 text-xs font-semibold bg-background border border-circuit-line/30 rounded shadow-sm text-circuit-accent font-mono">
                {shortcut.key.replace('Mod', navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')}
              </kbd>
            </div>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Press <kbd className="px-1 py-0.5 text-xs bg-background border border-circuit-line/30 rounded text-circuit-accent">?</kbd> anytime to see this list
        </p>
      </DialogContent>
    </Dialog>
  );
}
