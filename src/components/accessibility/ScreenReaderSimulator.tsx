import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, List, Hash, MessageSquare, X, ChevronRight, ChevronDown } from 'lucide-react';
import { useScreenReaderMode } from '@/hooks/useScreenReaderMode';
import { cn } from '@/lib/utils';

interface ScreenReaderSimulatorProps {
  /** Container to analyze */
  containerRef?: React.RefObject<HTMLElement>;
  /** Whether panel is initially open */
  defaultOpen?: boolean;
  /** Position of the panel */
  position?: 'left' | 'right';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Development tool for simulating screen reader experience.
 * Shows accessible text, ARIA tree, and tab order.
 */
export function ScreenReaderSimulator({
  containerRef,
  defaultOpen = false,
  position = 'right',
  className,
}: ScreenReaderSimulatorProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<'tree' | 'order' | 'queue'>('tree');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const {
    isActive,
    showAccessibleTextOnly,
    highlightFocusable,
    showTabOrder,
    announcementQueue,
    toggle,
    toggleFeature,
    getAriaTree,
    getTabOrder,
    clearAnnouncements,
  } = useScreenReaderMode();

  const container = containerRef?.current || (typeof document !== 'undefined' ? document.body : null);
  const ariaTree = container ? getAriaTree(container) : [];
  const tabOrder = container ? getTabOrder(container) : [];

  // Apply tab order data attributes
  useEffect(() => {
    if (!showTabOrder || !container) return;

    tabOrder.forEach((item, index) => {
      item.element.setAttribute('data-tab-order', String(index + 1));
      item.element.style.position = item.element.style.position || 'relative';
    });

    return () => {
      tabOrder.forEach((item) => {
        item.element.removeAttribute('data-tab-order');
      });
    };
  }, [showTabOrder, tabOrder, container]);

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Only render in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed z-50 p-2 rounded-lg bg-violet-600 text-white shadow-lg hover:bg-violet-700 transition-colors',
          position === 'right' ? 'right-4 bottom-20' : 'left-4 bottom-20'
        )}
        aria-label={isOpen ? 'Close screen reader simulator' : 'Open screen reader simulator'}
        aria-expanded={isOpen}
      >
        {isOpen ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: position === 'right' ? 300 : -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: position === 'right' ? 300 : -300 }}
            transition={{ type: 'spring', damping: 25 }}
            className={cn(
              'fixed top-0 z-50 h-full w-80 bg-slate-900 border-l border-slate-700 shadow-xl flex flex-col',
              position === 'right' ? 'right-0' : 'left-0 border-l-0 border-r',
              className
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Screen Reader Simulator
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Controls */}
            <div className="p-3 border-b border-slate-700 space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={toggle}
                  className="rounded border-slate-600"
                />
                Enable SR Mode
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAccessibleTextOnly}
                  onChange={() => toggleFeature('showAccessibleTextOnly')}
                  className="rounded border-slate-600"
                />
                Dim non-accessible content
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={highlightFocusable}
                  onChange={() => toggleFeature('highlightFocusable')}
                  className="rounded border-slate-600"
                />
                Highlight focusable elements
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTabOrder}
                  onChange={() => toggleFeature('showTabOrder')}
                  className="rounded border-slate-600"
                />
                Show tab order numbers
              </label>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-700">
              <TabButton
                active={activeTab === 'tree'}
                onClick={() => setActiveTab('tree')}
                icon={<List className="w-3 h-3" />}
                label="ARIA Tree"
              />
              <TabButton
                active={activeTab === 'order'}
                onClick={() => setActiveTab('order')}
                icon={<Hash className="w-3 h-3" />}
                label="Tab Order"
              />
              <TabButton
                active={activeTab === 'queue'}
                onClick={() => setActiveTab('queue')}
                icon={<MessageSquare className="w-3 h-3" />}
                label="Announcements"
                badge={announcementQueue.length}
              />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-2">
              {activeTab === 'tree' && (
                <div className="space-y-1">
                  {ariaTree.length === 0 ? (
                    <p className="text-xs text-slate-500 p-2">No ARIA landmarks found</p>
                  ) : (
                    ariaTree.map((node, index) => (
                      <TreeNode
                        key={index}
                        node={node}
                        expandedNodes={expandedNodes}
                        toggleNode={toggleNode}
                        path={String(index)}
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'order' && (
                <div className="space-y-1">
                  {tabOrder.length === 0 ? (
                    <p className="text-xs text-slate-500 p-2">No focusable elements found</p>
                  ) : (
                    tabOrder.map((item) => (
                      <div
                        key={item.index}
                        className="flex items-center gap-2 p-2 rounded hover:bg-slate-800 cursor-pointer text-xs"
                        onClick={() => item.element.focus()}
                      >
                        <span className="w-5 h-5 flex items-center justify-center bg-violet-600 text-white rounded text-[10px] font-bold">
                          {item.index}
                        </span>
                        <span className="text-slate-300 truncate flex-1">
                          {item.accessibleName || `[${item.element.tagName.toLowerCase()}]`}
                        </span>
                        <span className="text-slate-500 text-[10px]">
                          tab:{item.tabIndex}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'queue' && (
                <div className="space-y-1">
                  {announcementQueue.length === 0 ? (
                    <p className="text-xs text-slate-500 p-2">No announcements yet</p>
                  ) : (
                    <>
                      <button
                        onClick={clearAnnouncements}
                        className="w-full text-xs text-slate-400 hover:text-white p-1 text-left"
                      >
                        Clear all
                      </button>
                      {announcementQueue.map((msg, index) => (
                        <div
                          key={index}
                          className="p-2 rounded bg-slate-800 text-xs text-slate-300"
                        >
                          {msg}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-700 text-[10px] text-slate-500">
              Development tool only. Not shown in production.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

function TabButton({ active, onClick, icon, label, badge }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs transition-colors',
        active
          ? 'text-violet-400 border-b-2 border-violet-400'
          : 'text-slate-400 hover:text-slate-200'
      )}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="px-1.5 py-0.5 bg-violet-600 text-white rounded-full text-[10px]">
          {badge}
        </span>
      )}
    </button>
  );
}

interface TreeNodeProps {
  node: {
    role: string;
    name: string;
    children: TreeNodeProps['node'][];
    element: HTMLElement;
  };
  expandedNodes: Set<string>;
  toggleNode: (id: string) => void;
  path: string;
}

function TreeNode({ node, expandedNodes, toggleNode, path }: TreeNodeProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedNodes.has(path);

  return (
    <div>
      <div
        className="flex items-center gap-1 p-1.5 rounded hover:bg-slate-800 cursor-pointer text-xs"
        onClick={() => {
          if (hasChildren) toggleNode(path);
          node.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="w-3 h-3 text-slate-500" />
          ) : (
            <ChevronRight className="w-3 h-3 text-slate-500" />
          )
        ) : (
          <span className="w-3" />
        )}
        <span className="px-1 py-0.5 bg-cyan-600/30 text-cyan-400 rounded text-[10px] font-mono">
          {node.role}
        </span>
        <span className="text-slate-300 truncate flex-1">
          {node.name || '[unnamed]'}
        </span>
      </div>
      {hasChildren && isExpanded && (
        <div className="ml-4 border-l border-slate-700 pl-2">
          {node.children.map((child, index) => (
            <TreeNode
              key={index}
              node={child}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              path={`${path}-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
