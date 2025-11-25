import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBenefitHunter } from '@/hooks/useBenefitHunter';
import { BenefitHunterCard } from './BenefitHunterCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BenefitMatch } from '@/hooks/useBenefitHunter';
import { Sparkles, RefreshCw, Plane, ShoppingBag, Heart, Shield } from 'lucide-react';

export const BenefitHunterPanel = () => {
  const { matches, isLoading, scanForBenefits, isScanning, activateBenefit, dismissBenefit } = useBenefitHunter();
  const [selectedBenefit, setSelectedBenefit] = useState<BenefitMatch | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredMatches = categoryFilter === 'all' 
    ? matches 
    : matches.filter(m => m.benefit.benefit_category === categoryFilter);

  const categories = [
    { value: 'all', label: 'All', icon: Sparkles },
    { value: 'travel', label: 'Travel', icon: Plane },
    { value: 'purchase', label: 'Purchase', icon: ShoppingBag },
    { value: 'lifestyle', label: 'Lifestyle', icon: Heart },
    { value: 'protection', label: 'Protection', icon: Shield },
  ];

  const getCategoryCount = (category: string) => {
    if (category === 'all') return matches.length;
    return matches.filter(m => m.benefit.benefit_category === category).length;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Benefit Hunter
              </CardTitle>
              <CardDescription>
                Unused perks and benefits from your recent card activity
              </CardDescription>
            </div>
            <Button
              onClick={() => scanForBenefits()}
              disabled={isScanning}
              size="sm"
              variant="outline"
            >
              {isScanning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Scan Now
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              {categories.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value} className="gap-2 relative">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                  {getCategoryCount(value) > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {getCategoryCount(value)}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(({ value }) => (
              <TabsContent key={value} value={value} className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredMatches.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Card className="bg-muted/50">
                        <CardContent className="pt-6">
                          <div className="text-center py-8">
                            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="font-semibold mb-2">No Benefits Found</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              {categoryFilter === 'all' 
                                ? 'Keep using your card to unlock personalized perks!'
                                : `No ${value} benefits detected yet.`}
                            </p>
                            <Button
                              onClick={() => scanForBenefits()}
                              disabled={isScanning}
                              variant="outline"
                              size="sm"
                            >
                              Scan for Benefits
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    filteredMatches.map((match) => (
                      <BenefitHunterCard
                        key={match.id}
                        match={match}
                        onActivate={activateBenefit}
                        onDismiss={dismissBenefit}
                        onViewDetails={setSelectedBenefit}
                      />
                    ))
                  )}
                </AnimatePresence>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Benefit Details Modal */}
      <Dialog open={!!selectedBenefit} onOpenChange={() => setSelectedBenefit(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedBenefit?.benefit.benefit_name}</DialogTitle>
            <DialogDescription>{selectedBenefit?.benefit.description}</DialogDescription>
          </DialogHeader>

          {selectedBenefit && (
            <div className="space-y-4">
              {selectedBenefit.benefit.fine_print && (
                <div>
                  <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedBenefit.benefit.fine_print}
                  </p>
                </div>
              )}

              {selectedBenefit.transaction && (
                <div>
                  <h4 className="font-semibold mb-2">Triggering Transaction</h4>
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{selectedBenefit.transaction.merchant_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedBenefit.transaction.transaction_date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ${Math.abs(selectedBenefit.transaction.amount_cents) / 100}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="flex gap-2">
                {selectedBenefit.benefit.activation_required && selectedBenefit.benefit.activation_url ? (
                  <Button
                    onClick={() => {
                      window.open(selectedBenefit.benefit.activation_url!, '_blank');
                      activateBenefit(selectedBenefit.id);
                      setSelectedBenefit(null);
                    }}
                    className="flex-1"
                  >
                    Activate Benefit
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      activateBenefit(selectedBenefit.id);
                      setSelectedBenefit(null);
                    }}
                    className="flex-1"
                  >
                    Mark as Used
                  </Button>
                )}
                <Button
                  onClick={() => {
                    dismissBenefit(selectedBenefit.id);
                    setSelectedBenefit(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
