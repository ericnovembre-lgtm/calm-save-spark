/**
 * TransactionAlertTester - Dev-only component for testing Groq-powered anomaly detection
 * Inserts suspicious test transactions and can manually trigger processing
 */

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { FlaskConical, Zap, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  timestamp?: number;
}

export function TransactionAlertTester() {
  const [isInserting, setIsInserting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testTransactionId, setTestTransactionId] = useState<string | null>(null);

  const updateResult = (step: string, status: TestResult['status'], message?: string) => {
    setTestResults(prev => {
      const existing = prev.findIndex(r => r.step === step);
      const newResult: TestResult = { step, status, message, timestamp: Date.now() };
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newResult;
        return updated;
      }
      return [...prev, newResult];
    });
  };

  const insertTestTransaction = async () => {
    setIsInserting(true);
    setTestResults([]);
    setTestTransactionId(null);

    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast.error('Must be logged in to test');
        return;
      }

      updateResult('auth', 'success', 'User authenticated');

      // Get user's first connected account
      const { data: accounts } = await supabase
        .from('connected_accounts')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      const accountId = accounts?.[0]?.id;
      
      // Insert suspicious test transaction
      const testTransaction = {
        user_id: user.id,
        account_id: accountId || null,
        merchant: 'SUSPICIOUS MERCHANT XYZ - TEST',
        amount: -499.99, // Large expense (negative = expense)
        category: 'Unknown',
        transaction_date: new Date().toISOString(),
        description: 'Test transaction for Groq anomaly detection',
        is_pending: false,
      };

      updateResult('insert', 'pending', 'Inserting test transaction...');

      const { data: inserted, error: insertError } = await supabase
        .from('transactions')
        .insert(testTransaction)
        .select()
        .single();

      if (insertError) {
        updateResult('insert', 'error', insertError.message);
        toast.error('Failed to insert test transaction');
        return;
      }

      setTestTransactionId(inserted.id);
      updateResult('insert', 'success', `Transaction ID: ${inserted.id.slice(0, 8)}...`);

      // Check if queue entry was created (trigger should have fired)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: queueEntry } = await supabase
        .from('transaction_alert_queue')
        .select('*')
        .eq('transaction_id', inserted.id)
        .single();

      if (queueEntry) {
        updateResult('trigger', 'success', `Queue entry created (status: ${queueEntry.status})`);
      } else {
        updateResult('trigger', 'pending', 'Waiting for trigger...');
      }

      toast.success('Test transaction inserted! Click "Process Now" or wait for pg_cron.');

    } catch (error: any) {
      console.error('Test failed:', error);
      toast.error('Test failed: ' + error.message);
    } finally {
      setIsInserting(false);
    }
  };

  const processNow = async () => {
    setIsProcessing(true);
    updateResult('process', 'pending', 'Invoking edge function...');

    try {
      const { data, error } = await supabase.functions.invoke('process-transaction-alerts', {
        body: {}
      });

      if (error) {
        updateResult('process', 'error', error.message);
        toast.error('Processing failed');
        return;
      }

      updateResult('process', 'success', `Processed ${data?.processed || 0} alerts`);

      // Check for notifications created
      if (testTransactionId) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: notifications } = await supabase
          .from('wallet_notifications')
          .select('*')
          .eq('notification_type', 'transaction_alert')
          .order('created_at', { ascending: false })
          .limit(1);

        if (notifications && notifications.length > 0) {
          const notif = notifications[0];
          updateResult('notification', 'success', `Alert created: "${notif.title}"`);
          toast.success('End-to-end test complete! Check for toast notification.');
        } else {
          updateResult('notification', 'pending', 'No notification yet (may not be anomalous)');
        }

        // Check queue status
        const { data: queueEntry } = await supabase
          .from('transaction_alert_queue')
          .select('*')
          .eq('transaction_id', testTransactionId)
          .single();

        if (queueEntry) {
          updateResult('queue', 'success', `Queue status: ${queueEntry.status}`);
        }
      }

    } catch (error: any) {
      updateResult('process', 'error', error.message);
      toast.error('Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const cleanupTestData = async () => {
    if (!testTransactionId) return;

    try {
      // Delete test transaction (will cascade to queue)
      await supabase
        .from('transactions')
        .delete()
        .eq('id', testTransactionId);

      setTestTransactionId(null);
      setTestResults([]);
      toast.success('Test data cleaned up');
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />;
    }
  };

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <Card className="border-dashed border-amber-500/50 bg-amber-950/10">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-amber-500" />
          <CardTitle className="text-sm font-medium">Transaction Alert Tester</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Dev-only: Test Groq-powered anomaly detection end-to-end
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={insertTestTransaction}
            disabled={isInserting || isProcessing}
            className="flex-1"
          >
            {isInserting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FlaskConical className="w-4 h-4 mr-2" />
            )}
            Insert Test Transaction
          </Button>
          <Button
            size="sm"
            onClick={processNow}
            disabled={isProcessing || !testTransactionId}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Process Now
          </Button>
        </div>

        <AnimatePresence>
          {testResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 text-xs"
            >
              {testResults.map((result, i) => (
                <motion.div
                  key={result.step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2 p-2 rounded bg-background/50"
                >
                  {getStatusIcon(result.status)}
                  <span className="font-medium capitalize">{result.step}:</span>
                  <span className="text-muted-foreground truncate">{result.message}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {testTransactionId && (
          <Button
            size="sm"
            variant="ghost"
            onClick={cleanupTestData}
            className="w-full text-xs text-muted-foreground"
          >
            🧹 Cleanup Test Data
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
