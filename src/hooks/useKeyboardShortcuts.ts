import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
}

/**
 * Hook for registering keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
      const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatches = shortcut.alt ? event.altKey : !event.altKey;
      const metaMatches = shortcut.meta ? event.metaKey : !event.metaKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

/**
 * Show keyboard shortcuts help
 */
export function useShortcutsHelp(shortcuts: KeyboardShortcut[]) {
  const showHelp = useCallback(() => {
    const shortcutsList = shortcuts
      .map(s => {
        const keys = [];
        if (s.ctrl) keys.push('Ctrl');
        if (s.shift) keys.push('Shift');
        if (s.alt) keys.push('Alt');
        if (s.meta) keys.push('⌘');
        keys.push(s.key.toUpperCase());
        return `${keys.join('+')} - ${s.description}`;
      })
      .join('\n');

    toast.info('Keyboard Shortcuts', {
      description: shortcutsList,
      duration: 5000,
    });
  }, [shortcuts]);

  return { showHelp };
}

/**
 * Default dashboard shortcuts
 */
export const defaultDashboardShortcuts: KeyboardShortcut[] = [
  {
    key: 'k',
    ctrl: true,
    description: 'Open command palette',
    action: () => {
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
      document.dispatchEvent(event);
    }
  },
  {
    key: 'n',
    ctrl: true,
    description: 'New transfer',
    action: () => toast.info('New transfer shortcut')
  },
  {
    key: 'g',
    ctrl: true,
    description: 'New goal',
    action: () => toast.info('New goal shortcut')
  },
  {
    key: 'r',
    ctrl: true,
    description: 'Refresh dashboard',
    action: () => window.location.reload()
  },
  {
    key: '?',
    shift: true,
    description: 'Show shortcuts',
    action: () => {} // Handled separately
  }
];
