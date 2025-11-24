import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function SmartAddressInput() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const handleScan = async () => {
    if (!address.trim() || address.length < 10) {
      toast({
        title: "Invalid address",
        description: "Please enter a valid wallet address",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('wallet-ai-assistant', {
        body: {
          action: 'detect_address',
          address: address.trim(),
        },
      });

      if (error) throw error;

      if (data) {
        setResult(data);
      }
    } catch (error) {
      console.error('Address scan error:', error);
      toast({
        title: "Failed to scan address",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Address Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Shield className="w-5 h-5 text-cyan-400" />
        </div>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleScan()}
          placeholder="Paste any address to scan for safety..."
          className="w-full pl-12 pr-28 py-4 bg-slate-900/50 border border-white/10 rounded-2xl focus:border-cyan-400 focus:outline-none text-white placeholder:text-slate-500 font-mono text-sm"
          disabled={isScanning}
        />
        <button
          onClick={handleScan}
          disabled={isScanning || !address.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          {isScanning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Search className="w-4 h-4" />
              Scan
            </>
          )}
        </button>
      </div>

      {/* Detective Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`bg-slate-900/80 border rounded-2xl p-4 space-y-3 ${
              result.warning 
                ? 'border-red-500/30 bg-red-500/5' 
                : 'border-emerald-500/30 bg-emerald-500/5'
            }`}
          >
            {/* Header */}
            <div className="flex items-center gap-2">
              {result.warning ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="font-bold text-red-400">⚠️ Warning Detected</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-emerald-400">✓ Address Verified</span>
                </>
              )}
            </div>

            <div className="h-px bg-white/10" />

            {/* Analysis Result */}
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-sm">Type</span>
                <span className={`text-sm font-medium ${result.warning ? 'text-red-300' : 'text-emerald-300'}`}>
                  {result.type || 'Unknown'}
                </span>
              </div>
              
              {result.analysis && (
                <div className="bg-slate-950/50 rounded-xl p-3">
                  <p className={`text-sm leading-relaxed ${
                    result.warning ? 'text-red-200' : 'text-slate-300'
                  }`}>
                    {result.analysis}
                  </p>
                </div>
              )}

              {result.warning && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">
                    Do not send funds to this address. It may be associated with scams or phishing.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
