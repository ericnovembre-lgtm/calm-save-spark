import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Loader2, X, RefreshCcw } from "lucide-react";
import { AddressDetective } from "./AddressDetective";
import { SlideToConfirm } from "./SlideToConfirm";
import { RecentContacts } from "./RecentContacts";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ParsedIntent {
  type: 'SEND' | 'SWAP';
  action: string;
  amount?: number;
  token?: string;
  fromToken?: string;
  toToken?: string;
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDraft, setShowDraft] = useState(false);
  const { toast } = useToast();

  const handleDraft = async () => {
    if (!input.trim() || input.length < 5) {
      toast({
        title: "Input too short",
        description: "Please describe your transaction in more detail",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setShowDraft(false);
    setParsedIntent(null);
    setAddressResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('wallet-ai-assistant', {
        body: {
          action: 'parse_send',
          input: input,
        },
      });

      if (error) throw error;

      if (data.parsed) {
        setParsedIntent(data.parsed);
        setShowDraft(true);
        
        // If raw address detected and it's a SEND, run detective
        if (data.parsed.type === 'SEND' && data.parsed.recipient?.address && data.parsed.recipient.address.startsWith('0x')) {
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
      toast({
        title: "Failed to parse command",
        description: "Please try rephrasing your transaction",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = async () => {
    if (!parsedIntent) return;

    try {
      await onSend(parsedIntent);
      toast({ title: `${parsedIntent.type} transaction sent successfully!` });
      setShowDraft(false);
      setInput("");
      setParsedIntent(null);
    } catch (error) {
      toast({
        title: "Transaction failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const closeDraft = () => {
    setShowDraft(false);
    setParsedIntent(null);
    setAddressResult(null);
  };

  return (
    <div className="space-y-4">
      {/* Recent Contacts */}
      <RecentContacts onSelectAddress={(address) => {
        setInput(`Send 0.1 ETH to ${address}`);
      }} />

      {/* Natural Language Input Bar */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Sparkles className="w-5 h-5 text-violet-400" />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleDraft()}
          placeholder='Type "Send 0.5 ETH to Mike" or "Swap USDC for SOL"'
          className="w-full pl-12 pr-28 py-4 bg-slate-900/50 border border-white/10 rounded-2xl focus:border-violet-400 focus:outline-none text-white placeholder:text-slate-500"
          disabled={isAnalyzing}
        />
        <button
          onClick={handleDraft}
          disabled={isAnalyzing || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-violet-500 hover:bg-violet-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-medium transition-colors"
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Draft"
          )}
        </button>
      </div>

      {/* Draft Card */}
      <AnimatePresence>
        {showDraft && parsedIntent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {parsedIntent.type === 'SEND' ? (
                  <Send className="w-5 h-5 text-violet-400" />
                ) : (
                  <RefreshCcw className="w-5 h-5 text-emerald-400" />
                )}
                <span className="font-bold text-white">
                  {parsedIntent.type} Transaction
                </span>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  Ethereum
                </span>
              </div>
              <button
                onClick={closeDraft}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="h-px bg-white/10" />

            {/* Transaction Details */}
            <div className="space-y-3">
              {parsedIntent.type === 'SEND' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Asset</span>
                    <span className="text-white font-bold">
                      {parsedIntent.amount} {parsedIntent.token || 'ETH'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">To</span>
                    <span className="text-white font-mono text-xs">
                      {parsedIntent.recipient?.name || 
                       `${parsedIntent.recipient?.address?.slice(0, 6)}...${parsedIntent.recipient?.address?.slice(-4)}`}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">From</span>
                    <span className="text-white font-bold">
                      {parsedIntent.amount} {parsedIntent.fromToken || parsedIntent.token}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">To</span>
                    <span className="text-white font-bold">
                      {parsedIntent.toToken}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="h-px bg-white/10" />

            {/* Address Detective */}
            <AnimatePresence>
              {addressResult && <AddressDetective result={addressResult} />}
            </AnimatePresence>

            {/* Slide to Confirm - High Friction Safety Pattern */}
            <div className="space-y-2">
              {addressResult?.warning && (
                <div className="text-xs text-red-400 text-center">
                  ⚠️ Address verification failed - confirmation disabled
                </div>
              )}
              <SlideToConfirm
                onConfirm={handleConfirm}
                disabled={addressResult?.warning}
                label={`Slide to Confirm ${parsedIntent.type}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}