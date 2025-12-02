import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchHint {
  label: string;
  path: string;
  keywords?: string[];
}

const searchHints: SearchHint[] = [
  { label: 'Dashboard', path: '/dashboard', keywords: ['home', 'overview'] },
  { label: 'Goals', path: '/goals', keywords: ['targets', 'objectives', 'savings'] },
  { label: 'Pots', path: '/pots', keywords: ['savings', 'buckets', 'funds'] },
  { label: 'Automations', path: '/automations', keywords: ['rules', 'auto', 'schedule'] },
  { label: 'Achievements', path: '/achievements', keywords: ['points', 'cashback', 'perks', 'badges', 'streaks'] },
  { label: 'Insights', path: '/insights', keywords: ['analytics', 'reports', 'data'] },
  { label: 'Analytics', path: '/analytics', keywords: ['stats', 'metrics', 'charts'] },
  { label: 'Card', path: '/card', keywords: ['debit', 'payment', 'spending'] },
  { label: 'Settings', path: '/settings', keywords: ['preferences', 'config', 'account'] },
];

/**
 * SearchBarHinted - Quick navigation search with hints
 * Shows suggestions as user types, supports keyboard navigation
 */
export function SearchBarHinted() {
  const [query, setQuery] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Filter hints based on query
  const filteredHints = query.trim()
    ? searchHints.filter(hint => {
        const lowerQuery = query.toLowerCase();
        return (
          hint.label.toLowerCase().includes(lowerQuery) ||
          hint.keywords?.some(kw => kw.includes(lowerQuery))
        );
      })
    : searchHints;

  // Navigate to selected hint
  const selectHint = (path: string) => {
    navigate(path);
    setQuery('');
    setShowHints(false);
    inputRef.current?.blur();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showHints) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredHints.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredHints.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredHints[selectedIndex]) {
          selectHint(filteredHints[selectedIndex].path);
        }
        break;
      case 'Escape':
        setShowHints(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Reset selected index when filtered hints change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Close hints when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-search-container]')) {
        setShowHints(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md" data-search-container>
      <div className="relative">
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" 
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search or jump to..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowHints(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 bg-background/50 border-border focus:bg-background transition-colors"
          aria-label="Quick search"
          aria-expanded={showHints}
          aria-controls="search-hints"
          aria-activedescendant={
            showHints && filteredHints[selectedIndex]
              ? `hint-${selectedIndex}`
              : undefined
          }
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <Command className="w-3 h-3" />
            K
          </kbd>
        </div>
      </div>

      {/* Hints dropdown */}
      {showHints && (
        <div
          id="search-hints"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50 max-h-80 overflow-y-auto"
        >
          {filteredHints.length > 0 ? (
            filteredHints.map((hint, index) => (
              <button
                key={hint.path}
                id={`hint-${index}`}
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => selectHint(hint.path)}
                className={`w-full px-4 py-3 text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="font-medium">{hint.label}</div>
                    {hint.keywords && (
                      <div className="text-xs text-muted-foreground">
                        {hint.keywords.slice(0, 3).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for mobile
 */
export function SearchBarHintedCompact() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Open search"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search...</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 p-4 flex items-start justify-center pt-20">
          <div className="w-full max-w-lg">
            <SearchBarHinted />
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 text-sm text-muted-foreground hover:text-foreground"
            >
              Press Esc to close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
