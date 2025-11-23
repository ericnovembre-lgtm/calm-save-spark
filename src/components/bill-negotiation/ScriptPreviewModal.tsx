import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, User, Headphones, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface ScriptPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: 'aggressive' | 'friendly' | 'data_driven';
  script: string;
  merchant: string;
  amount: number;
  onSelect: () => void;
}

const variantTitles = {
  aggressive: '🔥 AGGRESSIVE',
  friendly: '🤝 FRIENDLY',
  data_driven: '📊 DATA-DRIVEN',
};

const variantColors = {
  aggressive: 'border-warning/30',
  friendly: 'border-success/30',
  data_driven: 'border-accent/30',
};

export function ScriptPreviewModal({
  open,
  onOpenChange,
  variant,
  script,
  merchant,
  amount,
  onSelect,
}: ScriptPreviewModalProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [typingComplete, setTypingComplete] = useState(false);

  useEffect(() => {
    if (open && script) {
      setDisplayedText("");
      setTypingComplete(false);
      
      let i = 0;
      const typewriterInterval = setInterval(() => {
        if (i < script.length) {
          setDisplayedText(script.slice(0, i + 1));
          i++;
        } else {
          setTypingComplete(true);
          clearInterval(typewriterInterval);
        }
      }, 10);

      return () => clearInterval(typewriterInterval);
    }
  }, [open, script]);

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script);
    toast.success('Script copied to clipboard!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-3xl max-h-[85vh] overflow-y-auto bg-background border-2 ${variantColors[variant]}`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Badge variant="secondary">
                {variantTitles[variant]}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span>{merchant}</span>
            </DialogTitle>
            <Badge variant="outline">
              ${amount}/mo
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Roleplay Interface */}
          {dialogue.map((line, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: line.speaker === 'user' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(idx * 0.05, 1) }}
              className={`flex gap-3 ${line.speaker === 'agent' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`p-2 rounded-full ${
                line.speaker === 'user' 
                  ? 'bg-secondary/30 border border-secondary' 
                  : 'bg-muted border border-border'
              }`}>
                {line.speaker === 'user' ? (
                  <User className="w-5 h-5 text-foreground/60" />
                ) : (
                  <Headphones className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              
              <div className={`flex-1 p-4 rounded-xl ${
                line.speaker === 'user'
                  ? 'bg-secondary/10 border border-secondary/20'
                  : 'bg-muted/30 border border-border'
              }`}>
                <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                  {line.speaker === 'user' ? 'You' : 'Agent'}
                </div>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {line.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="sm"
            disabled={!typingComplete}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button
            onClick={() => {
              onSelect();
              onOpenChange(false);
            }}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={!typingComplete}
          >
            <Check className="w-4 h-4 mr-2" />
            Select This Script
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
