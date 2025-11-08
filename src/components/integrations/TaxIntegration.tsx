import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function TaxIntegration() {
  const [taxYear, setTaxYear] = useState(new Date().getFullYear().toString());

  const { data: documents } = useQuery({
    queryKey: ['tax-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_documents')
        .select('*')
        .order('tax_year', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const generateTaxReport = async () => {
    try {
      const { error } = await supabase.functions.invoke('generate-tax-report', {
        body: { tax_year: parseInt(taxYear) }
      });

      if (error) throw error;

      toast.success("Tax report generated successfully");
    } catch (error: any) {
      toast.error(`Failed to generate report: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-bold">Tax Software Integration</h3>
              <p className="text-sm text-muted-foreground">
                Generate tax reports and export to TurboTax, H&R Block
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tax Year</label>
              <Select value={taxYear} onValueChange={setTaxYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={generateTaxReport} className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="font-semibold mb-4">Tax Documents</h4>
        <div className="space-y-2">
          {documents && documents.length > 0 ? (
            documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">{doc.document_type}</p>
                  <p className="text-sm text-muted-foreground">Tax Year {doc.tax_year}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No tax documents yet</p>
              <p className="text-sm mt-1">Generate your first tax report</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}