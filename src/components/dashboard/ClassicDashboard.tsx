import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  PiggyBank, 
  Target, 
  TrendingUp, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export function ClassicDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch pots (savings)
  const { data: pots, isLoading: potsLoading } = useQuery({
    queryKey: ['pots', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('pots')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch goals
  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch recent transactions
  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['recent-transactions', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('transaction_date', { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!user?.id
  });

  const totalSavings = pots?.reduce((sum, pot) => sum + (pot.current_amount || 0), 0) || 0;
  const goalsProgress = goals?.reduce((sum, goal) => sum + (goal.current_amount || 0), 0) || 0;
  const goalsTarget = goals?.reduce((sum, goal) => sum + (goal.target_amount || 0), 0) || 1;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Balance Overview */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Savings</p>
                {potsLoading ? (
                  <Skeleton className="h-10 w-32 mt-1" />
                ) : (
                  <h2 className="text-4xl font-bold text-foreground">
                    ${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </h2>
                )}
              </div>
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <PiggyBank className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Wallet className="h-4 w-4" />
              <span className="text-xs">Pots</span>
            </div>
            <p className="text-2xl font-semibold">{pots?.length || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              <span className="text-xs">Goals</span>
            </div>
            <p className="text-2xl font-semibold">{goals?.length || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-xs">Income</span>
            </div>
            <p className="text-2xl font-semibold text-emerald-500">
              ${transactions?.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0).toFixed(0) || '0'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-rose-500 mb-1">
              <ArrowDownRight className="h-4 w-4" />
              <span className="text-xs">Spending</span>
            </div>
            <p className="text-2xl font-semibold text-rose-500">
              ${Math.abs(transactions?.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0) || 0).toFixed(0)}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Goals Progress */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Goals Progress</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/goals')}>
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {goalsLoading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : goals?.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">No goals yet</p>
                <Button onClick={() => navigate('/goals')}>
                  <Plus className="h-4 w-4 mr-2" /> Create Goal
                </Button>
              </div>
            ) : (
              goals?.slice(0, 3).map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-muted-foreground">
                      ${goal.current_amount?.toFixed(0)} / ${goal.target_amount?.toFixed(0)}
                    </span>
                  </div>
                  <Progress 
                    value={(goal.current_amount / goal.target_amount) * 100} 
                    className="h-2"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Savings Pots */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Savings Pots</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/pots')}>
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {potsLoading ? (
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : pots?.length === 0 ? (
              <div className="text-center py-8">
                <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">No pots yet</p>
                <Button onClick={() => navigate('/pots')}>
                  <Plus className="h-4 w-4 mr-2" /> Create Pot
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pots?.slice(0, 6).map((pot) => (
                  <div 
                    key={pot.id}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer"
                    onClick={() => navigate('/pots')}
                  >
                    <div className="text-2xl mb-2">{pot.icon || '💰'}</div>
                    <p className="font-medium text-sm truncate">{pot.name}</p>
                    <p className="text-lg font-semibold text-primary">
                      ${pot.current_amount?.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {txLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : transactions?.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions?.map((tx) => (
                  <div 
                    key={tx.id}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        tx.amount > 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                      }`}>
                        {tx.amount > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-rose-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tx.merchant || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{tx.category || 'Uncategorized'}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${tx.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
