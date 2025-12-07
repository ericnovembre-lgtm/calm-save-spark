import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Search, Trash2, Plus, Loader2, Download, List, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useDigitalTwinMemory, TwinMemory } from '@/hooks/useDigitalTwinMemory';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ImportanceGlow } from './ImportanceGlow';
import { MemoryTimelineView } from './MemoryTimelineView';
import { format as formatDate } from 'date-fns';
import { toast } from 'sonner';

interface MemoryExplorerPanelProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES: TwinMemory['category'][] = ['scenario', 'insight', 'preference', 'pattern', 'conversation'];

const categoryColors: Record<TwinMemory['category'], string> = {
  scenario: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  insight: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  preference: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  pattern: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  conversation: 'bg-white/10 text-white/70 border-white/20',
};

export function MemoryExplorerPanel({ open, onClose }: MemoryExplorerPanelProps) {
  const { 
    isLoading, 
    allMemories, 
    listMemories, 
    deleteMemory, 
    storeMemory,
    retrieveMemories,
    memories: searchResults,
  } = useDigitalTwinMemory();

  const [selectedCategory, setSelectedCategory] = useState<TwinMemory['category'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Add memory form state
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<TwinMemory['category']>('insight');
  const [newImportance, setNewImportance] = useState([0.5]);

  // Export functionality
  const exportMemories = useCallback((format: 'json' | 'csv') => {
    if (allMemories.length === 0) {
      toast.error('No memories to export');
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      const exportData = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        totalMemories: allMemories.length,
        memories: allMemories.map(m => ({
          id: m.id,
          content: m.content,
          category: m.category,
          importance: m.importance,
          createdAt: m.createdAt,
        })),
      };
      content = JSON.stringify(exportData, null, 2);
      filename = `digital-twin-memories-${formatDate(new Date(), 'yyyy-MM-dd')}.json`;
      mimeType = 'application/json';
    } else {
      // CSV format
      const headers = ['ID', 'Content', 'Category', 'Importance', 'Created At'];
      const rows = allMemories.map(m => [
        m.id,
        `"${m.content.replace(/"/g, '""')}"`,
        m.category,
        m.importance.toString(),
        m.createdAt,
      ]);
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      filename = `digital-twin-memories-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`;
      mimeType = 'text/csv';
    }

    // Download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${allMemories.length} memories as ${format.toUpperCase()}`);
    setShowExportMenu(false);
  }, [allMemories]);

  // Load memories when panel opens
  useEffect(() => {
    if (open) {
      listMemories();
    }
  }, [open, listMemories]);

  // Handle category filter
  const handleCategoryFilter = (cat: TwinMemory['category'] | 'all') => {
    setSelectedCategory(cat);
    setSearchQuery('');
    if (cat === 'all') {
      listMemories();
    } else {
      listMemories(cat);
    }
  };

  // Handle semantic search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      listMemories(selectedCategory === 'all' ? undefined : selectedCategory);
      return;
    }
    setIsSearching(true);
    await retrieveMemories(searchQuery, 10);
    setIsSearching(false);
  };

  // Handle add memory
  const handleAddMemory = async () => {
    if (!newContent.trim()) return;
    
    await storeMemory(newContent, newCategory, newImportance[0]);
    
    // Reset form and refresh
    setNewContent('');
    setNewCategory('insight');
    setNewImportance([0.5]);
    setShowAddForm(false);
    listMemories(selectedCategory === 'all' ? undefined : selectedCategory);
  };

  // Handle delete
  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await deleteMemory(deleteTarget);
      setDeleteTarget(null);
    }
  };

  // Display memories (search results or all memories)
  const displayMemories = searchQuery.trim() && searchResults.length > 0 ? searchResults : allMemories;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-y-0 right-0 w-full max-w-md z-50 flex"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 -left-full w-[200vw] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <div className="relative w-full backdrop-blur-xl bg-black/90 border-l border-white/10 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-amber-400" />
                <h2 className="font-mono text-lg text-white">Memory Explorer</h2>
                <span className="px-2 py-0.5 text-xs font-mono bg-amber-500/20 text-amber-400 rounded">
                  {allMemories.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Export Button */}
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="text-white/60 hover:text-white"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <AnimatePresence>
                    {showExportMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-xl z-10"
                      >
                        <button
                          onClick={() => exportMemories('json')}
                          className="block w-full px-4 py-2 text-sm text-white/80 hover:bg-white/10 text-left"
                        >
                          Export as JSON
                        </button>
                        <button
                          onClick={() => exportMemories('csv')}
                          className="block w-full px-4 py-2 text-sm text-white/80 hover:bg-white/10 text-left"
                        >
                          Export as CSV
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <div className="flex gap-2">
                <Input
                  placeholder="Search memories semantically..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={isSearching}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* View Toggle + Category Tabs */}
            <div className="flex items-center gap-2 p-2 border-b border-white/10 overflow-x-auto">
              {/* View Mode Toggle */}
              <div className="flex bg-white/5 rounded-lg p-0.5 mr-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`p-1.5 rounded ${viewMode === 'timeline' ? 'bg-white/10 text-white' : 'text-white/40'}`}
                >
                  <Clock className="w-4 h-4" />
                </button>
              </div>

              {/* Category Tabs */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCategoryFilter('all')}
                className={`text-xs font-mono ${selectedCategory === 'all' ? 'bg-white/10 text-white' : 'text-white/50'}`}
              >
                All
              </Button>
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCategoryFilter(cat)}
                  className={`text-xs font-mono capitalize ${selectedCategory === cat ? 'bg-white/10 text-white' : 'text-white/50'}`}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Memory Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading && !isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                </div>
              ) : displayMemories.length === 0 ? (
                <div className="text-center py-12 text-white/40 font-mono text-sm">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No memories found</p>
                  <p className="text-xs mt-2">Chat with your Digital Twin to create memories</p>
                </div>
              ) : viewMode === 'timeline' ? (
                <MemoryTimelineView 
                  memories={displayMemories} 
                  onDelete={(id) => setDeleteTarget(id)} 
                />
              ) : (
                <div className="space-y-3">
                  {displayMemories.map((memory, index) => (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      {/* Category Badge with Importance Glow */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <ImportanceGlow importance={memory.importance}>
                            <div className="w-2 h-2 rounded-full bg-current" />
                          </ImportanceGlow>
                          <span className={`px-2 py-0.5 text-xs font-mono rounded border ${categoryColors[memory.category]}`}>
                            {memory.category}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(memory.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Content */}
                      <p className="text-sm text-white/80 mb-2 line-clamp-3">
                        {memory.content}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-white/40 font-mono">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px]">{Math.round(memory.importance * 100)}%</span>
                        </div>
                        <span>
                          {memory.createdAt ? formatDate(new Date(memory.createdAt), 'MMM d, yyyy') : 'Unknown'}
                        </span>
                      </div>

                      {/* Similarity score if from search */}
                      {memory.score && (
                        <div className="absolute top-3 right-10 text-xs font-mono text-amber-400">
                          {Math.round(memory.score * 100)}% match
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Memory Section */}
            <div className="border-t border-white/10">
              <AnimatePresence>
                {showAddForm ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4 space-y-3 overflow-hidden"
                  >
                    <Textarea
                      placeholder="Memory content..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[80px]"
                    />
                    
                    <div className="flex gap-3">
                      <Select value={newCategory} onValueChange={(v) => setNewCategory(v as TwinMemory['category'])}>
                        <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat} className="capitalize">
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-xs text-white/40">Importance:</span>
                        <Slider
                          value={newImportance}
                          onValueChange={setNewImportance}
                          min={0}
                          max={1}
                          step={0.1}
                          className="flex-1"
                        />
                        <span className="text-xs text-white/60 w-8">{Math.round(newImportance[0] * 100)}%</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddMemory}
                        disabled={isLoading || !newContent.trim()}
                        className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Add Memory
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setShowAddForm(false)}
                        className="text-white/50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4"
                  >
                    <Button
                      onClick={() => setShowAddForm(true)}
                      variant="outline"
                      className="w-full border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Memory Manually
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Delete Confirmation */}
          <ConfirmDialog
            open={!!deleteTarget}
            onCancel={() => setDeleteTarget(null)}
            title="Delete Memory"
            message="Are you sure you want to delete this memory? This action cannot be undone."
            confirmText="Delete"
            onConfirm={handleDeleteConfirm}
            destructive
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}