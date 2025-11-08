import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Download, Play } from "lucide-react";

export function ReportBuilder() {
  const [reportConfig, setReportConfig] = useState({
    report_name: "",
    report_type: "spending",
    start_date: "",
    end_date: ""
  });

  const generateReport = async () => {
    if (!reportConfig.report_name || !reportConfig.start_date || !reportConfig.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-custom-report', {
        body: {
          reportConfig: {
            ...reportConfig,
            date_range: {
              start_date: reportConfig.start_date,
              end_date: reportConfig.end_date
            }
          }
        }
      });

      if (error) throw error;

      toast.success("Report generated successfully");
      console.log('Report data:', data);
    } catch (error: any) {
      toast.error(`Failed to generate report: ${error.message}`);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold">Create Custom Report</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Build personalized financial reports with custom filters
          </p>
        </div>

        <div className="grid gap-4">
          <div>
            <Label htmlFor="report_name">Report Name *</Label>
            <Input
              id="report_name"
              value={reportConfig.report_name}
              onChange={(e) => setReportConfig({ ...reportConfig, report_name: e.target.value })}
              placeholder="Q4 Spending Analysis"
            />
          </div>

          <div>
            <Label htmlFor="report_type">Report Type *</Label>
            <Select 
              value={reportConfig.report_type} 
              onValueChange={(value) => setReportConfig({ ...reportConfig, report_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spending">Spending Analysis</SelectItem>
                <SelectItem value="income">Income Report</SelectItem>
                <SelectItem value="savings">Savings Progress</SelectItem>
                <SelectItem value="goals">Goals Overview</SelectItem>
                <SelectItem value="debts">Debt Analysis</SelectItem>
                <SelectItem value="investments">Investment Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={reportConfig.start_date}
                onChange={(e) => setReportConfig({ ...reportConfig, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={reportConfig.end_date}
                onChange={(e) => setReportConfig({ ...reportConfig, end_date: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={generateReport}>
            <Play className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </Card>
  );
}