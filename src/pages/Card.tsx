import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Plus, Activity, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardDisplay } from '@/components/card/CardDisplay';
import { AccountSummary } from '@/components/card/AccountSummary';
import { TransactionList } from '@/components/card/TransactionList';
import { CardControls } from '@/components/card/CardControls';
import { CardRewardsDashboard } from '@/components/card/CardRewardsDashboard';
import { useCardAccount } from '@/hooks/useCardAccount';
import { useCards } from '@/hooks/useCards';
import { useCardTransactions } from '@/hooks/useCardTransactions';
import { motion } from 'framer-motion';

export default function CardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const { account, isLoading: accountLoading, hasAccount } = useCardAccount();
  const { cards, isLoading: cardsLoading, freezeCard } = useCards(account?.id);
  const { transactions, isLoading: transactionsLoading } = useCardTransactions(account?.id);

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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>$ave+ Credit Cards</CardTitle>
                <CardDescription>Manage your cards and transactions</CardDescription>
              </div>
            </div>
            <Link to="/card/apply">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Apply for Card
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Account Summary */}
          <AccountSummary account={account} />

          {/* Cards */}
          {cardsLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading cards...
            </div>
          ) : cards.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <CreditCard className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">No Cards Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Request your first card to start using your account
                  </p>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Request Physical Card
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cards.map((card) => (
                <CardDisplay
                  key={card.id}
                  card={card}
                  onFreeze={handleFreezeCard}
                />
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm">View Activity</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">Statements</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-sm">Make Payment</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          {cards.length > 0 && (
            <CardRewardsDashboard cardId={cards[0].id} />
          )}
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionList
            transactions={transactions}
            isLoading={transactionsLoading}
          />
        </TabsContent>

        <TabsContent value="controls">
          {account && cards.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {cards.map((card) => (
                <Card key={card.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Card ending in {card.last4}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDisplay card={card} onFreeze={handleFreezeCard} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
