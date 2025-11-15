import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { FileText, DollarSign, CheckCircle, AlertCircle } from "lucide-react";

interface TaxSummaryDashboardProps {
  taxYear: number;
}

export function TaxSummaryDashboard({ taxYear }: TaxSummaryDashboardProps) {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["tax-summary", taxYear],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get documents count
      const { count: docsCount } = await supabase
        .from("tax_documents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("tax_year", taxYear);

      // Get processed count
      const { count: processedCount } = await supabase
        .from("tax_documents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("tax_year", taxYear)
        .eq("processing_status", "completed");

      // Get deductions
      const { data: deductions } = await supabase
        .from("tax_deductions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("tax_year", taxYear);

      const totalDeductions = deductions?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

      return {
        totalDocuments: docsCount || 0,
        processedDocuments: processedCount || 0,
        totalDeductions,
        estimatedSavings: totalDeductions * 0.22 // Rough estimate at 22% tax rate
      };
    }
  });

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-2" />
            <div className="h-8 bg-muted rounded w-16" />
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Total Documents",
      value: summary.totalDocuments,
      icon: FileText,
      color: "text-blue-500"
    },
    {
      label: "Processed",
      value: summary.processedDocuments,
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      label: "Total Deductions",
      value: `$${summary.totalDeductions.toLocaleString()}`,
      icon: DollarSign,
      color: "text-purple-500"
    },
    {
      label: "Est. Savings",
      value: `$${summary.estimatedSavings.toLocaleString()}`,
      icon: DollarSign,
      color: "text-amber-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <Icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
