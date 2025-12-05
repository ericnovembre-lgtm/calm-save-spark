import { useState, useCallback, useEffect } from 'react';

interface ScreenReaderModeState {
  /** Whether screen reader mode is active */
  isActive: boolean;
  /** Show only accessible text content */
  showAccessibleTextOnly: boolean;
  /** Highlight focusable elements */
  highlightFocusable: boolean;
  /** Show ARIA tree structure */
  showAriaTree: boolean;
  /** Show tab order numbers */
  showTabOrder: boolean;
  /** Current announcement queue */
  announcementQueue: string[];
}

interface UseScreenReaderModeReturn extends ScreenReaderModeState {
  /** Toggle screen reader mode */
  toggle: () => void;
  /** Enable screen reader mode */
  enable: () => void;
  /** Disable screen reader mode */
  disable: () => void;
  /** Toggle specific feature */
  toggleFeature: (feature: keyof Omit<ScreenReaderModeState, 'isActive' | 'announcementQueue'>) => void;
  /** Add announcement to queue */
  addAnnouncement: (message: string) => void;
  /** Clear announcement queue */
  clearAnnouncements: () => void;
  /** Get accessible text for element */
  getAccessibleText: (element: HTMLElement) => string;
  /** Get ARIA tree for container */
  getAriaTree: (container: HTMLElement) => AriaTreeNode[];
  /** Get tab order for container */
  getTabOrder: (container: HTMLElement) => TabOrderItem[];
}

interface AriaTreeNode {
  role: string;
  name: string;
  level: number;
  children: AriaTreeNode[];
  element: HTMLElement;
}

interface TabOrderItem {
  index: number;
  element: HTMLElement;
  tabIndex: number;
  accessibleName: string;
}

const STORAGE_KEY = 'screen-reader-mode-settings';

/**
 * Hook for simulating screen reader experience during development.
 * Helps developers understand how their UI appears to assistive technology users.
 */
export function useScreenReaderMode(): UseScreenReaderModeReturn {
  const [state, setState] = useState<ScreenReaderModeState>(() => {
    // Load saved settings
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch {
        // Ignore localStorage errors
      }
    }
    return {
      isActive: false,
      showAccessibleTextOnly: false,
      highlightFocusable: false,
      showAriaTree: false,
      showTabOrder: false,
      announcementQueue: [],
    };
  });

  // Persist settings
  useEffect(() => {
    try {
      const { announcementQueue, ...settings } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...settings, announcementQueue: [] }));
    } catch {
      // Ignore localStorage errors
    }
  }, [state]);

  // Apply visual styles when mode is active
  useEffect(() => {
    if (!state.isActive) return;

    const style = document.createElement('style');
    style.id = 'screen-reader-mode-styles';
    
    let css = '';
    
    if (state.showAccessibleTextOnly) {
      css += `
        img:not([alt]), img[alt=""] { opacity: 0.3 !important; outline: 2px dashed red !important; }
        [aria-hidden="true"] { opacity: 0.2 !important; }
      `;
    }
    
    if (state.highlightFocusable) {
      css += `
        a, button, input, select, textarea, [tabindex]:not([tabindex="-1"]) {
          outline: 2px solid hsl(200 100% 50%) !important;
          outline-offset: 2px !important;
        }
      `;
    }
    
    if (state.showTabOrder) {
      css += `
        [data-tab-order]::before {
          content: attr(data-tab-order);
          position: absolute;
          top: -8px;
          left: -8px;
          background: hsl(280 100% 50%);
          color: white;
          font-size: 10px;
          padding: 2px 4px;
          border-radius: 4px;
          z-index: 10000;
          font-family: monospace;
        }
      `;
    }
    
    style.textContent = css;
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, [state.isActive, state.showAccessibleTextOnly, state.highlightFocusable, state.showTabOrder]);

  const toggle = useCallback(() => {
    setState(s => ({ ...s, isActive: !s.isActive }));
  }, []);

  const enable = useCallback(() => {
    setState(s => ({ ...s, isActive: true }));
  }, []);

  const disable = useCallback(() => {
    setState(s => ({ ...s, isActive: false }));
  }, []);

  const toggleFeature = useCallback((feature: keyof Omit<ScreenReaderModeState, 'isActive' | 'announcementQueue'>) => {
    setState(s => ({ ...s, [feature]: !s[feature] }));
  }, []);

  const addAnnouncement = useCallback((message: string) => {
    setState(s => ({
      ...s,
      announcementQueue: [...s.announcementQueue, message].slice(-50), // Keep last 50
    }));
  }, []);

  const clearAnnouncements = useCallback(() => {
    setState(s => ({ ...s, announcementQueue: [] }));
  }, []);

  const getAccessibleText = useCallback((element: HTMLElement): string => {
    // Check aria-label first
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Check aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) return labelElement.textContent || '';
    }

    // Check for associated label (form elements)
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent || '';
    }

    // Check alt text for images
    if (element instanceof HTMLImageElement) {
      return element.alt || '[Image without alt text]';
    }

    // Check title attribute
    const title = element.getAttribute('title');
    if (title) return title;

    // Fall back to text content
    return element.textContent?.trim() || '';
  }, []);

  const getAriaTree = useCallback((container: HTMLElement): AriaTreeNode[] => {
    const buildTree = (element: HTMLElement, level: number): AriaTreeNode | null => {
      const role = element.getAttribute('role') || getImplicitRole(element);
      if (!role) return null;

      const name = getAccessibleText(element);
      const children: AriaTreeNode[] = [];

      Array.from(element.children).forEach(child => {
        if (child instanceof HTMLElement) {
          const childNode = buildTree(child, level + 1);
          if (childNode) children.push(childNode);
        }
      });

      return { role, name, level, children, element };
    };

    const nodes: AriaTreeNode[] = [];
    Array.from(container.children).forEach(child => {
      if (child instanceof HTMLElement) {
        const node = buildTree(child, 0);
        if (node) nodes.push(node);
      }
    });

    return nodes;
  }, [getAccessibleText]);

  const getTabOrder = useCallback((container: HTMLElement): TabOrderItem[] => {
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const elements = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector));
    
    return elements
      .map((element, index) => ({
        index: index + 1,
        element,
        tabIndex: element.tabIndex,
        accessibleName: getAccessibleText(element),
      }))
      .sort((a, b) => {
        // Sort by tabIndex (positive values first, then 0)
        if (a.tabIndex !== b.tabIndex) {
          if (a.tabIndex > 0 && b.tabIndex > 0) return a.tabIndex - b.tabIndex;
          if (a.tabIndex > 0) return -1;
          if (b.tabIndex > 0) return 1;
        }
        return 0;
      });
  }, [getAccessibleText]);

  return {
    ...state,
    toggle,
    enable,
    disable,
    toggleFeature,
    addAnnouncement,
    clearAnnouncements,
    getAccessibleText,
    getAriaTree,
    getTabOrder,
  };
}

/**
 * Get implicit ARIA role for HTML element
 */
function getImplicitRole(element: HTMLElement): string | null {
  const tagRoles: Record<string, string> = {
    article: 'article',
    aside: 'complementary',
    button: 'button',
    dialog: 'dialog',
    footer: 'contentinfo',
    form: 'form',
    h1: 'heading',
    h2: 'heading',
    h3: 'heading',
    h4: 'heading',
    h5: 'heading',
    h6: 'heading',
    header: 'banner',
    img: 'img',
    input: getInputRole(element),
    li: 'listitem',
    main: 'main',
    nav: 'navigation',
    ol: 'list',
    option: 'option',
    progress: 'progressbar',
    section: 'region',
    select: 'listbox',
    table: 'table',
    textarea: 'textbox',
    ul: 'list',
  };

  return tagRoles[element.tagName.toLowerCase()] || null;
}

function getInputRole(element: HTMLElement): string {
  if (!(element instanceof HTMLInputElement)) return 'textbox';
  
  const typeRoles: Record<string, string> = {
    button: 'button',
    checkbox: 'checkbox',
    email: 'textbox',
    number: 'spinbutton',
    radio: 'radio',
    range: 'slider',
    search: 'searchbox',
    submit: 'button',
    tel: 'textbox',
    text: 'textbox',
    url: 'textbox',
  };

  return typeRoles[element.type] || 'textbox';
}
