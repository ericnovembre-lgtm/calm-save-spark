import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlaidLink } from 'react-plaid-link';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, X, Lock, Building2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import confetti from 'canvas-confetti';

interface NativePlaidConnectProps {
  userId: string;
  onSuccess: () => void;
  onExit: () => void;
}

export function NativePlaidConnect({ userId, onSuccess, onExit }: NativePlaidConnectProps) {
  const prefersReducedMotion = useReducedMotion();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    createLinkToken();
  }, []);

  const createLinkToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('plaid-create-link-token', {
        body: { userId }
      });

      if (error) throw error;
      setLinkToken(data.link_token);
    } catch (error) {
      console.error('Error creating link token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaidSuccess = async (publicToken: string, metadata: any) => {
    try {
      // Exchange token and prefetch dashboard data in parallel
      const [tokenResult] = await Promise.allSettled([
        supabase.functions.invoke('plaid-exchange-token', {
          body: { publicToken, userId, metadata }
        }),
        // Prefetch dashboard route chunk
        import('../../pages/Dashboard').catch(() => null),
        // Pre-warm goals data
        supabase.from('goals').select('*').eq('user_id', userId).limit(3),
        // Pre-cache user profile
        supabase.from('profiles').select('*').eq('id', userId).single(),
        // Initialize transactions structure
        supabase.from('transactions').select('*').eq('user_id', userId).limit(10),
      ]);

      if (tokenResult.status === 'fulfilled' && tokenResult.value.error) {
        throw tokenResult.value.error;
      }

      setIsConnected(true);

      if (!prefersReducedMotion) {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 }
        });
      }

      console.log('[Prefetch] Dashboard data pre-loaded during Plaid connection');

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      console.error('Error exchanging token:', error);
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handlePlaidSuccess,
    onExit: () => onExit(),
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
        onClick={onExit}
      >
        <motion.div
          initial={prefersReducedMotion ? false : { y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-primary/5 p-6 border-b border-border">
            <button
              onClick={onExit}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-background/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Connect Your Bank</h3>
                <p className="text-sm text-muted-foreground">Secure bank connection</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isConnected ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 20 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <h4 className="text-2xl font-bold mb-2">Connected!</h4>
                <p className="text-muted-foreground">Your bank is securely linked</p>
              </motion.div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Bank-level security</p>
                      <p className="text-sm text-muted-foreground">
                        256-bit encryption keeps your data safe
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Read-only access</p>
                      <p className="text-sm text-muted-foreground">
                        We can never move your money
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Trusted by millions</p>
                      <p className="text-sm text-muted-foreground">
                        Powered by Plaid, used by major financial apps
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => ready && open()}
                  disabled={!ready || isLoading}
                  className="w-full h-12 text-base rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    'Connect Bank Account'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  By connecting, you agree to Plaid's{' '}
                  <a href="https://plaid.com/legal" className="underline">
                    Terms of Service
                  </a>
                </p>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
