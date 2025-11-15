import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Building2, Palette, Shield, ExternalLink, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const partners = [
  {
    id: "yieldstreet",
    name: "Yieldstreet",
    category: "Private Credit",
    logo: "🏛️",
    minInvestment: 10000,
    expectedReturn: "8-12%",
    status: "active",
    description: "Access institutional-grade private credit opportunities with lower minimums",
    features: ["Diversified debt funds", "Quarterly distributions", "1-3 year terms"]
  },
  {
    id: "masterworks",
    name: "Masterworks",
    category: "Tokenized Art",
    logo: "🎨",
    minInvestment: 15000,
    expectedReturn: "10-15%",
    status: "active",
    description: "Invest in fractional shares of multi-million dollar contemporary artworks",
    features: ["Blue-chip artists", "SEC-qualified offerings", "3-10 year hold"]
  },
  {
    id: "fundrise",
    name: "Fundrise",
    category: "Real Estate",
    logo: "🏢",
    minInvestment: 500,
    expectedReturn: "7-9%",
    status: "active",
    description: "Diversified real estate investment with low minimums",
    features: ["Commercial & residential", "Quarterly dividends", "5+ year horizon"]
  }
];

const opportunities = [
  {
    id: "1",
    name: "Senior Secured Debt Fund Q1 2026",
    partner: "Yieldstreet",
    category: "Private Credit",
    minInvestment: 10000,
    targetReturn: "9.5%",
    term: "24 months",
    riskRating: "Medium",
    spotsAvailable: 12,
    description: "Senior secured loans to established businesses with strong cash flows"
  },
  {
    id: "2",
    name: "Contemporary Art Collection III",
    partner: "Masterworks",
    category: "Tokenized Art",
    minInvestment: 20000,
    targetReturn: "12%",
    term: "5-7 years",
    riskRating: "Medium-High",
    spotsAvailable: 8,
    description: "Fractional ownership of works by Banksy, Kaws, and Basquiat"
  },
  {
    id: "3",
    name: "Multi-Family REIT Portfolio",
    partner: "Fundrise",
    category: "Real Estate",
    minInvestment: 1000,
    targetReturn: "8.2%",
    term: "5 years",
    riskRating: "Medium",
    spotsAvailable: 50,
    description: "Diversified portfolio of Class A apartment buildings in growth markets"
  }
];

export default function AlternativesPortal() {
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConnect = (partnerId: string) => {
    toast({
      title: "Connection Request Sent",
      description: `Your request to connect with ${partners.find(p => p.id === partnerId)?.name} has been sent. You'll receive an email within 24 hours.`,
    });
  };

  const handleInvest = (opportunityId: string) => {
    toast({
      title: "Investment Intent Recorded",
      description: "Our team will contact you within 1 business day to complete the accreditation and investment process.",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-display font-bold text-foreground">
              Democratized Alternatives Portal
            </h1>
          </div>
          <p className="text-muted-foreground">
            Access institutional-grade alternative investments traditionally reserved for the ultra-wealthy
          </p>
        </div>

        {/* Info Banner */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Accredited Investor Verification Required</h3>
                <p className="text-sm text-muted-foreground">
                  To invest in these opportunities, you must meet SEC accredited investor criteria: 
                  $200K+ annual income (or $300K+ joint) for the last 2 years, or $1M+ net worth (excluding primary residence).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="partners" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="partners">Partner Platforms</TabsTrigger>
            <TabsTrigger value="opportunities">Current Opportunities</TabsTrigger>
          </TabsList>

          <TabsContent value="partners" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partners.map((partner) => (
                <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{partner.logo}</div>
                        <div>
                          <CardTitle className="text-xl">{partner.name}</CardTitle>
                          <CardDescription>{partner.category}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={partner.status === "active" ? "default" : "secondary"}>
                        {partner.status === "active" ? "Active" : "Coming Soon"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{partner.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Min. Investment:</span>
                        <span className="font-semibold">${partner.minInvestment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Expected Return:</span>
                        <span className="font-semibold text-green-600">{partner.expectedReturn}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Features</p>
                      {partner.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => handleConnect(partner.id)}
                      disabled={partner.status !== "active"}
                    >
                      {partner.status === "active" ? "Connect Account" : "Notify When Available"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 gap-4">
              {opportunities.map((opp) => (
                <Card key={opp.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{opp.name}</CardTitle>
                        <CardDescription>via {opp.partner} • {opp.category}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{opp.spotsAvailable} spots left</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{opp.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Target Return</p>
                        <p className="text-lg font-bold text-green-600">{opp.targetReturn}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Term</p>
                        <p className="text-lg font-semibold">{opp.term}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
                        <Badge variant={opp.riskRating.includes("High") ? "destructive" : "secondary"}>
                          {opp.riskRating}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Minimum</p>
                        <p className="text-lg font-semibold">${opp.minInvestment.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button className="flex-1" onClick={() => handleInvest(opp.id)}>
                        Express Interest
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Educational Section */}
        <Card>
          <CardHeader>
            <CardTitle>Why Alternative Investments?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Diversification
                </h4>
                <p className="text-sm text-muted-foreground">
                  Low correlation with public markets provides portfolio stability during volatility
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Higher Returns
                </h4>
                <p className="text-sm text-muted-foreground">
                  Access to institutional deals with potential for superior risk-adjusted returns
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Unique Exposure
                </h4>
                <p className="text-sm text-muted-foreground">
                  Invest in asset classes unavailable through traditional brokerages
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
