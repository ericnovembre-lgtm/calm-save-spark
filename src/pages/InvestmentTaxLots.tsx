import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Receipt, Scissors, TrendingDown } from "lucide-react";
import { useTaxLots, useHarvestQueue } from "@/hooks/useTaxLots";
import { TaxLotCard } from "@/components/tax-lots/TaxLotCard";
import { TaxLotSummary } from "@/components/tax-lots/TaxLotSummary";
import { AddTaxLotModal } from "@/components/tax-lots/AddTaxLotModal";

export default function InvestmentTaxLots() {
  const {
    taxLots,
    lotsBySymbol,
    analytics,
    isLoading,
    createTaxLot,
    isCreating,
    deleteTaxLot,
  } = useTaxLots();

  const { addToQueue, isAdding } = useHarvestQueue();

  const handleHarvest = (lot: any) => {
    addToQueue({
      tax_lot_id: lot.id,
      action_type: 'harvest',
      estimated_tax_savings: Math.abs(lot.unrealized_gain_loss || 0) * 0.25, // Rough estimate
    });
  };

  const symbols = Object.keys(lotsBySymbol).sort();

  return (
    <AppLayout>
      <div className="container max-w-5xl py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Investment Tax Lots</h1>
            <p className="text-muted-foreground">Track cost basis and optimize tax harvesting</p>
          </div>
          <AddTaxLotModal onAddLot={createTaxLot} isAdding={isCreating} />
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : taxLots.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No Tax Lots Yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your investment purchases to track cost basis and tax implications
              </p>
              <AddTaxLotModal onAddLot={createTaxLot} isAdding={isCreating} />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Stats */}
            <TaxLotSummary analytics={analytics} />
            
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Lots ({taxLots.length})</TabsTrigger>
                <TabsTrigger value="by-symbol">By Symbol ({symbols.length})</TabsTrigger>
                <TabsTrigger value="harvest">
                  <Scissors className="w-4 h-4 mr-1" />
                  Harvest ({analytics.harvestCandidates.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                <div className="grid gap-4">
                  {taxLots.filter(l => !l.is_sold).map(lot => (
                    <TaxLotCard
                      key={lot.id}
                      lot={lot}
                      onDelete={deleteTaxLot}
                      onHarvest={handleHarvest}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="by-symbol" className="space-y-6">
                {symbols.map(symbol => {
                  const lots = lotsBySymbol[symbol].filter(l => !l.is_sold);
                  if (lots.length === 0) return null;
                  
                  const totalValue = lots.reduce((sum, l) => sum + (l.current_price || l.purchase_price) * l.quantity, 0);
                  const totalCost = lots.reduce((sum, l) => sum + l.cost_basis, 0);
                  const totalGain = totalValue - totalCost;
                  
                  return (
                    <Card key={symbol} className="bg-card border-border">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">{symbol}</CardTitle>
                          <div className={`text-right ${totalGain >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            <p className="font-semibold">
                              {totalGain >= 0 ? '+' : ''}${totalGain.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {lots.length} lot{lots.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {lots.map(lot => (
                          <TaxLotCard
                            key={lot.id}
                            lot={lot}
                            onDelete={deleteTaxLot}
                            onHarvest={handleHarvest}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
              
              <TabsContent value="harvest" className="space-y-4">
                {analytics.harvestCandidates.length === 0 ? (
                  <Card className="bg-card border-border">
                    <CardContent className="py-12 text-center">
                      <TrendingDown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">No Harvest Candidates</h3>
                      <p className="text-muted-foreground">
                        All your positions are in the green! No tax-loss harvesting opportunities.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {analytics.harvestCandidates.map(lot => (
                      <TaxLotCard
                        key={lot.id}
                        lot={lot}
                        onDelete={deleteTaxLot}
                        onHarvest={handleHarvest}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  );
}
