import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command } from "lucide-react";

interface CoachKeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts: Array<{ key: string; action: string; category: string }>;
}

export function CoachKeyboardShortcutsHelp({
  open,
  onOpenChange,
  shortcuts,
}: CoachKeyboardShortcutsHelpProps) {
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  const formatKey = (key: string) => {
    return key.replace('Mod', navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-command-surface border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Command className="h-5 w-5 text-command-cyan" />
            <DialogTitle className="text-white font-mono">Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription className="text-white/60 font-mono text-sm">
            Power-user navigation for the Strategic Command Room
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-xs font-mono text-command-violet uppercase tracking-wider mb-2">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-command-bg/50 border border-white/5 hover:border-command-cyan/20 transition-colors"
                  >
                    <span className="text-sm text-white/80 font-mono">
                      {shortcut.action}
                    </span>
                    <kbd className="px-2 py-1 text-xs font-semibold bg-command-bg border border-white/20 rounded shadow-sm text-command-cyan font-mono">
                      {formatKey(shortcut.key)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-white/10">
          <p className="text-xs text-center text-white/40 font-mono">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-command-bg border border-white/20 rounded text-command-cyan font-mono">?</kbd> anytime to see this list
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
