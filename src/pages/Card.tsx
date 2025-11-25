import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Plus, Activity, FileText, Sparkles, RefreshCw, DollarSign, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VolumetricCard3D } from '@/components/card/VolumetricCard3D';
import { CardGeniusHub } from '@/components/card/CardGeniusHub';
import { SmartLimitOptimizer } from '@/components/card/SmartLimitOptimizer';
import { AccountSummary } from '@/components/card/AccountSummary';
import { EnhancedCardTransactionList } from '@/components/card/EnhancedCardTransactionList';
import { CardSpendingInsights } from '@/components/card/CardSpendingInsights';
import { CardControls } from '@/components/card/CardControls';
import { CardRewardsDashboard } from '@/components/card/CardRewardsDashboard';
import { MerchantMapVisualization } from '@/components/card/MerchantMapVisualization';
import { CardReceiptScanner } from '@/components/card/CardReceiptScanner';
import { CardSubscriptionTracker } from '@/components/card/CardSubscriptionTracker';
import { BenefitHunterNudge } from '@/components/card/BenefitHunterNudge';
import { BenefitHunterPanel } from '@/components/card/BenefitHunterPanel';
import { useCardAccount } from '@/hooks/useCardAccount';
import { useCards } from '@/hooks/useCards';
import { useCardTransactions } from '@/hooks/useCardTransactions';
import { motion } from 'framer-motion';

export default function CardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const { account, isLoading: accountLoading, hasAccount } = useCardAccount();
  const { cards, isLoading: cardsLoading, freezeCard } = useCards(account?.id);
  const { transactions, isLoading: transactionsLoading } = useCardTransactions(account?.id);

  // Demo card for preview when no real cards exist yet
  const demoCard = {
    id: 'demo-card',
    account_id: account?.id || '',
    user_id: '',
    card_type: 'physical' as const,
    status: 'active' as const,
    brand: 'TITANIUM',
    network: 'visa',
    last4: '0000',
    exp_month: 12,
    exp_year: 2028,
    cardholder_name: 'YOUR NAME HERE',
    cvv_encrypted: null,
    pan_encrypted: null,
    billing_address: null,
    issued_at: null,
    activated_at: null,
    frozen_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const handleFreezeCard = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (card) {
      freezeCard(cardId, card.status !== 'frozen');
    }
  };

  if (accountLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-muted-foreground">Loading your card account...</div>
      </div>
    );
  }

  if (!hasAccount) {
    return (
      <div className="max-w-2xl mx-auto mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="pt-6 text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Get Your $ave+ Credit Card
                </h2>
                <p className="text-muted-foreground">
                  Start building credit while earning rewards on every purchase
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-foreground mb-1">Secured Card</h3>
                  <p className="text-sm text-muted-foreground">
                    Build credit with your own collateral
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-foreground mb-1">No Annual Fee</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep more of your money
                  </p>
                </div>
              </div>

              <Link to="/card/apply">
                <Button size="lg" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Apply for Card
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Premium Header */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 text-white">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">$ave+ Metal Card</CardTitle>
                <CardDescription>Premium credit card experience</CardDescription>
              </div>
            </div>
            <Link to="/card/apply">
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Apply for Card
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Hero Section: Volumetric Card + AI Hub */}
      {hasAccount && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Volumetric 3D Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {cards.length > 0 ? (
              <VolumetricCard3D 
                card={cards[0]} 
                onFreeze={handleFreezeCard}
              />
            ) : (
              <div className="relative">
                {/* Demo badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="px-3 py-1 text-xs font-bold bg-violet-500/90 text-white rounded-full backdrop-blur-sm">
                    PREVIEW
                  </span>
                </div>
                <VolumetricCard3D 
                  card={demoCard as any} 
                />
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Your card is being prepared. This is a preview of what it will look like.
                </p>
              </div>
            )}
          </motion.div>

          {/* Card Genius AI Hub */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CardGeniusHub cardId={cards[0]?.id || 'demo'} />
          </motion.div>
        </div>
      )}

      {/* Smart Limit Optimizer */}
      {account && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SmartLimitOptimizer accountId={account.id} currentLimit={1200} />
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 h-12">
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Rewards</span>
          </TabsTrigger>
          <TabsTrigger value="benefits" className="gap-2">
            <Gift className="w-4 h-4" />
            <span className="hidden sm:inline">Benefits</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Transactions</span>
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Subscriptions</span>
          </TabsTrigger>
          <TabsTrigger value="controls" className="gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Controls</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Benefit Hunter Nudge */}
          <BenefitHunterNudge maxDisplay={1} onViewAll={() => setActiveTab('benefits')} />

          {/* Account Summary */}
          <AccountSummary account={account} />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-6 flex-col gap-2 hover:scale-[1.02] transition-transform active:scale-[0.98]"
                  onClick={() => setActiveTab('transactions')}
                >
                  <Activity className="w-6 h-6" />
                  <span className="text-sm font-medium">View Activity</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-6 flex-col gap-2 hover:scale-[1.02] transition-transform active:scale-[0.98]"
                  asChild
                >
                  <Link to="/reports">
                    <FileText className="w-6 h-6" />
                    <span className="text-sm font-medium">Statements</span>
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-6 flex-col gap-2 hover:scale-[1.02] transition-transform active:scale-[0.98]"
                  asChild
                >
                  <Link to="/accounts">
                    <DollarSign className="w-6 h-6" />
                    <span className="text-sm font-medium">Make Payment</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          {(cards.length > 0 || hasAccount) && (
            <CardRewardsDashboard cardId={cards[0]?.id || 'demo'} />
          )}
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <BenefitHunterPanel />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <CardReceiptScanner />
          <MerchantMapVisualization cardId={cards[0]?.id || 'demo'} />
          <CardSpendingInsights cardId={cards[0]?.id || 'demo'} />
          <EnhancedCardTransactionList transactions={transactions} isLoading={transactionsLoading} />
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <CardSubscriptionTracker />
        </TabsContent>

        <TabsContent value="controls" className="space-y-6">
          {account && cards.length > 0 ? (
            <div className="space-y-6">
              {cards.map((card) => (
                <div key={card.id} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Card ending in {card.last4}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <VolumetricCard3D card={card} onFreeze={handleFreezeCard} />
                    </CardContent>
                  </Card>
                  
                  <CardControls 
                    controls={{
                      id: `control-${card.id}`,
                      account_id: card.account_id,
                      user_id: card.user_id,
                      international_enabled: true,
                      contactless_enabled: true,
                      online_enabled: true,
                      atm_enabled: true,
                      daily_spend_limit_cents: 100000,
                      single_transaction_limit_cents: 50000,
                      monthly_spend_limit_cents: null,
                      allowed_merchant_categories: null,
                      blocked_merchant_categories: null,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No cards available to configure controls
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
