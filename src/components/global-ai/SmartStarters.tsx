import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useGlobalAI } from '@/contexts/GlobalAIContext';
import { toast } from 'sonner';

interface Starter {
  text: string;
  category: 'time' | 'page' | 'pattern' | 'alert';
}

export function SmartStarters() {
  const [starters, setStarters] = useState<Starter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { pageContext, addMessage } = useGlobalAI();

  useEffect(() => {
    fetchStarters();
  }, [pageContext]);

  const fetchStarters = async () => {
    if (!pageContext) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('conversation-starters', {
        body: {
          pageRoute: pageContext.route,
          pageTitle: pageContext.title,
          pageData: pageContext.data,
        },
      });

      if (error) throw error;
      setStarters(data.starters || []);
    } catch (error) {
      console.error('Error fetching starters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStarterClick = (starter: Starter) => {
    addMessage('user', starter.text);
  };

  if (isLoading) {
    return (
      <div className="flex gap-2 animate-pulse">
        <div className="h-8 bg-muted rounded-full w-32" />
        <div className="h-8 bg-muted rounded-full w-40" />
        <div className="h-8 bg-muted rounded-full w-36" />
      </div>
    );
  }

  if (starters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {starters.slice(0, 3).map((starter, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => handleStarterClick(starter)}
          className="rounded-full text-xs"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          {starter.text}
        </Button>
      ))}
    </div>
  );
}
