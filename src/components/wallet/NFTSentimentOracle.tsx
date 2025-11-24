import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NFT {
  id: number;
  name: string;
  collection: string;
  rarity: string;
  traits: string[];
  floorPrice: number;
  image?: string;
}

interface NFTSentiment {
  sentiment: 'hot' | 'neutral' | 'cold';
  sentimentEmoji: string;
  vibeCheck: string;
  marketTrend: string;
  holdOrSell: string;
}

const mockNFTs: NFT[] = [
  {
    id: 1,
    name: "Bored Ape #4521",
    collection: "BAYC",
    rarity: "Rare",
    traits: ["Gold Fur", "Laser Eyes"],
    floorPrice: 28.5,
    image: "🐵"
  },
  {
    id: 2,
    name: "Pudgy Penguin #1842",
    collection: "Pudgy Penguins",
    rarity: "Common",
    traits: ["Blue Background", "Fish"],
    floorPrice: 8.2,
    image: "🐧"
  },
  {
    id: 3,
    name: "Doodle #6721",
    collection: "Doodles",
    rarity: "Uncommon",
    traits: ["Rainbow Hair", "Pipe"],
    floorPrice: 3.4,
    image: "🌈"
  }
];

export function NFTSentimentOracle() {
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sentiment, setSentiment] = useState<NFTSentiment | null>(null);

  const analyzeNFT = async (nft: NFT) => {
    setSelectedNFT(nft);
    setIsAnalyzing(true);
    setSentiment(null);

    try {
      const { data, error } = await supabase.functions.invoke('wallet-ai-assistant', {
        body: { 
          action: 'nft_sentiment',
          nft: {
            name: nft.name,
            collection: nft.collection,
            rarity: nft.rarity,
            traits: nft.traits,
            floorPrice: nft.floorPrice
          }
        }
      });

      if (error) throw error;
      setSentiment(data);
    } catch (error) {
      console.error('Failed to analyze NFT:', error);
      toast.error('Failed to analyze NFT sentiment');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'hot': return 'text-red-500';
      case 'neutral': return 'text-yellow-500';
      case 'cold': return 'text-blue-500';
      default: return 'text-muted-foreground';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'hot': return TrendingUp;
      case 'neutral': return Minus;
      case 'cold': return TrendingDown;
      default: return Sparkles;
    }
  };

  return (
    <div className="space-y-6">
      {/* NFT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockNFTs.map((nft) => (
          <motion.div
            key={nft.id}
            whileHover={{ scale: 1.02 }}
            className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-4 space-y-3"
          >
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center text-6xl">
              {nft.image}
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground">{nft.name}</h4>
              <p className="text-sm text-muted-foreground">{nft.collection}</p>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Floor: Ξ{nft.floorPrice}</span>
              <span className={`px-2 py-1 rounded-full ${
                nft.rarity === 'Rare' ? 'bg-purple-500/20 text-purple-400' :
                nft.rarity === 'Uncommon' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {nft.rarity}
              </span>
            </div>

            <Button
              onClick={() => analyzeNFT(nft)}
              disabled={isAnalyzing && selectedNFT?.id === nft.id}
              size="sm"
              className="w-full gap-2"
            >
              {isAnalyzing && selectedNFT?.id === nft.id ? (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Vibe Check
                </>
              )}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Sentiment Analysis Result */}
      {sentiment && selectedNFT && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">NFT Sentiment Oracle</h3>
                <p className="text-sm text-muted-foreground">{selectedNFT.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(() => {
                const SentimentIcon = getSentimentIcon(sentiment.sentiment);
                return <SentimentIcon className={`w-5 h-5 ${getSentimentColor(sentiment.sentiment)}`} />;
              })()}
              <span className="text-2xl">{sentiment.sentimentEmoji}</span>
            </div>
          </div>

          {/* Vibe Check */}
          <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Vibe Check</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{sentiment.vibeCheck}</p>
          </div>

          {/* Market Trend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 bg-background/50 rounded-xl space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Market Trend</div>
              <p className="text-sm text-foreground">{sentiment.marketTrend}</p>
            </div>

            <div className="p-4 bg-background/50 rounded-xl space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Signal</div>
              <p className="text-sm font-medium text-foreground">{sentiment.holdOrSell}</p>
            </div>
          </div>

          {/* Traits */}
          <div className="flex flex-wrap gap-2">
            {selectedNFT.traits.map((trait, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary"
              >
                {trait}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
