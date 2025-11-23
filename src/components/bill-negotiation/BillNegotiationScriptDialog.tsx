import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, User, Headphones, Sparkles } from "lucide-react";
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
}

export function BillNegotiationScriptDialog({
  open,
  onOpenChange,
  merchant,
  amount,
  category,
  competitorOffer,
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script);
    toast.success('Script copied to clipboard!');
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
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            Negotiation Script: {merchant}
          </DialogTitle>
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className="border-cyan-500 text-cyan-400 font-mono">
              ${amount}/mo
            </Badge>
            {category && (
              <Badge variant="secondary">{category}</Badge>
            )}
          </div>
          {competitorOffer && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-amber-400 font-bold">⚡ Leverage:</span>
                <span className="text-foreground">{competitorOffer.provider} offers {competitorOffer.speed} for ${competitorOffer.monthly_price}/mo</span>
              </div>
            </div>
          )}
        </DialogHeader>

        {loading ? (
          <LoadingState variant="inline" />
        ) : (
          <div className="space-y-6 pt-4">
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
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <Button
                onClick={copyToClipboard}
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
