import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Copy, User, Headphones, Sparkles, Target, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingState } from "@/components/LoadingState";

interface BillNegotiationScriptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant: string;
  amount: number;
  category?: string;
  competitorOffer?: any;
  leveragePoints?: string[];
  bloatItems?: Array<{ name: string; amount: number }>;
  contractEndDate?: string;
  customerTenure?: number;
  negotiationScore?: number;
}

export function BillNegotiationScriptDialog({
  open,
  onOpenChange,
  merchant,
  amount,
  category,
  competitorOffer,
  leveragePoints = [],
  bloatItems = [],
  contractEndDate,
  customerTenure = 2,
  negotiationScore = 50,
}: BillNegotiationScriptDialogProps) {
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [typingComplete, setTypingComplete] = useState(false);

  useEffect(() => {
    if (open && !script) {
      generateScript();
    }
  }, [open]);

  useEffect(() => {
    if (script && !typingComplete) {
      let i = 0;
      const typewriterInterval = setInterval(() => {
        if (i < script.length) {
          setDisplayedText(script.slice(0, i + 1));
          i++;
        } else {
          setTypingComplete(true);
          clearInterval(typewriterInterval);
        }
      }, 15);

      return () => clearInterval(typewriterInterval);
    }
  }, [script, typingComplete]);

  const generateScript = async () => {
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
        },
      });

      if (error) throw error;
      setScript(data.script);
    } catch (error) {
      console.error('Error generating script:', error);
      toast.error('Failed to generate script');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text?: string) => {
    const textToCopy = text || script;
    navigator.clipboard.writeText(textToCopy);
    toast.success('Copied to clipboard!');
  };

  const getOpeningLine = () => {
    if (!script) return '';
    const lines = script.split('\n');
    const firstYouLine = lines.find(line => line.trim().match(/^(You:|Customer:|User:)/i));
    return firstYouLine?.replace(/^(You:|Customer:|User:)/i, '').trim() || '';
  };

  const getLeverageBadge = () => {
    if (negotiationScore >= 70) return { text: 'HIGH LEVERAGE', color: 'bg-emerald-600' };
    if (negotiationScore >= 40) return { text: 'MEDIUM LEVERAGE', color: 'bg-amber-600' };
    return { text: 'BUILD LEVERAGE', color: 'bg-slate-600' };
  };

  const parseScript = (text: string) => {
    const lines = text.split('\n');
    const dialogue: Array<{ speaker: 'user' | 'agent'; text: string }> = [];
    let currentSpeaker: 'user' | 'agent' | null = null;
    let currentText = '';

    lines.forEach((line) => {
      if (line.match(/^(You:|Customer:|User:)/i)) {
        if (currentSpeaker && currentText) {
          dialogue.push({ speaker: currentSpeaker, text: currentText.trim() });
        }
        currentSpeaker = 'user';
        currentText = line.replace(/^(You:|Customer:|User:)/i, '').trim();
      } else if (line.match(/^(Agent:|Representative:|Rep:)/i)) {
        if (currentSpeaker && currentText) {
          dialogue.push({ speaker: currentSpeaker, text: currentText.trim() });
        }
        currentSpeaker = 'agent';
        currentText = line.replace(/^(Agent:|Representative:|Rep:)/i, '').trim();
      } else if (currentSpeaker && line.trim()) {
        currentText += ' ' + line.trim();
      }
    });

    if (currentSpeaker && currentText) {
      dialogue.push({ speaker: currentSpeaker, text: currentText.trim() });
    }

    return dialogue.length > 0 ? dialogue : [{ speaker: 'user' as const, text: displayedText }];
  };

  const dialogue = parseScript(displayedText);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-900 border-cyan-500/30">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              Negotiation Script: {merchant}
            </DialogTitle>
            <Badge className={`${getLeverageBadge().color} font-mono`}>
              {getLeverageBadge().text}
            </Badge>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className="border-cyan-500 text-cyan-400 font-mono">
              ${amount}/mo
            </Badge>
            {category && (
              <Badge variant="secondary">{category}</Badge>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <LoadingState variant="inline" />
        ) : (
          <div className="space-y-6 pt-4">
            {/* Tactical Brief */}
            {(leveragePoints.length > 0 || bloatItems.length > 0 || competitorOffer) && (
              <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Target className="w-4 h-4" />
                    TACTICAL BRIEF
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">WIN PROBABILITY:</span>
                    <Progress value={negotiationScore} className="w-20 h-2" />
                    <span className="text-sm font-mono text-cyan-400">{negotiationScore}%</span>
                  </div>
                </div>

                {competitorOffer && (
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      COMPETITOR LEVERAGE
                    </div>
                    <div className="text-sm text-foreground">
                      {competitorOffer.provider} offers {competitorOffer.speed || 'similar service'} for ${competitorOffer.monthly_price}/mo — ${(amount - competitorOffer.monthly_price).toFixed(0)} less
                    </div>
                  </div>
                )}

                {leveragePoints.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-muted-foreground">Your Leverage:</div>
                    {leveragePoints.map((point, idx) => (
                      <div key={idx} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-cyan-400">•</span>
                        {point}
                      </div>
                    ))}
                  </div>
                )}

                {bloatItems.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-muted-foreground">Removable Fees:</div>
                    {bloatItems.map((item, idx) => (
                      <div key={idx} className="text-sm text-emerald-400">
                        - {item.name}: ${item.amount}/mo
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Roleplay Interface */}
            <div className="space-y-4">
              {dialogue.map((line, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: line.speaker === 'user' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex gap-3 ${line.speaker === 'agent' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`p-2 rounded-full ${
                    line.speaker === 'user' 
                      ? 'bg-cyan-500/20 border border-cyan-500/50' 
                      : 'bg-slate-700/50 border border-slate-600'
                  }`}>
                    {line.speaker === 'user' ? (
                      <User className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <Headphones className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  
                  <div className={`flex-1 p-4 rounded-lg ${
                    line.speaker === 'user'
                      ? 'bg-cyan-950/30 border border-cyan-500/20'
                      : 'bg-slate-800/50 border border-slate-700'
                  }`}>
                    <div className="text-xs font-semibold text-muted-foreground mb-1">
                      {line.speaker === 'user' ? 'YOU' : 'AGENT'}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {line.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-slate-700">
              <Button
                onClick={() => copyToClipboard(getOpeningLine())}
                variant="outline"
                size="sm"
                disabled={!typingComplete}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Opening
              </Button>
              <Button
                onClick={() => copyToClipboard()}
                variant="outline"
                className="flex-1 border-cyan-500/50 hover:bg-cyan-950/30"
                disabled={!typingComplete}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Full Script
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-cyan-600 hover:bg-cyan-500"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
