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
      <DialogContent className="backdrop-blur-xl bg-slate-950/95 border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <FileDown className="w-5 h-5 text-cyan-400" />
            Export Scenario Report
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Generate a comprehensive report of your financial scenario
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Scenario Name */}
          <div className="space-y-2">
            <Label htmlFor="scenario-name" className="text-white/80">
              Report Title
            </Label>
            <Input
              id="scenario-name"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              placeholder="My Financial Scenario"
            />
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label className="text-white/80">Export Format</Label>
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
              <Label className="text-white/80">Include Sections</Label>
              
              <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="summary"
                    checked={selectedSections.summary}
                    onCheckedChange={() => toggleSection('summary')}
                    className="border-white/20"
                  />
                  <Label htmlFor="summary" className="text-white/90 cursor-pointer">
                    Executive Summary
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="events"
                    checked={selectedSections.events}
                    onCheckedChange={() => toggleSection('events')}
                    className="border-white/20"
                  />
                  <Label htmlFor="events" className="text-white/90 cursor-pointer">
                    Life Events Table
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="timeline"
                    checked={selectedSections.timeline}
                    onCheckedChange={() => toggleSection('timeline')}
                    className="border-white/20"
                  />
                  <Label htmlFor="timeline" className="text-white/90 cursor-pointer">
                    Timeline Chart
                  </Label>
                </div>

                {scenarioData.monteCarloData && (
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="monteCarlo"
                      checked={selectedSections.monteCarlo}
                      onCheckedChange={() => toggleSection('monteCarlo')}
                      className="border-white/20"
                    />
                    <Label htmlFor="monteCarlo" className="text-white/90 cursor-pointer">
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
                      className="border-white/20"
                    />
                    <Label htmlFor="comparison" className="text-white/90 cursor-pointer">
                      Scenario Comparison
                    </Label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats Preview */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <div>
              <p className="text-xs text-white/60">Events</p>
              <p className="text-lg font-bold text-cyan-400">{scenarioData.events.length}</p>
            </div>
            <div>
              <p className="text-xs text-white/60">Years</p>
              <p className="text-lg font-bold text-cyan-400">
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
              className="flex-1 border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black"
            >
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
