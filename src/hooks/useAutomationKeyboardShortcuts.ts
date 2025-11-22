import { useHotkeys } from 'react-hotkeys-hook';
import { useCallback } from 'react';

interface UseAutomationKeyboardShortcutsProps {
  onNewRule: () => void;
  onToggleEmergencyBrake: () => void;
  onOpenRecipes: () => void;
  onOpenLogicBuilder: () => void;
  onShowShortcuts: () => void;
  conversationalInputRef?: React.RefObject<HTMLTextAreaElement>;
}

export function useAutomationKeyboardShortcuts({
  onNewRule,
  onToggleEmergencyBrake,
  onOpenRecipes,
  onOpenLogicBuilder,
  onShowShortcuts,
  conversationalInputRef,
}: UseAutomationKeyboardShortcutsProps) {
  // New rule (focus conversational input)
  useHotkeys('mod+n', (e) => {
    e.preventDefault();
    onNewRule();
    conversationalInputRef?.current?.focus();
  }, { enableOnFormTags: false });

  // Emergency Brake (pause all)
  useHotkeys('mod+p', (e) => {
    e.preventDefault();
    onToggleEmergencyBrake();
  }, { enableOnFormTags: false });

  // Open Recipes
  useHotkeys('mod+r', (e) => {
    e.preventDefault();
    onOpenRecipes();
  }, { enableOnFormTags: false });

  // Open Logic Builder
  useHotkeys('mod+b', (e) => {
    e.preventDefault();
    onOpenLogicBuilder();
  }, { enableOnFormTags: false });

  // Show shortcuts help
  useHotkeys('shift+/', (e) => {
    e.preventDefault();
    onShowShortcuts();
  }, { enableOnFormTags: true });

  return {
    shortcuts: [
      { key: 'Mod+N', action: 'Focus conversational input' },
      { key: 'Mod+P', action: 'Toggle Emergency Brake' },
      { key: 'Mod+R', action: 'Jump to Smart Recipes' },
      { key: 'Mod+B', action: 'Open Logic Builder' },
      { key: '?', action: 'Show keyboard shortcuts' },
      { key: 'Esc', action: 'Close modals' },
    ],
  };
}
