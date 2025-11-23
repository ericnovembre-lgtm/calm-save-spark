import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BillAnalysis {
  provider: string;
  amount: number;
  bloat_items: Array<{ name: string; amount: number }>;
  contract_end_date: string;
  negotiation_score: number;
  leverage_points: string[];
}

export function useBillScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState<BillAnalysis | null>(null);

  const scanBill = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsScanning(true);
    setAnalysis(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Call edge function
      const { data, error } = await supabase.functions.invoke('analyze-bill-document', {
        body: { fileData, fileName: file.name },
      });

      if (error) throw error;

      setAnalysis(data);
      toast.success('Bill analyzed successfully!');
    } catch (error) {
      console.error('Error scanning bill:', error);
      toast.error('Failed to analyze bill. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysis(null);
  };

  return {
    scanBill,
    isScanning,
    analysis,
    clearAnalysis,
  };
}
