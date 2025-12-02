import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Edit2, Mic, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import * as Icons from 'lucide-react';

interface BudgetPreview {
  amount: number;
  category: string;
  timeframe: 'weekly' | 'monthly' | 'yearly';
  icon: string;
  color: string;
  notes?: string;
  autoRenew: boolean;
}

interface QuickBudgetCreatorProps {
  onSuccess?: () => void;
  userId?: string;
}

const EXAMPLE_PROMPTS = [
  "Set aside $400 for groceries",
  "$2000 for Tokyo trip",
  "Weekly coffee budget $30",
  "$150 for dining out"
];

export function QuickBudgetCreator({ onSuccess, userId }: QuickBudgetCreatorProps) {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<BudgetPreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Rotate placeholder examples
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % EXAMPLE_PROMPTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Debounced AI analysis
  useEffect(() => {
    if (input.length < 5) {
      setPreview(null);
      return;
    }

    const timer = setTimeout(() => analyzeInput(), 500);
    return () => clearTimeout(timer);
  }, [input]);

  const analyzeInput = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-budget-nl', {
        body: { 
          input,
          context: {
            existingBudgets: [], // Could fetch from query
            recentCategories: []
          }
        }
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('AI is busy. Please try again in a moment.');
        } else if (error.message?.includes('402')) {
          toast.error('AI credits depleted. Please add credits to continue.');
        } else {
          toast.error('Failed to parse budget. Try being more specific.');
        }
        return;
      }

      setPreview(data.budget);
    } catch (error) {
      console.error('Error analyzing input:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const createBudget = async () => {
    if (!preview || !userId) return;

    setIsCreating(true);
    try {
      // Calculate period amount based on timeframe
      let periodAmount = preview.amount;
      if (preview.timeframe === 'weekly') {
        periodAmount = preview.amount * 4.33; // Convert to monthly
      } else if (preview.timeframe === 'yearly') {
        periodAmount = preview.amount / 12; // Convert to monthly
      }

      const { error } = await supabase.from('user_budgets').insert({
        user_id: userId,
        name: preview.category,
        total_limit: periodAmount,
        category_limits: { [preview.category]: periodAmount },
        period: 'monthly',
        icon: preview.icon,
        color: preview.color,
        notes: preview.notes,
        is_active: true
      });

      if (error) throw error;

      // Update creation log
      await supabase.from('budget_nl_creation_log').update({ was_created: true })
        .eq('user_id', userId)
        .eq('raw_input', input)
        .order('created_at', { ascending: false })
        .limit(1);

      // Success celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success(`${preview.category} budget created! 🎯`);
      
      // Reset state
      setInput('');
      setPreview(null);
      
      // Refresh budgets
      queryClient.invalidateQueries({ queryKey: ['user_budgets'] });
      
      onSuccess?.();
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget');
    } finally {
      setIsCreating(false);
    }
  };

  const IconComponent = preview?.icon ? (Icons as any)[preview.icon.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('')] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        whileHover={{ y: -2, boxShadow: "0 20px 40px -10px rgba(139, 92, 246, 0.3)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-purple-500/5">
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent shimmer" />

          <div className="relative p-6">
            <div className="flex items-start gap-4">
              <motion.div 
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center flex-shrink-0"
                animate={{ 
                  boxShadow: ["0 0 0 0 rgba(139, 92, 246, 0.4)", "0 0 0 10px rgba(139, 92, 246, 0)", "0 0 0 0 rgba(139, 92, 246, 0)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
              </motion.div>

              <div className="flex-1 space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-lg font-semibold">
                    Quick Budget Creator
                  </h3>
                  <motion.p 
                    className="text-sm text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    Describe your budget in plain English
                  </motion.p>
                </motion.div>

                <div className="relative">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={EXAMPLE_PROMPTS[placeholderIndex]}
                    className="pr-12 text-base"
                    disabled={isProcessing || isCreating}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && preview) {
                        createBudget();
                      }
                    }}
                  />
                  {isProcessing && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
                  )}
                </div>

                {/* Preview Card */}
                <AnimatePresence>
                  {preview && !isProcessing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="p-4 border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-purple-500/10">
                        <div className="flex items-start gap-4">
                          {IconComponent && (
                            <motion.div
                              initial={{ scale: 0, x: -20 }}
                              animate={{ scale: 1, x: 0 }}
                              transition={{ type: 'spring', stiffness: 200 }}
                              className="w-12 h-12 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${preview.color}20` }}
                            >
                              <IconComponent className="w-6 h-6" style={{ color: preview.color }} />
                            </motion.div>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{preview.category}</span>
                              <span className="text-xs text-muted-foreground">• {preview.timeframe}</span>
                              {preview.autoRenew && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600">
                                  Auto-renew
                                </span>
                              )}
                            </div>
                            <div className="text-2xl font-bold font-mono tabular-nums" style={{ color: preview.color }}>
                              ${preview.amount.toFixed(2)}
                            </div>
                            {preview.notes && (
                              <p className="text-sm text-muted-foreground mt-2">{preview.notes}</p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setPreview(null)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={createBudget}
                              disabled={isCreating}
                              className="gap-2"
                            >
                              {isCreating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              Create
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </motion.div>
  );
}
