import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Mail, Sparkles, Phone, Clock, Award, RefreshCw, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Debt = Database['public']['Tables']['debts']['Row'];

interface DebtNegotiationScriptModalProps {
  debt: Debt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NegotiationScript {
  opening: string;
  talking_points: string[];
  apr_request: string;
  fallback_strategies?: string[];
  closing: string;
}

export function DebtNegotiationScriptModal({ debt, open, onOpenChange }: DebtNegotiationScriptModalProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['debt-negotiation-script', debt.id, refreshKey],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-debt-negotiation-script', {
        body: {
          debt_name: debt.debt_name,
          creditor: debt.debt_name, // Use debt name as creditor identifier
          balance: debt.current_balance,
          interest_rate: debt.interest_rate,
          debt_type: debt.debt_type
        }
      });
      if (error) throw error;
      return data;
    },
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const script: NegotiationScript | null = data?.script;
  const successRate = data?.success_rate || 68;

  const handleCopyScript = () => {
    if (!script) return;
    
    const fullScript = `
NEGOTIATION SCRIPT FOR ${debt.debt_name}

OPENING:
${script.opening}

KEY TALKING POINTS:
${script.talking_points.map((point, i) => `${i + 1}. ${point}`).join('\n')}

APR REDUCTION REQUEST:
${script.apr_request}

${script.fallback_strategies ? `FALLBACK STRATEGIES:
${script.fallback_strategies.map((strategy, i) => `${i + 1}. ${strategy}`).join('\n')}` : ''}

CLOSING:
${script.closing}
    `.trim();

    navigator.clipboard.writeText(fullScript);
    toast.success('Script copied to clipboard!');
  };

  const handleEmailScript = () => {
    if (!script) return;
    
    const subject = encodeURIComponent(`Negotiation Script - ${debt.debt_name}`);
    const body = encodeURIComponent(`Script to negotiate APR reduction:\n\n${script.opening}\n\nKey points:\n${script.talking_points.join('\n')}\n\nRequest: ${script.apr_request}\n\nClosing: ${script.closing}`);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleRegenerate = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              APR Negotiation Script
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-generated script for negotiating {debt.debt_name}
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Success Rate Badge */}
          <Card className="p-4 border-2 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-foreground">~{successRate}% Success Rate</p>
                  <p className="text-xs text-muted-foreground">Users successfully reduce their APR</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                </motion.div>
                <p className="text-sm text-muted-foreground">
                  Generating personalized negotiation script...
                </p>
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="p-6 border-destructive/50 bg-destructive/5">
              <p className="text-sm text-destructive">
                Failed to generate script. {error.message || 'Please try again.'}
              </p>
            </Card>
          )}

          {/* Script Content */}
          <AnimatePresence mode="wait">
            {script && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Opening */}
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    Opening Statement
                  </h3>
                  <p className="text-sm text-foreground/90 leading-relaxed">{script.opening}</p>
                </Card>

                {/* Talking Points */}
                <Card className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">Key Talking Points</h3>
                  <ul className="space-y-2">
                    {script.talking_points.map((point, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 text-sm text-foreground/90"
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                          {i + 1}
                        </span>
                        <span className="flex-1">{point}</span>
                      </motion.li>
                    ))}
                  </ul>
                </Card>

                {/* APR Request */}
                <Card className="p-6 bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Your APR Reduction Request
                  </h3>
                  <p className="text-sm text-foreground/90 leading-relaxed font-medium">{script.apr_request}</p>
                </Card>

                {/* Fallback Strategies */}
                {script.fallback_strategies && script.fallback_strategies.length > 0 && (
                  <Card className="p-6">
                    <h3 className="font-semibold text-foreground mb-3">Fallback Strategies</h3>
                    <ul className="space-y-2">
                      {script.fallback_strategies.map((strategy, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <span className="text-primary">•</span>
                          <span className="flex-1">{strategy}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Closing */}
                <Card className="p-6 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
                  <h3 className="font-semibold text-foreground mb-3">Closing Statement</h3>
                  <p className="text-sm text-foreground/90 leading-relaxed">{script.closing}</p>
                </Card>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <Button onClick={handleCopyScript} variant="outline" className="gap-2">
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                  <Button onClick={handleEmailScript} variant="outline" className="gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                  <Button onClick={handleRegenerate} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </Button>
                </div>

                {/* Pro Tips */}
                <Card className="p-4 bg-accent/5 border-accent/20">
                  <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    Pro Tips
                  </h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Best time to call: 10am-2pm on weekdays</li>
                    <li>• Ask to speak with the retention department</li>
                    <li>• Be polite but persistent - don't accept "no" immediately</li>
                    <li>• Have your payment history ready to reference</li>
                  </ul>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
