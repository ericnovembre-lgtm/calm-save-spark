import { useState, useEffect } from 'react';

/**
 * Hook to manage chat sidebar state with localStorage persistence
 */
export function useChatSidebar() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('chat-sidebar-open');
    return stored ? JSON.parse(stored) : false;
  });

  const toggle = () => {
    setIsOpen(prev => {
      const next = !prev;
      localStorage.setItem('chat-sidebar-open', JSON.stringify(next));
      return next;
    });
  };

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isOpen, toggle, setIsOpen };
}
