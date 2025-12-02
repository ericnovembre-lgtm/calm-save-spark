import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FileDown, Loader2, FileText } from 'lucide-react';
import { ScenarioExportData, generateScenarioPDF } from '@/lib/scenario-export-pdf';
import { exportToCSV } from '@/lib/export-lazy';
import { useToast } from '@/hooks/use-toast';

interface ScenarioExportModalProps {
  open: boolean;
  onClose: () => void;
  scenarioData: ScenarioExportData;
}

export function ScenarioExportModal({ open, onClose, scenarioData }: ScenarioExportModalProps) {
  const { toast } = useToast();
  const [scenarioName, setScenarioName] = useState(scenarioData.name || 'My Financial Scenario');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedSections, setSelectedSections] = useState({
    summary: true,
    events: true,
    timeline: true,
    monteCarlo: !!scenarioData.monteCarloData,
    comparison: !!scenarioData.comparison,
  });
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');

  const handleExport = async () => {
    setIsExporting(true);

    try {
      if (exportFormat === 'pdf') {
        // Generate PDF with selected sections
        const filteredData: ScenarioExportData = {
          ...scenarioData,
          name: scenarioName,
          monteCarloData: selectedSections.monteCarlo ? scenarioData.monteCarloData : undefined,
          comparison: selectedSections.comparison ? scenarioData.comparison : undefined,
        };

        generateScenarioPDF(filteredData);

        toast({
          title: 'Export Complete',
          description: 'Your scenario report has been downloaded as PDF.',
        });
      } else {
        // Export as CSV
        const headers = ['Year', 'Age', 'Net Worth', 'Event', 'Impact'];
        const rows = scenarioData.timeline.map((point, i) => {
          const event = scenarioData.events.find(e => e.year === point.year);
          return [
            point.year.toString(),
            point.year.toString(),
            point.netWorth.toFixed(2),
            event ? event.event.label : '',
            event ? (event.event.impact || 0).toFixed(2) : '',
          ];
        });

        await exportToCSV({
          title: scenarioName,
          headers,
          rows,
        });

        toast({
          title: 'Export Complete',
          description: 'Your scenario data has been downloaded as CSV.',
        });
      }

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error generating your report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSection = (section: keyof typeof selectedSections) => {
    setSelectedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="backdrop-blur-xl bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileDown className="w-5 h-5 text-accent" />
            Export Scenario Report
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Generate a comprehensive report of your financial scenario
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="scenario-name" className="text-muted-foreground">
              Report Title
            </Label>
            <Input
              id="scenario-name"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="bg-muted/50 border-border"
              placeholder="My Financial Scenario"
            />
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Export Format</Label>
            <div className="flex gap-2">
              <Button
                variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExportFormat('pdf')}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF Report
              </Button>
              <Button
                variant={exportFormat === 'csv' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExportFormat('csv')}
                className="flex-1"
              >
                <FileDown className="w-4 h-4 mr-2" />
                CSV Data
              </Button>
            </div>
          </div>

          {/* Section Selection (PDF only) */}
          {exportFormat === 'pdf' && (
            <div className="space-y-3">
              <Label className="text-muted-foreground">Include Sections</Label>
              
              <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="summary"
                    checked={selectedSections.summary}
                    onCheckedChange={() => toggleSection('summary')}
                    className="border-border"
                  />
                  <Label htmlFor="summary" className="text-foreground cursor-pointer">
                    Executive Summary
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="events"
                    checked={selectedSections.events}
                    onCheckedChange={() => toggleSection('events')}
                    className="border-border"
                  />
                  <Label htmlFor="events" className="text-foreground cursor-pointer">
                    Life Events Table
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="timeline"
                    checked={selectedSections.timeline}
                    onCheckedChange={() => toggleSection('timeline')}
                    className="border-border"
                  />
                  <Label htmlFor="timeline" className="text-foreground cursor-pointer">
                    Timeline Chart
                  </Label>
                </div>

                {scenarioData.monteCarloData && (
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="monteCarlo"
                      checked={selectedSections.monteCarlo}
                      onCheckedChange={() => toggleSection('monteCarlo')}
                      className="border-border"
                    />
                    <Label htmlFor="monteCarlo" className="text-foreground cursor-pointer">
                      Monte Carlo Projections
                    </Label>
                  </div>
                )}

                {scenarioData.comparison && (
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="comparison"
                      checked={selectedSections.comparison}
                      onCheckedChange={() => toggleSection('comparison')}
                      className="border-border"
                    />
                    <Label htmlFor="comparison" className="text-foreground cursor-pointer">
                      Scenario Comparison
                    </Label>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-accent/10 border border-accent/20">
            <div>
              <p className="text-xs text-muted-foreground">Events</p>
              <p className="text-lg font-bold text-accent">{scenarioData.events.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Years</p>
              <p className="text-lg font-bold text-accent">
                {scenarioData.retirementAge - scenarioData.currentAge}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isExporting}
              className="flex-1 border-border hover:bg-muted/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 mr-2" />
                  Export {exportFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
