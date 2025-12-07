import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TwinMemory } from '@/hooks/useDigitalTwinMemory';
import { ImportanceGlow } from './ImportanceGlow';
import { format, parseISO, isValid } from 'date-fns';

interface MemoryTimelineViewProps {
  memories: TwinMemory[];
  onDelete: (id: string) => void;
}

interface DateCluster {
  date: string;
  label: string;
  memories: TwinMemory[];
}

const categoryColors: Record<TwinMemory['category'], string> = {
  scenario: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  insight: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  preference: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  pattern: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  conversation: 'bg-white/10 text-white/70 border-white/20',
};

export function MemoryTimelineView({ memories, onDelete }: MemoryTimelineViewProps) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // Group memories by date
  const clusters = useMemo(() => {
    const grouped: Record<string, TwinMemory[]> = {};
    
    memories.forEach((memory) => {
      if (!memory.createdAt) return;
      
      const date = parseISO(memory.createdAt);
      if (!isValid(date)) return;
      
      const dateKey = format(date, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(memory);
    });

    // Sort by date descending and convert to clusters
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([dateKey, mems]): DateCluster => ({
        date: dateKey,
        label: format(parseISO(dateKey), 'MMMM d, yyyy'),
        memories: mems.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      }));
  }, [memories]);

  // Group clusters by month
  const monthGroups = useMemo(() => {
    const groups: Record<string, DateCluster[]> = {};
    
    clusters.forEach((cluster) => {
      const monthKey = cluster.date.substring(0, 7); // yyyy-MM
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(cluster);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([monthKey, clusters]) => ({
        monthKey,
        label: format(parseISO(`${monthKey}-01`), 'MMMM yyyy'),
        clusters,
        totalMemories: clusters.reduce((sum, c) => sum + c.memories.length, 0),
      }));
  }, [clusters]);

  const toggleDate = (dateKey: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  };

  // Auto-expand first date on mount
  useMemo(() => {
    if (clusters.length > 0 && expandedDates.size === 0) {
      setExpandedDates(new Set([clusters[0].date]));
    }
  }, [clusters]);

  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white/40">
        <Calendar className="w-12 h-12 mb-4 opacity-30" />
        <p className="font-mono text-sm">No memories to display</p>
        <p className="text-xs mt-2">Chat with your Digital Twin to create memories</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {monthGroups.map((monthGroup, monthIndex) => (
        <motion.div
          key={monthGroup.monthKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: monthIndex * 0.1 }}
        >
          {/* Month Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-amber-500/50 to-transparent" />
            <span className="text-sm font-mono text-amber-400 px-2">
              {monthGroup.label}
            </span>
            <span className="text-xs font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded">
              {monthGroup.totalMemories} memories
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-amber-500/50 to-transparent" />
          </div>

          {/* Date Clusters */}
          <div className="relative pl-6 border-l border-white/10">
            {monthGroup.clusters.map((cluster, clusterIndex) => {
              const isExpanded = expandedDates.has(cluster.date);
              
              return (
                <motion.div
                  key={cluster.date}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: clusterIndex * 0.05 }}
                  className="relative mb-4"
                >
                  {/* Timeline Node */}
                  <div className="absolute -left-[25px] top-1.5 w-3 h-3 rounded-full bg-stone-900 border-2 border-amber-500/50" />
                  
                  {/* Date Header */}
                  <button
                    onClick={() => toggleDate(cluster.date)}
                    className="flex items-center gap-2 w-full text-left hover:bg-white/5 rounded-lg p-2 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-amber-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-white/40" />
                    )}
                    <span className="text-sm font-mono text-white/80">
                      {format(parseISO(cluster.date), 'MMM d')}
                    </span>
                    <span className="text-xs font-mono text-white/40 bg-white/10 px-1.5 py-0.5 rounded">
                      {cluster.memories.length}
                    </span>
                  </button>

                  {/* Expanded Memories */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 pl-6 pt-2">
                          {cluster.memories.map((memory, memIndex) => (
                            <motion.div
                              key={memory.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: memIndex * 0.03 }}
                              className="group relative p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                            >
                              {/* Header Row */}
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
                                  onClick={() => onDelete(memory.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>

                              {/* Content */}
                              <p className="text-sm text-white/80 line-clamp-2">
                                {memory.content}
                              </p>

                              {/* Time */}
                              <div className="text-[10px] text-white/40 font-mono mt-2">
                                {format(parseISO(memory.createdAt), 'h:mm a')}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}