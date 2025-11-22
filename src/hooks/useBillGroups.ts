import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BillGroup {
  id: string;
  name: string;
  description: string;
  billIds: string[];
  totalAmount: number;
  confidence: number;
}

export function useBillGroups(bills: any[]) {
  const [groups, setGroups] = useState<BillGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGroups() {
      if (bills.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        const { data, error } = await supabase.functions.invoke(
          'generate-bill-groups',
          { body: { bills } }
        );

        if (error) throw error;
        setGroups(data.groups || []);
      } catch (err) {
        console.error('Error fetching bill groups:', err);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, [bills]);

  return { groups, loading };
}
