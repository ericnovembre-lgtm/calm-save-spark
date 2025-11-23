import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AssetIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetSymbol: string;
  assetName: string;
  currentValue: number;
}

interface AssetAnalysis {
  bullCase: string;
  bearCase: string;
  riskRating: 'Low' | 'Medium' | 'High' | 'Very High';
  riskExplanation: string;
  marketData?: {
    price: number;
    change: number;
    marketCap?: string;
  };
  timestamp: string;
}

export function AssetIntelligenceModal({
  isOpen,
  onClose,
  assetSymbol,
  assetName,
  currentValue,
}: AssetIntelligenceModalProps) {
  const [analysis, setAnalysis] = useState<AssetAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [displayedBullText, setDisplayedBullText] = useState('');
  const [displayedBearText, setDisplayedBearText] = useState('');

  useEffect(() => {
    if (isOpen && assetSymbol) {
      fetchAnalysis();
    }
  }, [isOpen, assetSymbol]);

  // Typewriter effect for bull case
  useEffect(() => {
    if (analysis?.bullCase && displayedBullText.length < analysis.bullCase.length) {
      const timer = setTimeout(() => {
        setDisplayedBullText(analysis.bullCase.slice(0, displayedBullText.length + 1));
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [analysis?.bullCase, displayedBullText]);

  // Typewriter effect for bear case
  useEffect(() => {
    if (analysis?.bearCase && displayedBearText.length < analysis.bearCase.length) {
      const timer = setTimeout(() => {
        setDisplayedBearText(analysis.bearCase.slice(0, displayedBearText.length + 1));
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [analysis?.bearCase, displayedBearText]);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    setDisplayedBullText('');
    setDisplayedBearText('');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-asset`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            symbol: assetSymbol,
            name: assetName,
            currentValue,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to analyze asset');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      toast.error('Failed to generate asset analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (rating: string) => {
    switch (rating) {
      case 'Low': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'High': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Very High': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{assetName}</h3>
                <p className="text-sm text-muted-foreground font-normal">
                  AI Asset Intelligence
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchAnalysis}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-8">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
          </div>
        ) : analysis ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Market Data */}
            {analysis.marketData && (
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Current Value</p>
                  <p className="text-2xl font-bold">${currentValue.toLocaleString()}</p>
                </div>
                {analysis.marketData.price && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Price</p>
                    <p className="text-2xl font-bold">${analysis.marketData.price.toFixed(2)}</p>
                  </div>
                )}
                {analysis.marketData.change !== undefined && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">24h Change</p>
                    <p className={`text-2xl font-bold ${analysis.marketData.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {analysis.marketData.change >= 0 ? '+' : ''}{analysis.marketData.change.toFixed(2)}%
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Analysis Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Bull Case */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <h4 className="font-semibold text-green-500">Bull Case</h4>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {displayedBullText}
                  {displayedBullText.length < analysis.bullCase.length && (
                    <span className="animate-pulse">▊</span>
                  )}
                </p>
              </motion.div>

              {/* Bear Case */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-xl bg-gradient-to-br from-red-500/10 to-rose-500/5 border border-red-500/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <h4 className="font-semibold text-red-500">Bear Case</h4>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {displayedBearText}
                  {displayedBearText.length < analysis.bearCase.length && (
                    <span className="animate-pulse">▊</span>
                  )}
                </p>
              </motion.div>
            </div>

            {/* Risk Rating */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h4 className="font-semibold text-amber-500">Risk Assessment</h4>
                <Badge className={getRiskColor(analysis.riskRating)}>
                  {analysis.riskRating}
                </Badge>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {analysis.riskExplanation}
              </p>
            </motion.div>

            {/* Disclaimer */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Analysis generated at {new Date(analysis.timestamp).toLocaleString()} • 
                This is AI-generated analysis and not financial advice
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No analysis available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
