import { useMemo } from 'react';

interface PortfolioItem {
  name: string;
  value: number;
}

interface DriftResult {
  hasDrift: boolean;
  driftPercent: number;
  affectedAssets: Array<{
    name: string;
    currentPercent: number;
    targetPercent: number;
    drift: number;
  }>;
}

// Default target allocation (60/40 stocks/bonds)
const DEFAULT_TARGET = {
  'brokerage': 60,
  'investment': 60,
  'bond': 30,
  'fixed': 30,
  'cash': 10,
  'crypto': 0,
};

export function useDriftDetection(
  portfolioData: PortfolioItem[],
  targetAllocation?: Record<string, number>
): DriftResult {
  return useMemo(() => {
    if (!portfolioData || portfolioData.length === 0) {
      return { hasDrift: false, driftPercent: 0, affectedAssets: [] };
    }

    const target = targetAllocation || DEFAULT_TARGET;
    const totalValue = portfolioData.reduce((sum, item) => sum + item.value, 0);
    
    if (totalValue === 0) {
      return { hasDrift: false, driftPercent: 0, affectedAssets: [] };
    }

    const affectedAssets: DriftResult['affectedAssets'] = [];
    let maxDrift = 0;

    portfolioData.forEach(item => {
      const currentPercent = (item.value / totalValue) * 100;
      const assetType = item.name.toLowerCase();
      
      // Find matching target category
      let targetPercent = 0;
      for (const [key, value] of Object.entries(target)) {
        if (assetType.includes(key)) {
          targetPercent = value;
          break;
        }
      }

      const drift = Math.abs(currentPercent - targetPercent);
      
      if (drift > 5) {
        affectedAssets.push({
          name: item.name,
          currentPercent,
          targetPercent,
          drift,
        });
        maxDrift = Math.max(maxDrift, drift);
      }
    });

    return {
      hasDrift: affectedAssets.length > 0,
      driftPercent: maxDrift,
      affectedAssets,
    };
  }, [portfolioData, targetAllocation]);
}
