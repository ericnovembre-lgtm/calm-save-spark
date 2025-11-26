import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { useFinancialMemory } from '@/hooks/useFinancialMemory';
import { format } from 'date-fns';

export function MemoryTimeline() {
  const { getLocalMemories } = useFinancialMemory();
  const [memories, setMemories] = useState<any[]>([]);

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    const data = await getLocalMemories();
    setMemories(data);
  };

  const groupedMemories = memories.reduce((acc, memory) => {
    const date = format(new Date(memory.updated_at), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(memory);
    return acc;
  }, {} as Record<string, Array<Record<string, any>>>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Memory Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {(Object.entries(groupedMemories) as [string, Array<Record<string, any>>][])
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([date, mems]) => (
                <div key={date} className="relative pl-6 border-l-2 border-muted pb-4">
                  <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary" />
                  <div className="mb-3">
                    <p className="text-sm font-medium">
                      {format(new Date(date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {mems.map((memory) => (
                      <div
                        key={memory.id}
                        className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {memory.memory_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(memory.updated_at), 'h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm">{memory.key}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
