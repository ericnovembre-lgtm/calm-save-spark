import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Loader2 } from "lucide-react";
import { AddressDetective } from "./AddressDetective";
import { SlideToConfirm } from "./SlideToConfirm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ParsedIntent {
  action: string;
  amount?: number;
  token?: string;
  recipient?: {
    name?: string;
    address?: string;
  };
}

interface SmartSendInterfaceProps {
  onSend: (data: ParsedIntent) => Promise<void>;
  onClose: () => void;
}

export function SmartSendInterface({ onSend, onClose }: SmartSendInterfaceProps) {
  const [input, setInput] = useState("");
  const [parsedIntent, setParsedIntent] = useState<ParsedIntent | null>(null);
  const [addressResult, setAddressResult] = useState<any>(null);
  const [contacts, setContacts] = useState<Array<{ name: string; address: string }>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const { data } = await supabase
      .from('wallet_contacts')
      .select('name, address')
      .limit(10);
    
    if (data) setContacts(data);
  };

  const analyzeInput = async (text: string) => {
    if (text.length < 5) {
      setParsedIntent(null);
      setAddressResult(null);
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('wallet-ai-assistant', {
        body: {
          action: 'parse_send',
          input: text,
          contacts: contacts,
        },
      });

      if (error) throw error;

      if (data.parsed) {
        setParsedIntent(data.parsed);
        
        // If raw address detected, run detective
        if (data.parsed.recipient?.address && data.parsed.recipient.address.startsWith('0x')) {
          const detectiveData = await supabase.functions.invoke('wallet-ai-assistant', {
            body: {
              action: 'detect_address',
              address: data.parsed.recipient.address,
            },
          });
          
          if (detectiveData.data) {
            setAddressResult(detectiveData.data);
          }
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (input) analyzeInput(input);
    }, 500);

    return () => clearTimeout(timer);
  }, [input]);

  const handleConfirm = async () => {
    if (!parsedIntent) return;

    try {
      await onSend(parsedIntent);
      toast({ title: "Transaction sent successfully!" });
      onClose();
    } catch (error) {
      toast({
        title: "Transaction failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const canProceed = parsedIntent && 
    parsedIntent.amount && 
    parsedIntent.recipient?.address &&
    !addressResult?.warning;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-4"
    >
      {/* Natural Language Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Describe your transaction
        </label>
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Try "Send 0.5 ETH to Mike" or paste an address...'
            className="w-full h-24 px-4 py-3 bg-card border-2 border-border rounded-xl focus:border-accent focus:outline-none resize-none text-foreground placeholder:text-muted-foreground"
          />
          {isAnalyzing && (
            <div className="absolute top-3 right-3">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          💡 AI will parse your intent and validate the recipient
        </p>
      </div>

      {/* Parsed Intent Preview */}
      <AnimatePresence>
        {parsedIntent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-accent/10 border-2 border-accent/30 rounded-xl p-4 space-y-2"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Send className="w-4 h-4" />
              <span>Detected Intent</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              {parsedIntent.amount && (
                <div>
                  <div className="text-muted-foreground">Amount</div>
                  <div className="font-bold text-foreground">
                    {parsedIntent.amount} {parsedIntent.token || 'ETH'}
                  </div>
                </div>
              )}
              
              {parsedIntent.recipient && (
                <div>
                  <div className="text-muted-foreground">Recipient</div>
                  <div className="font-mono text-xs text-foreground">
                    {parsedIntent.recipient.name || 
                     `${parsedIntent.recipient.address?.slice(0, 6)}...${parsedIntent.recipient.address?.slice(-4)}`}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address Detective */}
      <AnimatePresence>
        {addressResult && <AddressDetective result={addressResult} />}
      </AnimatePresence>

      {/* Contact Suggestions */}
      {contacts.length > 0 && !parsedIntent && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">Quick Send</div>
          <div className="flex flex-wrap gap-2">
            {contacts.slice(0, 4).map((contact, i) => (
              <button
                key={i}
                onClick={() => setInput(`Send to ${contact.name}`)}
                className="flex items-center gap-2 px-3 py-2 bg-muted/20 hover:bg-muted/30 rounded-lg text-sm transition-colors"
              >
                <User className="w-3 h-3" />
                <span>{contact.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Slide to Confirm */}
      {canProceed && !showConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:shadow-lg transition-shadow"
          >
            Review Transaction
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {showConfirm && canProceed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            <SlideToConfirm
              onConfirm={handleConfirm}
              label="Slide to Send Transaction"
            />
            <button
              onClick={() => setShowConfirm(false)}
              className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}