import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Star } from 'lucide-react';
import { FREEMIUM_FEATURE_ORDER, FREE_FEATURE_INDICES } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getTierForAmount, PRICING_TIERS } from '../TierBadge';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface AnimatedFeatureTableProps {
  selectedAmount?: number;
}

export default function AnimatedFeatureTable({
  selectedAmount = 0,
}: AnimatedFeatureTableProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const { opacity, y } = useScrollAnimation(tableRef);

  const pricePoints = [0, 4, 8, 13, 17, 20];

  return (
    <motion.div
      ref={tableRef}
      style={prefersReducedMotion ? {} : { opacity, y }}
    >
      <Card className="backdrop-blur-sm bg-background/95 border-primary/10">
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
                    const isHovered = hoveredColumn === price;

                    return (
                      <TableHead
                        key={price}
                        className={`
                          text-center min-w-[100px] transition-all duration-300
                          ${isSelected ? 'bg-primary/10 scale-105' : ''}
                          ${isHovered && !isSelected ? 'bg-primary/5' : ''}
                        `}
                        onMouseEnter={() => !prefersReducedMotion && setHoveredColumn(price)}
                        onMouseLeave={() => setHoveredColumn(null)}
                      >
                        <motion.div
                          className="flex flex-col items-center gap-1"
                          animate={!prefersReducedMotion && (isHovered || isSelected) ? {
                            scale: 1.05,
                            y: -2,
                          } : {}}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                          <div className="font-bold">${price}</div>
                          <div className="text-xs font-normal flex items-center gap-1">
                            {tier.icon}
                            {tier.name}
                          </div>
                          {isRecommended && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.5, type: 'spring' }}
                            >
                              <Badge
                                variant="default"
                                className="text-[10px] px-1.5 py-0 mt-1"
                              >
                                <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />
                                Popular
                              </Badge>
                            </motion.div>
                          )}
                        </motion.div>
                        
                        {/* Animated border for selected column */}
                        {isSelected && !prefersReducedMotion && (
                          <motion.div
                            className="absolute inset-0 border-t-2 border-primary pointer-events-none"
                            layoutId="selectedColumn"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {FREEMIUM_FEATURE_ORDER.map((feature, index) => {
                  const isFreeFeature = (FREE_FEATURE_INDICES as readonly number[]).includes(index);
                  const unlockPrice = isFreeFeature ? 0 : index + 1;
                  const isSelectedFeature = selectedAmount >= unlockPrice;

                  return (
                    <motion.tr
                      key={feature.key}
                      className={`
                        transition-all duration-300
                        ${isSelectedFeature ? 'bg-primary/5' : ''}
                        ${hoveredColumn !== null ? 'hover:bg-primary/5' : ''}
                      `}
                      initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <TableCell className="sticky left-0 bg-background font-medium">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs font-normal ${isFreeFeature ? 'bg-primary/10' : ''}`}
                          >
                            {isFreeFeature ? 'FREE' : `$${unlockPrice}`}
                          </Badge>
                          <div>
                            <div className="font-medium text-sm">{feature.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {feature.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      {pricePoints.map((price) => {
                        const isUnlocked = price >= unlockPrice;
                        const isInHoveredColumn = hoveredColumn === price;

                        return (
                          <TableCell
                            key={price}
                            className={`
                              text-center transition-all duration-300
                              ${isInHoveredColumn && !prefersReducedMotion ? 'bg-primary/10' : ''}
                            `}
                          >
                            {isUnlocked ? (
                              <motion.div
                                initial={prefersReducedMotion ? {} : { scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                  type: 'spring',
                                  stiffness: 300,
                                  damping: 20,
                                  delay: index * 0.01,
                                }}
                                whileHover={!prefersReducedMotion ? {
                                  scale: 1.3,
                                  rotate: 360,
                                } : {}}
                              >
                                <Check className="w-5 h-5 text-primary mx-auto" />
                              </motion.div>
                            ) : (
                              <motion.div
                                animate={isInHoveredColumn && !prefersReducedMotion ? {
                                  x: [-2, 2, -2],
                                } : {}}
                                transition={{
                                  duration: 0.3,
                                  repeat: isInHoveredColumn ? 2 : 0,
                                }}
                              >
                                <X className="w-5 h-5 text-muted-foreground mx-auto opacity-30" />
                              </motion.div>
                            )}
                          </TableCell>
                        );
                      })}
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 py-4 border-t bg-muted/30 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Included</span>
            </div>
            <div className="flex items-center gap-2">
              <X className="w-4 h-4 text-muted-foreground opacity-30" />
              <span>Not included</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span>Most popular tier</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
