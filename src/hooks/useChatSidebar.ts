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


  return { isOpen, toggle, setIsOpen };
}
