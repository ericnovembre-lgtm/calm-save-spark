import { useState, useEffect } from 'react';

export interface RecentPage {
  path: string;
  title: string;
  timestamp: number;
}

const STORAGE_KEY = 'saveplus_recent_pages';
const MAX_RECENT_PAGES = 5;

/**
 * useRecentPages - Track and retrieve recently visited pages
 * Uses sessionStorage to maintain history during browser session
 */
export function useRecentPages() {
  const [pages, setPages] = useState<RecentPage[]>([]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPages(parsed);
      }
    } catch (error) {
      console.error('Error loading recent pages:', error);
    }
  }, []);

  const addPage = (path: string, title: string) => {
    try {
      const updated = [
        { path, title, timestamp: Date.now() },
        ...pages.filter(p => p.path !== path)
      ].slice(0, MAX_RECENT_PAGES);
      
      setPages(updated);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent page:', error);
    }
  };

  return { pages, addPage };
}
