import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plane, Shield, FileText, Sparkles, Loader2 } from 'lucide-react';
import { useCardGenius, type GeniusMode } from '@/hooks/useCardGenius';
import { motion, AnimatePresence } from 'framer-motion';

interface CardGeniusHubProps {
  cardId: string;
}

/**
 * Card Genius: Multi-modal AI assistant for credit card intelligence
 * Purchase Simulator | Travel Mode | Dispute Drafter | Benefits Concierge
 */
export function CardGeniusHub({ cardId }: CardGeniusHubProps) {
  const [mode, setMode] = useState<GeniusMode>('purchase');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<any>(null);
  
  const { mutate: askGenius, isPending } = useCardGenius();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    askGenius(
      { mode, query, context: { cardId } },
      {
        onSuccess: (data) => {
          setResponse(data);
        },
      }
    );
  };

  const modes = [
    { id: 'purchase' as GeniusMode, label: 'Purchase Simulator', icon: Sparkles, placeholder: 'Flight to Tokyo $1200' },
    { id: 'travel' as GeniusMode, label: 'Travel Mode', icon: Plane, placeholder: 'London' },
    { id: 'dispute' as GeniusMode, label: 'Dispute Drafter', icon: FileText, placeholder: 'Merchant charged me twice' },
    { id: 'benefits' as GeniusMode, label: 'Benefits Concierge', icon: Shield, placeholder: 'Did I break my phone?' },
  ];

  const currentMode = modes.find(m => m.id === mode)!;

  return (
    <Card className="border-2 border-violet-100 dark:border-violet-900/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Card Genius
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              AI assistant for your credit card
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2">
          {modes.map((m) => {
            const Icon = m.icon;
            return (
              <Button
                key={m.id}
                variant={mode === m.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode(m.id)}
                className="justify-start gap-2"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{m.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Query Input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={currentMode.placeholder}
              className="pr-12"
              disabled={isPending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isPending || !query.trim()}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>

        {/* Response Display */}
        <AnimatePresence mode="wait">
          {response && (
            <motion.div
              key={response.mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/20 dark:to-fuchsia-950/20 border border-violet-200 dark:border-violet-800"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {modes.find(m => m.id === response.mode)?.label}
                  </Badge>
                </div>
                
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {response.result}
                  </p>
                </div>

                {/* Structured Data Display */}
                {response.structured && (
                  <div className="mt-4 space-y-2">
                    {response.structured.points && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-black/20">
                        <span className="text-xs font-medium">Points Earned</span>
                        <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                          {response.structured.points.toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    {response.structured.protections && response.structured.protections.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">Active Protections:</span>
                        {response.structured.protections.map((p: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <Shield className="w-3 h-3 text-green-600" />
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
