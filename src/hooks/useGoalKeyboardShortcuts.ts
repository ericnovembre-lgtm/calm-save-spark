import { useHotkeys } from 'react-hotkeys-hook';

interface GoalKeyboardShortcutsProps {
  onNewGoal: () => void;
  onSearch?: () => void;
  onHelp?: () => void;
}

export const useGoalKeyboardShortcuts = ({
  onNewGoal,
  onSearch,
  onHelp,
}: GoalKeyboardShortcutsProps) => {
  // Cmd/Ctrl + N - New Goal
  useHotkeys('mod+n', (e) => {
    e.preventDefault();
    onNewGoal();
  }, {
    enableOnFormTags: false,
  });

  // Cmd/Ctrl + K - Search (if provided)
  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    onSearch?.();
  }, {
    enableOnFormTags: false,
  });

  // ? - Show help/shortcuts
  useHotkeys('shift+/', (e) => {
    e.preventDefault();
    onHelp?.();
  }, {
    enableOnFormTags: false,
  });

  return {
    shortcuts: [
      { key: '⌘/Ctrl + N', action: 'Create new goal' },
      { key: '⌘/Ctrl + K', action: 'Search goals' },
      { key: '?', action: 'Show keyboard shortcuts' },
    ],
  };
};
