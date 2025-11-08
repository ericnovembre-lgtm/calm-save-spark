import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, FileText, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

export function TaxReporting() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [quarter, setQuarter] = useState("");
  const [report, setReport] = useState<any>(null);

  const generateReport = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-tax-report', {
        body: {
          year: parseInt(year),
          quarter: quarter ? parseInt(quarter) : null,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setReport(data);
      toast.success("Tax report generated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to generate report: ${error.message}`);
    },
  });

  const downloadReport = () => {
    if (!report) return;

    const csvContent = [
      ['Tax Report'],
      ['Period', `${report.period.year}${report.period.quarter ? ` Q${report.period.quarter}` : ''}`],
      ['Start Date', new Date(report.period.startDate).toLocaleDateString()],
      ['End Date', new Date(report.period.endDate).toLocaleDateString()],
      [''],
      ['Summary'],
      ['Total Expenses', `$${report.summary.totalExpenses.toFixed(2)}`],
      ['Tax Deductible', `$${report.summary.totalDeductible.toFixed(2)}`],
      ['Deductible %', `${report.summary.deductiblePercentage.toFixed(1)}%`],
      ['Expense Count', report.summary.expenseCount],
      [''],
      ['Category Breakdown'],
      ['Category', 'Total', 'Deductible', 'Count', 'Percentage'],
      ...report.categorySummary.map((cat: any) => [
        cat.category.replace(/_/g, ' '),
        `$${cat.total.toFixed(2)}`,
        `$${cat.deductible.toFixed(2)}`,
        cat.count,
        `${cat.percentage.toFixed(1)}%`
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-report-${year}${quarter ? `-Q${quarter}` : ''}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  const chartData = report?.categorySummary.map((cat: any) => ({
    name: cat.category.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    value: cat.total,
  }));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Generate Tax Report
        </h2>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Tax Year</label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2023, 2022, 2021].map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Quarter (Optional)</label>
            <Select value={quarter} onValueChange={setQuarter}>
              <SelectTrigger>
                <SelectValue placeholder="Full Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Full Year</SelectItem>
                <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => generateReport.mutate()} disabled={generateReport.isPending}>
            <FileText className="w-4 h-4 mr-2" />
            {generateReport.isPending ? "Generating..." : "Generate Report"}
          </Button>
        </div>
      </Card>

      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Expenses</p>
              <p className="text-3xl font-bold">${report.summary.totalExpenses.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-1">{report.summary.expenseCount} transactions</p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Tax Deductible</p>
              <p className="text-3xl font-bold text-green-600">${report.summary.totalDeductible.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-1">{report.summary.deductiblePercentage.toFixed(1)}% of total</p>
            </Card>

            <Card className="p-6 flex items-center justify-center">
              <Button onClick={downloadReport} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Expense Breakdown by Category</h3>
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData?.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Category Details</h3>
            <div className="space-y-3">
              {report.categorySummary.map((cat: any, index: number) => (
                <div key={cat.category} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <p className="font-medium">
                        {cat.category.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </p>
                      <p className="text-sm text-muted-foreground">{cat.count} expenses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${cat.total.toFixed(2)}</p>
                    <p className="text-sm text-green-600">${cat.deductible.toFixed(2)} deductible</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
