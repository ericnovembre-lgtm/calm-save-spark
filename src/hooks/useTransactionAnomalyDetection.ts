import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TransactionAnomaly {
  transactionId: string;
  anomalyType: "duplicate" | "high_tip" | "price_hike" | "outlier" | "unusual_merchant";
  severity: "low" | "medium" | "high";
  explanation: string;
  suggestedAction: string;
}

export function useTransactionAnomalyDetection(timeframe: '7d' | '30d' | '90d' = '30d') {
  const [anomalies, setAnomalies] = useState<TransactionAnomaly[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ total: 0, high: 0, medium: 0, low: 0 });

  const scanForAnomalies = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('detect-anomalies', {
        body: { timeframe }
      });

      if (error) throw error;
      
      setAnomalies(data.anomalies || []);
      setSummary(data.summary || { total: 0, high: 0, medium: 0, low: 0 });
    } catch (err) {
      console.error('Error detecting anomalies:', err);
      setAnomalies([]);
      setSummary({ total: 0, high: 0, medium: 0, low: 0 });
    } finally {
      setLoading(false);
    }
  };

  return { anomalies, loading, summary, scanForAnomalies };
}
