import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Calendar, TrendingUp, Target, Lightbulb } from 'lucide-react';
import { useFinancialMemory } from '@/hooks/useFinancialMemory';
import { format } from 'date-fns';

const categoryIcons = {
  goal: Target,
  preference: Brain,
  insight: Lightbulb,
  decision: TrendingUp,
  pattern: Brain,
};

const categoryColors = {
  goal: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  preference: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
  insight: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  decision: 'bg-green-500/10 text-green-700 dark:text-green-300',
  pattern: 'bg-pink-500/10 text-pink-700 dark:text-pink-300',
};

export function MemoryViewer() {
  const { getLocalMemories } = useFinancialMemory();
  const [memories, setMemories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMemories = async () => {
    setIsLoading(true);
    const data = await getLocalMemories();
    setMemories(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadMemories();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Financial Memory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Financial Memory
        </CardTitle>
        <CardDescription>
          {memories.length} memories stored • AI-powered semantic recall
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {memories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No memories yet</p>
              <p className="text-sm">Interact with AI agents to build your financial memory</p>
            </div>
          ) : (
            memories.map((memory) => {
              const Icon = categoryIcons[memory.memory_type as keyof typeof categoryIcons] || Brain;
              const colorClass = categoryColors[memory.memory_type as keyof typeof categoryColors] || 'bg-gray-500/10';

              return (
                <div
                  key={memory.id}
                  className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className={colorClass}>
                          <Icon className="h-3 w-3 mr-1" />
                          {memory.memory_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(memory.updated_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">{memory.key}</p>
                      <p className="text-sm text-muted-foreground">
                        {typeof memory.value === 'string' ? memory.value : JSON.stringify(memory.value)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" 
                        style={{ opacity: memory.confidence_score || 1 }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
