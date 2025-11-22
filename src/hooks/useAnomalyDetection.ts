import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Anomaly {
  billId: string;
  severity: "low" | "medium" | "high";
  reason: string;
  action: string;
}

export function useAnomalyDetection(currentBills: any[], historicalBills: any[]) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function detectAnomalies() {
      if (currentBills.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        const { data, error } = await supabase.functions.invoke(
          'detect-bill-anomalies',
          { body: { currentBills, historicalBills } }
        );

        if (error) throw error;
        setAnomalies(data.anomalies || []);
      } catch (err) {
        console.error('Error detecting anomalies:', err);
        setAnomalies([]);
      } finally {
        setLoading(false);
      }
    }

    detectAnomalies();
  }, [currentBills, historicalBills]);

  return { anomalies, loading };
}
