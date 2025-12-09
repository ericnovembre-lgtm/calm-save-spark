import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

interface NetWorthHeroProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  changeFromPrevious: number;
  changePercentage: number;
}

export function NetWorthHero({ 
  netWorth, 
  totalAssets, 
  totalLiabilities,
  changeFromPrevious,
  changePercentage 
}: NetWorthHeroProps) {
  const isPositive = netWorth >= 0;
  const TrendIcon = changeFromPrevious > 0 ? TrendingUp : changeFromPrevious < 0 ? TrendingDown : Minus;
  const trendColor = changeFromPrevious > 0 ? 'text-green-500' : changeFromPrevious < 0 ? 'text-red-500' : 'text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      data-copilot-id="net-worth-hero"
    >
      <Card className={`bg-gradient-to-br ${isPositive ? 'from-green-500/10 via-background to-emerald-500/5 border-green-500/20' : 'from-red-500/10 via-background to-rose-500/5 border-red-500/20'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${isPositive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <Wallet className={`w-6 h-6 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Net Worth</h2>
                <p className="text-sm text-muted-foreground">
                  Your total financial position
                </p>
              </div>
            </div>
            {changeFromPrevious !== 0 && (
              <div className={`flex items-center gap-1 ${trendColor}`}>
                <TrendIcon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {changeFromPrevious > 0 ? '+' : ''}
                  ${Math.abs(changeFromPrevious).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  <span className="text-xs ml-1">
                    ({changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(1)}%)
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Net Worth */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Net Worth</p>
              <p className={`text-4xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {netWorth < 0 ? '-' : ''}$<CountUp end={Math.abs(netWorth)} decimals={0} duration={1.2} separator="," />
              </p>
            </div>

            {/* Total Assets */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                Total Assets
              </p>
              <p className="text-2xl font-semibold text-green-500">
                $<CountUp end={totalAssets} decimals={0} duration={1} separator="," />
              </p>
            </div>

            {/* Total Liabilities */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                Total Liabilities
              </p>
              <p className="text-2xl font-semibold text-red-500">
                $<CountUp end={totalLiabilities} decimals={0} duration={1} separator="," />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
