import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { CreditCard, Plus, Activity, FileText, Sparkles, RefreshCw, DollarSign, Gift, Palette, RotateCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { VolumetricCard3D } from '@/components/card/VolumetricCard3D';
import { PhysicalCreditCard } from '@/components/card/PhysicalCreditCard';
import { CardCustomizationWizard, CustomizationData } from '@/components/card/CardCustomizationWizard';
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
import { CardInspectionMode } from '@/components/card/CardInspectionMode';
import { CardUnboxingExperience } from '@/components/card/CardUnboxingExperience';
import { LaserEngravingPreview } from '@/components/card/LaserEngravingPreview';
import { BillingStatementsPanel } from '@/components/card/BillingStatementsPanel';
import { CardActivationFlow } from '@/components/card/CardActivationFlow';
import { useCardAccount } from '@/hooks/useCardAccount';
import { useCards } from '@/hooks/useCards';
import { useCardTransactions } from '@/hooks/useCardTransactions';
import { useCardUnboxing } from '@/hooks/useCardUnboxing';
import { useCardControls } from '@/hooks/useCardControls';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function CardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [cardVariant, setCardVariant] = useState<'matte-black' | 'matte-white' | 'metallic-gold' | 'metallic-silver'>('matte-black');
  const [showWizard, setShowWizard] = useState(false);
  const [inspectionMode, setInspectionMode] = useState(false);
  const [showEngraving, setShowEngraving] = useState(false);
  const [showActivation, setShowActivation] = useState(false);
  const { account, isLoading: accountLoading, hasAccount } = useCardAccount();
  const { cards, isLoading: cardsLoading, freezeCard } = useCards(account?.id);
  const { transactions, isLoading: transactionsLoading } = useCardTransactions(account?.id);
  const { hasSeenUnboxing, isUnboxing, completeUnboxing, replayUnboxing } = useCardUnboxing();
  const { controls, isLoading: controlsLoading, updateControls } = useCardControls(account?.id);

  // Auto-trigger unboxing on first visit if user has account
  useEffect(() => {
    if (hasAccount && !hasSeenUnboxing && cards.length > 0) {
      replayUnboxing();
    }
  }, [hasAccount, hasSeenUnboxing, cards.length, replayUnboxing]);

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

  const handleOrderCard = async (data: CustomizationData) => {
    if (!account) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate card details
      const expDate = new Date();
      expDate.setFullYear(expDate.getFullYear() + 4);
      const last4 = Math.floor(1000 + Math.random() * 9000).toString();

      // Create the card
      const { data: newCard, error: cardError } = await supabase
        .from('cards')
        .insert({
          account_id: account.id,
          user_id: user.id,
          card_type: 'physical',
          status: 'pending',
          cardholder_name: data.cardholderName,
          last4,
          exp_month: expDate.getMonth() + 1,
          exp_year: expDate.getFullYear(),
          network: 'visa',
          brand: data.variant.toUpperCase().replace(/-/g, ' '),
        })
        .select()
        .single();

      if (cardError) throw cardError;

      // Create default card controls if they don't exist
      const { error: controlsError } = await supabase
        .from('card_controls')
        .insert({
          account_id: account.id,
          user_id: user.id,
          daily_spend_limit_cents: 100000,
          single_transaction_limit_cents: 50000,
          international_enabled: false,
          online_enabled: true,
          contactless_enabled: true,
          atm_enabled: true,
        });

      if (controlsError && controlsError.code !== '23505') {
        // Ignore duplicate key errors (controls already exist)
        console.error('Error creating controls:', controlsError);
      }

      setCardVariant(data.variant);
      setShowWizard(false);
      toast.success('Card ordered successfully! It will arrive in 7-10 business days.');
      
      // Trigger unboxing experience
      setTimeout(() => {
        replayUnboxing();
      }, 500);
    } catch (error) {
      console.error('Error ordering card:', error);
      toast.error('Failed to order card. Please try again.');
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

      {/* Hero Card Section - Front and Center */}
      {hasAccount && (
        <motion.div 
          className="relative py-8 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Credit Card - Hero Element */}
          <div className="relative mb-6 transform scale-110">
            {!cards.length && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="px-3 py-1 text-xs font-bold bg-violet-500/90 text-white rounded-full backdrop-blur-sm">
                  PREVIEW
                </span>
              </div>
            )}
            <PhysicalCreditCard
              variant={cardVariant}
              cardNumber={cards[0]?.last4 || demoCard.last4}
              cardHolder={cards[0]?.cardholder_name || demoCard.cardholder_name}
              expiryDate={`${String(cards[0]?.exp_month || demoCard.exp_month).padStart(2, '0')}/${String(cards[0]?.exp_year || demoCard.exp_year).slice(-2)}`}
              showDetails={true}
            />
          </div>

          {/* Compact Variant Selector */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setCardVariant('matte-black')}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                cardVariant === 'matte-black' 
                  ? 'ring-2 ring-primary ring-offset-2 scale-110' 
                  : 'opacity-60 hover:opacity-100'
              }`}
              style={{ background: '#1a1a1a' }}
              aria-label="Matte Black"
            />
            <button
              onClick={() => setCardVariant('matte-white')}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                cardVariant === 'matte-white' 
                  ? 'ring-2 ring-primary ring-offset-2 scale-110' 
                  : 'opacity-60 hover:opacity-100'
              }`}
              style={{ background: '#FAFAFA', borderColor: '#e5e5e5' }}
              aria-label="Matte White"
            />
            <button
              onClick={() => setCardVariant('metallic-gold')}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                cardVariant === 'metallic-gold' 
                  ? 'ring-2 ring-primary ring-offset-2 scale-110' 
                  : 'opacity-60 hover:opacity-100'
              }`}
              style={{ background: 'linear-gradient(135deg, #BF953F, #B38728)' }}
              aria-label="Metallic Gold"
            />
            <button
              onClick={() => setCardVariant('metallic-silver')}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                cardVariant === 'metallic-silver' 
                  ? 'ring-2 ring-primary ring-offset-2 scale-110' 
                  : 'opacity-60 hover:opacity-100'
              }`}
              style={{ background: 'linear-gradient(135deg, #E0E0E0, #B0B0B0)' }}
              aria-label="Metallic Silver"
            />
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowWizard(true)}
              className="gap-2"
            >
              <Palette className="w-4 h-4" />
              Customize
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInspectionMode(true)}
              className="gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Inspect 360°
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={replayUnboxing}
              className="gap-2"
            >
              <Gift className="w-4 h-4" />
              Unboxing
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEngraving(true)}
              className="gap-2"
            >
              <svg 
                className="w-4 h-4" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              Personalize
            </Button>
          </div>

          {!cards.length && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Your card is being prepared. This is a preview of what it will look like.
            </p>
          )}
        </motion.div>
      )}

      {/* Card Genius Hub and Smart Limit Optimizer Grid */}
      {hasAccount && account && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CardGeniusHub cardId={cards[0]?.id || 'demo'} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <SmartLimitOptimizer accountId={account.id} currentLimit={1200} />
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7 h-12">
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Billing</span>
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
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Subs</span>
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

          {/* Card Activation Notice */}
          {cards[0] && !cards[0].activated_at && (
            <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100">Activate Your Card</h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300">Your card needs to be activated before use</p>
                  </div>
                  <Button onClick={() => setShowActivation(true)} variant="default">
                    Activate Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

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
                  onClick={() => setActiveTab('billing')}
                >
                  <FileText className="w-6 h-6" />
                  <span className="text-sm font-medium">Statements</span>
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
                  
                  {controlsLoading ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <div className="animate-pulse text-muted-foreground">
                          Loading card controls...
                        </div>
                      </CardContent>
                    </Card>
                  ) : controls ? (
                    <CardControls 
                      controls={controls}
                      onUpdate={updateControls}
                    />
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        No controls configured for this card
                      </CardContent>
                    </Card>
                  )}
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

      {/* Card Customization Wizard */}
      <Sheet open={showWizard} onOpenChange={setShowWizard}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <CardCustomizationWizard
            onComplete={handleOrderCard}
            onCancel={() => setShowWizard(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Card Unboxing Experience */}
      <AnimatePresence>
        {isUnboxing && (
          <CardUnboxingExperience
            variant={cardVariant}
            cardHolder={cards[0]?.cardholder_name || demoCard.cardholder_name}
            cardNumber={cards[0]?.last4 || demoCard.last4}
            expiryDate={`${String(cards[0]?.exp_month || demoCard.exp_month).padStart(2, '0')}/${String(cards[0]?.exp_year || demoCard.exp_year).slice(-2)}`}
            onComplete={completeUnboxing}
            autoPlay={true}
          />
        )}
      </AnimatePresence>

      {/* Laser Engraving Preview */}
      <AnimatePresence>
        {showEngraving && (
          <LaserEngravingPreview
            name={(cards[0]?.cardholder_name || demoCard.cardholder_name).toUpperCase()}
            cardVariant={cardVariant}
            onComplete={() => setTimeout(() => setShowEngraving(false), 1500)}
            onClose={() => setShowEngraving(false)}
          />
        )}
      </AnimatePresence>

      {/* Card Inspection Mode - Portal */}
      {inspectionMode && createPortal(
        <CardInspectionMode isActive={inspectionMode} onClose={() => setInspectionMode(false)}>
          <PhysicalCreditCard
            variant={cardVariant}
            cardNumber={cards[0]?.last4 || demoCard.last4}
            cardHolder={cards[0]?.cardholder_name || demoCard.cardholder_name}
            expiryDate={`${String(cards[0]?.exp_month || demoCard.exp_month).padStart(2, '0')}/${String(cards[0]?.exp_year || demoCard.exp_year).slice(-2)}`}
            showDetails={true}
          />
        </CardInspectionMode>,
        document.body
      )}
    </div>
  );
}
