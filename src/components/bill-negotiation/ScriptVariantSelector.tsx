import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ScriptVariantCard } from "./ScriptVariantCard";
import { ScriptPreviewModal } from "./ScriptPreviewModal";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

interface ScriptVariantSelectorProps {
  merchant: string;
  amount: number;
  category?: string;
  leveragePoints?: string[];
  bloatItems?: Array<{ name: string; amount: number }>;
  competitorOffer?: any;
  negotiationScore?: number;
  contractEndDate?: string;
  customerTenure?: number;
  opportunityId?: string;
  onVariantSelected: (variant: 'aggressive' | 'friendly' | 'data_driven', scriptId: string) => void;
  onClose: () => void;
}

export function ScriptVariantSelector({
  merchant,
  amount,
  category,
  leveragePoints = [],
  bloatItems = [],
  competitorOffer,
  negotiationScore = 50,
  contractEndDate,
  customerTenure = 2,
  opportunityId,
  onVariantSelected,
  onClose,
}: ScriptVariantSelectorProps) {
  const [loading, setLoading] = useState(true);
  const [variants, setVariants] = useState<{
    aggressive: string;
    friendly: string;
    data_driven: string;
  } | null>(null);
  const [variantId, setVariantId] = useState<string>('');
  const [previewVariant, setPreviewVariant] = useState<'aggressive' | 'friendly' | 'data_driven' | null>(null);

  useEffect(() => {
    generateVariants();
  }, []);

  const generateVariants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-negotiation-script', {
        body: {
          merchant,
          amount,
          category,
          frequency: 'month',
          competitorOffer,
          leveragePoints,
          bloatItems,
          contractEndDate,
          customerTenure,
          generateVariants: true,
          opportunityId,
        },
      });

      if (error) throw error;
      
      setVariants(data.variants);
      setVariantId(data.variant_id);
      
      console.log(`Generated 3 scripts in ${data.generation_time_ms}ms`);
    } catch (error) {
      console.error('Error generating variants:', error);
      toast.error('Failed to generate script variants');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVariant = async (variant: 'aggressive' | 'friendly' | 'data_driven') => {
    try {
      // Update selection in database
      const { error } = await supabase
        .from('negotiation_script_variants')
        .update({
          selected_variant: variant,
          selected_at: new Date().toISOString(),
        })
        .eq('id', variantId);

      if (error) throw error;

      onVariantSelected(variant, variantId);
      toast.success(`${variant.toUpperCase().replace('_', '-')} script selected!`);
    } catch (error) {
      console.error('Error selecting variant:', error);
      toast.error('Failed to save selection');
    }
  };

  const calculateWinProbability = (style: 'aggressive' | 'friendly' | 'data_driven') => {
    const base = negotiationScore;
    
    // Adjust based on style and context
    if (style === 'aggressive') {
      // Higher win rate with competitor offers
      return competitorOffer ? Math.min(base + 15, 95) : base;
    } else if (style === 'friendly') {
      // Better with long tenure
      return customerTenure >= 3 ? Math.min(base + 10, 90) : Math.max(base - 5, 40);
    } else {
      // Data-driven works best with specific leverage
      return leveragePoints.length > 0 ? Math.min(base + 12, 92) : Math.max(base - 3, 45);
    }
  };

  if (loading || !variants) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="p-4 rounded-full bg-secondary/20"
        >
          <Sparkles className="w-12 h-12 text-foreground/40" />
        </motion.div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Generating Scripts...
          </h2>
          <p className="text-muted-foreground">
            Creating assertive, collaborative, and analytical approaches
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-muted/20 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">
          Choose Your <span className="text-accent">Negotiation Style</span>
        </h2>
        <p className="text-muted-foreground">
          Three AI-generated scripts tailored to different approaches
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ScriptVariantCard
          variant="aggressive"
          script={variants.aggressive}
          winProbability={calculateWinProbability('aggressive')}
          onPreview={() => setPreviewVariant('aggressive')}
          onSelect={() => handleSelectVariant('aggressive')}
        />
        
        <ScriptVariantCard
          variant="friendly"
          script={variants.friendly}
          winProbability={calculateWinProbability('friendly')}
          onPreview={() => setPreviewVariant('friendly')}
          onSelect={() => handleSelectVariant('friendly')}
        />
        
        <ScriptVariantCard
          variant="data_driven"
          script={variants.data_driven}
          winProbability={calculateWinProbability('data_driven')}
          onPreview={() => setPreviewVariant('data_driven')}
          onSelect={() => handleSelectVariant('data_driven')}
        />
      </div>

      {previewVariant && variants && (
        <ScriptPreviewModal
          open={previewVariant !== null}
          onOpenChange={(open) => !open && setPreviewVariant(null)}
          variant={previewVariant}
          script={variants[previewVariant]}
          merchant={merchant}
          amount={amount}
          onSelect={() => handleSelectVariant(previewVariant)}
        />
      )}
    </div>
  );
}
