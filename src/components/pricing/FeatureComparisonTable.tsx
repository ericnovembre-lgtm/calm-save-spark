import { Check, X, Star } from "lucide-react";
import { FREEMIUM_FEATURE_ORDER } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTierForAmount, PRICING_TIERS } from "./TierBadge";

interface FeatureComparisonTableProps {
  selectedAmount?: number;
}

export default function FeatureComparisonTable({ 
  selectedAmount = 0 
}: FeatureComparisonTableProps) {
  // Define key price points to show in columns (0, 4, 8, 13, 17, 20)
  const pricePoints = [0, 4, 8, 13, 17, 20];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Feature Comparison by Tier
          <Badge variant="outline" className="ml-auto">
            {FREEMIUM_FEATURE_ORDER.length} Total Features
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] sticky left-0 bg-background z-10">
                  Feature
                </TableHead>
                {pricePoints.map((price) => {
                  const tier = getTierForAmount(price);
                  const isRecommended = price === 8;
                  const isSelected = selectedAmount === price;
                  
                  return (
                    <TableHead 
                      key={price} 
                      className={`text-center min-w-[100px] ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className="font-bold">${price}</div>
                        <div className="text-xs font-normal flex items-center gap-1">
                          {tier.icon}
                          {tier.name}
                        </div>
                        {isRecommended && (
                          <Badge 
                            variant="default" 
                            className="text-[10px] px-1.5 py-0 mt-1 bg-primary text-primary-foreground"
                          >
                            <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />
                            Popular
                          </Badge>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {FREEMIUM_FEATURE_ORDER.map((feature, index) => {
                const unlockPrice = index + 1;
                const isSelectedFeature = index < selectedAmount;
                
                return (
                  <TableRow 
                    key={feature.key}
                    className={isSelectedFeature ? 'bg-primary/5' : ''}
                  >
                    <TableCell className="sticky left-0 bg-background font-medium">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className="text-xs font-normal"
                        >
                          ${unlockPrice}
                        </Badge>
                        <div>
                          <div className="font-medium text-sm">
                            {feature.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {feature.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    {pricePoints.map((price) => {
                      const isUnlocked = unlockPrice <= price;
                      const isSelected = selectedAmount === price;
                      
                      return (
                        <TableCell 
                          key={price} 
                          className={`text-center ${
                            isSelected ? 'bg-primary/5' : ''
                          }`}
                        >
                          {isUnlocked ? (
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Included</span>
            </div>
            <div className="flex items-center gap-2">
              <X className="w-4 h-4 text-muted-foreground/30" />
              <span>Not included</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary fill-current" />
              <span>Most popular tier</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
