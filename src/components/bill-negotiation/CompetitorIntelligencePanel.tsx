import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompetitorOfferCard } from "./CompetitorOfferCard";
import { CompetitorAlerts } from "./CompetitorAlerts";
import { PriceComparisonChart } from "./PriceComparisonChart";
import { Badge } from "@/components/ui/badge";
import { Zap, Wifi, Smartphone, Lightbulb, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CompetitorIntelligencePanelProps {
  opportunities: any[];
  onGenerateScript: (opportunity: any, competitorOffer?: any) => void;
}

export function CompetitorIntelligencePanel({ 
  opportunities, 
  onGenerateScript 
}: CompetitorIntelligencePanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("internet");

  const { data: competitorPricing, isLoading: pricingLoading } = useQuery({
    queryKey: ['competitor-pricing', selectedCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitor_pricing')
        .select('*')
        .eq('category', selectedCategory)
        .order('monthly_price', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: alerts } = useQuery({
    queryKey: ['competitor-alerts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('competitor_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const categoryIcons = {
    internet: Wifi,
    mobile: Smartphone,
    utilities: Lightbulb,
    streaming: Zap,
    insurance: Shield,
  };

  const CategoryIcon = categoryIcons[selectedCategory as keyof typeof categoryIcons] || Zap;

  // Find user's current provider in this category
  const userOpportunity = opportunities.find(o => 
    o.category?.toLowerCase() === selectedCategory
  );

  const unacknowledgedAlerts = alerts?.filter(a => !a.acknowledged).length || 0;

  const lastUpdated = competitorPricing && competitorPricing.length > 0 
    ? competitorPricing[0].last_updated 
    : null;

  return (
    <div className="space-y-6">
      {/* Header with Alerts Banner */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Competitor Intelligence</h2>
              <p className="text-sm text-muted-foreground">
                Real-time market pricing • Automatic deal detection
              </p>
            </div>
          </div>
          {unacknowledgedAlerts > 0 && (
            <Badge className="bg-amber-500 text-black font-bold px-4 py-2">
              {unacknowledgedAlerts} New Alert{unacknowledgedAlerts !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {lastUpdated && (
          <div className="text-xs text-muted-foreground">
            Last updated: {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
          </div>
        )}
      </div>

      {/* Alerts Section */}
      {unacknowledgedAlerts > 0 && (
        <div className="bg-amber-500/5 border-2 border-amber-500/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Active Alerts
          </h3>
          <CompetitorAlerts alerts={alerts || []} />
        </div>
      )}

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-5 w-full">
          {Object.keys(categoryIcons).map(cat => {
            const Icon = categoryIcons[cat as keyof typeof categoryIcons];
            return (
              <TabsTrigger key={cat} value={cat} className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="capitalize hidden sm:inline">{cat}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6 mt-6">
          {/* Price Comparison Chart */}
          {userOpportunity && competitorPricing && competitorPricing.length > 0 && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Price Comparison</h3>
              <PriceComparisonChart
                userPrice={Number(userOpportunity.current_amount)}
                userProvider={userOpportunity.merchant}
                competitors={competitorPricing.map(c => ({
                  provider: c.provider,
                  price: Number(c.monthly_price)
                }))}
              />
            </div>
          )}

          {/* Competitor Offers Grid */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <CategoryIcon className="w-5 h-5 text-cyan-400" />
              Top Offers in {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
            </h3>
            
            {pricingLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-slate-900 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : competitorPricing && competitorPricing.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {competitorPricing.slice(0, 6).map(offer => (
                  <CompetitorOfferCard
                    key={offer.id}
                    provider={offer.provider}
                    planName={offer.plan_name}
                    price={Number(offer.monthly_price)}
                    speed={offer.speed}
                    features={offer.features}
                    userCurrentPrice={userOpportunity ? Number(userOpportunity.current_amount) : null}
                    onGenerateScript={() => {
                      if (userOpportunity) {
                        onGenerateScript(userOpportunity, offer);
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No competitor data available for this category yet.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}