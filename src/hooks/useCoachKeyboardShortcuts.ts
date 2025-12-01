import { useHotkeys } from 'react-hotkeys-hook';
import { coachSounds } from '@/lib/coach-sounds';

interface UseCoachKeyboardShortcutsProps {
  onCommandPalette: () => void;
  onScenarioFocus: () => void;
  onOpportunitiesFocus: () => void;
  onDNAFocus: () => void;
  onChatOpen: () => void;
  onShowShortcuts: () => void;
  onEscape: () => void;
}

export function useCoachKeyboardShortcuts({
  onCommandPalette,
  onScenarioFocus,
  onOpportunitiesFocus,
  onDNAFocus,
  onChatOpen,
  onShowShortcuts,
  onEscape,
}: UseCoachKeyboardShortcutsProps) {
  // Command Palette
  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    onCommandPalette();
  }, { enableOnFormTags: false });

  // Focus Scenario Simulator
  useHotkeys('mod+s', (e) => {
    e.preventDefault();
    coachSounds.playRadarPing();
    onScenarioFocus();
  }, { enableOnFormTags: false });

  // Focus Opportunity Radar
  useHotkeys('mod+o', (e) => {
    e.preventDefault();
    coachSounds.playRadarPing();
    onOpportunitiesFocus();
  }, { enableOnFormTags: false });

  // Focus DNA Orb
  useHotkeys('mod+d', (e) => {
    e.preventDefault();
    coachSounds.playRadarPing();
    onDNAFocus();
  }, { enableOnFormTags: false });

  // Open Chat
  useHotkeys('mod+/', (e) => {
    e.preventDefault();
    onChatOpen();
  }, { enableOnFormTags: false });

  // Show Shortcuts Help
  useHotkeys('shift+/', (e) => {
    e.preventDefault();
    onShowShortcuts();
  }, { enableOnFormTags: false });

  // Escape
  useHotkeys('esc', (e) => {
    e.preventDefault();
    onEscape();
  }, { enableOnFormTags: true });

  return {
    shortcuts: [
      { key: 'Mod+K', action: 'Open command palette', category: 'Navigation' },
      { key: 'Mod+S', action: 'Focus Scenario Simulator', category: 'Navigation' },
      { key: 'Mod+O', action: 'Focus Opportunity Radar', category: 'Navigation' },
      { key: 'Mod+D', action: 'Focus Financial DNA', category: 'Navigation' },
      { key: 'Mod+/', action: 'Open AI Chat', category: 'Actions' },
      { key: '?', action: 'Show keyboard shortcuts', category: 'Help' },
      { key: 'Esc', action: 'Close dialogs', category: 'Help' },
    ],
  };
}
