import { useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText, Calendar, Loader2 } from "lucide-react";
import { useMonthlyReportData } from "@/hooks/useMonthlyReportData";
import { generateFinancialReportPDF } from "@/lib/financial-report-pdf";
import { exportToCSV } from "@/lib/export-lazy";
import { toast } from "sonner";
import { ChartWrapper } from "@/components/ui/chart-wrapper";
import { startOfMonth } from "date-fns";

interface ReportSections {
  netWorth: boolean;
  health: boolean;
  accounts: boolean;
  debts: boolean;
  goals: boolean;
}

export function MonthlyFinancialReport() {
  const [selectedMonth] = useState(startOfMonth(new Date()));
  const [isExporting, setIsExporting] = useState(false);
  const [sections, setSections] = useState<ReportSections>({
    netWorth: true,
    health: true,
    accounts: true,
    debts: true,
    goals: true,
  });

  const { data: reportData, isLoading } = useMonthlyReportData(selectedMonth);
  const prefersReducedMotion = useReducedMotion();

  const handleSectionToggle = (section: keyof ReportSections) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleExportPDF = async () => {
    if (!reportData) return;

    setIsExporting(true);
    try {
      const sectionsToExport = [];

      if (sections.netWorth && reportData.netWorth) {
        sectionsToExport.push({
          title: 'Net Worth Summary',
          data: reportData.netWorth,
          type: 'netWorth' as const,
        });
      }

      if (sections.health && reportData.healthMetrics) {
        sectionsToExport.push({
          title: 'Financial Health Metrics',
          data: reportData.healthMetrics,
          type: 'health' as const,
        });
      }

      if (sections.accounts) {
        sectionsToExport.push({
          title: 'Connected Accounts',
          data: reportData.accounts,
          type: 'accounts' as const,
        });
      }

      if (sections.debts) {
        sectionsToExport.push({
          title: 'Debts & Liabilities',
          data: reportData.debts,
          type: 'debts' as const,
        });
      }

      if (sections.goals) {
        sectionsToExport.push({
          title: 'Financial Goals',
          data: reportData.goals,
          type: 'goals' as const,
        });
      }

      await generateFinancialReportPDF({
        reportMonth: reportData.reportMonth,
        generatedDate: reportData.generatedDate,
        sections: sectionsToExport,
      });

      toast.success('Financial report downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    if (!reportData) return;

    setIsExporting(true);
    try {
      const rows: any[][] = [];

      // Add header
      rows.push(['$ave+ Financial Report', reportData.reportMonth]);
      rows.push(['Generated', reportData.generatedDate]);
      rows.push([]);

      if (sections.netWorth && reportData.netWorth) {
        rows.push(['Net Worth Summary']);
        rows.push(['Metric', 'Value']);
        rows.push(['Current Net Worth', `$${reportData.netWorth.currentNetWorth?.toLocaleString()}`]);
        rows.push(['Total Assets', `$${reportData.netWorth.totalAssets?.toLocaleString()}`]);
        rows.push(['Total Liabilities', `$${reportData.netWorth.totalDebts?.toLocaleString()}`]);
        rows.push([]);
      }

      if (sections.health && reportData.healthMetrics) {
        rows.push(['Financial Health Metrics']);
        rows.push(['Metric', 'Score']);
        rows.push(['Composite Score', `${reportData.healthMetrics.compositeScore}/100`]);
        rows.push(['Credit Score', reportData.healthMetrics.creditScore]);
        rows.push([]);
      }

      if (sections.accounts) {
        rows.push(['Connected Accounts']);
        rows.push(['Institution', 'Type', 'Balance']);
        reportData.accounts.forEach(acc => {
          rows.push([
            acc.institution_name || 'Unknown',
            acc.account_type || 'N/A',
            `$${acc.current_balance?.toLocaleString()}`,
          ]);
        });
        rows.push([]);
      }

      await exportToCSV({
        title: `Financial Report - ${reportData.reportMonth}`,
        headers: [],
        rows,
      });

      toast.success('CSV report downloaded successfully');
    } catch (error) {
      console.error('Error generating CSV:', error);
      toast.error('Failed to generate CSV');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ChartWrapper delay={0.5}>
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Monthly Financial Report</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Report Customization */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Select Sections</h3>
            <div className="space-y-4">
              {[
                { key: 'netWorth' as keyof ReportSections, label: 'Net Worth Summary', icon: '💰' },
                { key: 'health' as keyof ReportSections, label: 'Financial Health Metrics', icon: '🏥' },
                { key: 'accounts' as keyof ReportSections, label: 'Connected Accounts', icon: '🏦' },
                { key: 'debts' as keyof ReportSections, label: 'Debts & Liabilities', icon: '💳' },
                { key: 'goals' as keyof ReportSections, label: 'Financial Goals', icon: '🎯' },
              ].map((section, idx) => (
                <motion.div
                  key={section.key}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={sections[section.key]}
                    onCheckedChange={() => handleSectionToggle(section.key)}
                    id={section.key}
                  />
                  <label
                    htmlFor={section.key}
                    className="flex items-center gap-2 cursor-pointer text-foreground flex-1"
                  >
                    <span>{section.icon}</span>
                    <span>{section.label}</span>
                  </label>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Preview & Download */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Report Preview</h3>
            <div className="rounded-lg border border-border bg-muted/20 p-6 space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{reportData?.reportMonth || 'Loading...'}</span>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Selected sections: {Object.values(sections).filter(Boolean).length}
                </div>
                {isLoading && (
                  <div className="text-sm text-muted-foreground">Loading report data...</div>
                )}
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                <Button
                  onClick={handleExportPDF}
                  disabled={isExporting || isLoading || !reportData}
                  className="w-full"
                  size="lg"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF Report
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleExportCSV}
                  disabled={isExporting || isLoading || !reportData}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChartWrapper>
  );
}
