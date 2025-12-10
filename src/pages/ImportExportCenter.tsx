import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImportWizard } from '@/components/import-export/ImportWizard';
import { ExportBuilder } from '@/components/import-export/ExportBuilder';
import { ExportHistory } from '@/components/import-export/ExportHistory';
import { DataBackupCard } from '@/components/import-export/DataBackupCard';
import { Upload, Download, HardDrive } from 'lucide-react';
import { toast } from 'sonner';

export default function ImportExportCenter() {
  const handleImportComplete = (data: any[]) => {
    toast.success(`Imported ${data.length} transactions`);
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6" data-copilot-id="import-export-page">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HardDrive className="w-6 h-6" />
            Import / Export Center
          </h1>
          <p className="text-muted-foreground">Manage your financial data</p>
        </div>

        <Tabs defaultValue="import" className="space-y-6">
          <TabsList>
            <TabsTrigger value="import" className="gap-2">
              <Upload className="w-4 h-4" />
              Import
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="backup" className="gap-2">
              <HardDrive className="w-4 h-4" />
              Backup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import">
            <ImportWizard onImportComplete={handleImportComplete} />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <ExportBuilder />
            <ExportHistory />
          </TabsContent>

          <TabsContent value="backup">
            <DataBackupCard />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
