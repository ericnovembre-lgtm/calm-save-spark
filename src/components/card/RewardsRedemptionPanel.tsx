import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, CreditCard, Plane, History, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePointsRedemption } from '@/hooks/usePointsRedemption';
import { useCardTierStatus } from '@/hooks/useCardTierStatus';
import { RedemptionConfirmDialog } from './RedemptionConfirmDialog';
import { RedemptionHistoryList } from './RedemptionHistoryList';
import type { Database } from '@/integrations/supabase/types';

type RedemptionCatalog = Database['public']['Tables']['redemption_catalog']['Row'];

const partnerLogos: Record<string, string> = {
  'Amazon': '🛒',
  'Starbucks': '☕',
  'Target': '🎯',
  'TSA': '🛂',
};

export function RewardsRedemptionPanel() {
  const { catalog, history, isLoadingCatalog, redeem, isRedeeming } = usePointsRedemption();
  const { tierStatus, isLoading: tierLoading } = useCardTierStatus();
  const [selectedItem, setSelectedItem] = useState<RedemptionCatalog | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const totalPoints = tierStatus?.total_points || 0;

  const cashbackOptions = catalog.filter(item => item.redemption_type === 'cashback');
  const giftCardOptions = catalog.filter(item => item.redemption_type === 'gift_card');
  const travelOptions = catalog.filter(item => item.redemption_type === 'travel_credit');

  const handleRedeemClick = (item: RedemptionCatalog) => {
    setSelectedItem(item);
    setConfirmOpen(true);
  };

  const handleConfirmRedeem = () => {
    if (selectedItem) {
      redeem(selectedItem.id);
      setConfirmOpen(false);
      setSelectedItem(null);
    }
  };

  const RedemptionCard = ({ item }: { item: RedemptionCatalog }) => {
    const canAfford = totalPoints >= item.points_cost;
    const valuePerPoint = item.dollar_value / item.points_cost;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={`p-4 ${!canAfford ? 'opacity-50' : 'border-primary/20'}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="text-3xl">
                {item.partner_name ? partnerLogos[item.partner_name] || '🎁' : 
                 item.redemption_type === 'cashback' ? '💵' : 
                 item.redemption_type === 'travel_credit' ? '✈️' : '🎁'}
              </div>
              <div>
                <h4 className="font-semibold">{item.name}</h4>
                {item.partner_name && (
                  <p className="text-xs text-muted-foreground">{item.partner_name}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">${item.dollar_value}</p>
              <p className="text-xs text-muted-foreground">{item.points_cost.toLocaleString()} pts</p>
            </div>
          </div>

          {item.description && (
            <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {valuePerPoint.toFixed(3)}¢ per point
            </div>
            <Button
              onClick={() => handleRedeemClick(item)}
              disabled={!canAfford || isRedeeming}
              size="sm"
              className="gap-2"
            >
              <Sparkles className="w-3 h-3" />
              Redeem
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Points Balance */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Available Points</p>
            <p className="text-4xl font-bold">{totalPoints.toLocaleString()}</p>
            {tierStatus && (
              <p className="text-sm text-muted-foreground mt-1">
                {tierStatus.current_tier.replace('_', ' ').toUpperCase()} tier active
              </p>
            )}
          </div>
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Gift className="w-8 h-8 text-primary" />
          </div>
        </div>
      </Card>

      {/* Redemption Options */}
      <Tabs defaultValue="cashback" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cashback" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Cashback
          </TabsTrigger>
          <TabsTrigger value="gift-cards" className="gap-2">
            <Gift className="w-4 h-4" />
            Gift Cards
          </TabsTrigger>
          <TabsTrigger value="travel" className="gap-2">
            <Plane className="w-4 h-4" />
            Travel
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cashback" className="mt-6">
          {isLoadingCatalog ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="h-20 bg-muted rounded" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cashbackOptions.map(item => (
                <RedemptionCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="gift-cards" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {giftCardOptions.map(item => (
              <RedemptionCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="travel" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {travelOptions.map(item => (
              <RedemptionCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <RedemptionHistoryList history={history} />
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      {selectedItem && (
        <RedemptionConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          item={selectedItem}
          currentPoints={totalPoints}
          onConfirm={handleConfirmRedeem}
          isRedeeming={isRedeeming}
        />
      )}
    </div>
  );
}
