import { useState } from "react";
import { Helmet } from "react-helmet";
import { PageLayout } from "@/components/layout/PageLayout";
import { DocumentUploadZone } from "@/components/tax/DocumentUploadZone";
import { DocumentViewer } from "@/components/tax/DocumentViewer";
import { TaxSummaryDashboard } from "@/components/tax/TaxSummaryDashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload } from "lucide-react";

export default function TaxDocuments() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  return (
    <>
      <Helmet>
        <title>Tax Documents | $ave+</title>
        <meta name="description" content="Manage your tax documents with AI-powered categorization" />
      </Helmet>

      <PageLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tax Documents</h1>
              <p className="text-muted-foreground mt-1">
                Upload and organize your tax documents with AI
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Tax Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setShowUpload(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
            </div>
          </div>

          {/* Summary Dashboard */}
          <TaxSummaryDashboard taxYear={parseInt(selectedYear)} />

          {/* Document Tabs */}
          <Card className="p-6">
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Documents</TabsTrigger>
                <TabsTrigger value="w2">W-2</TabsTrigger>
                <TabsTrigger value="1099">1099</TabsTrigger>
                <TabsTrigger value="receipts">Receipts</TabsTrigger>
                <TabsTrigger value="deductions">Deductions</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <DocumentViewer
                  taxYear={parseInt(selectedYear)}
                  filter="all"
                  onDocumentSelect={setSelectedDocument}
                />
              </TabsContent>

              <TabsContent value="w2" className="mt-6">
                <DocumentViewer
                  taxYear={parseInt(selectedYear)}
                  filter="w2"
                  onDocumentSelect={setSelectedDocument}
                />
              </TabsContent>

              <TabsContent value="1099" className="mt-6">
                <DocumentViewer
                  taxYear={parseInt(selectedYear)}
                  filter="1099"
                  onDocumentSelect={setSelectedDocument}
                />
              </TabsContent>

              <TabsContent value="receipts" className="mt-6">
                <DocumentViewer
                  taxYear={parseInt(selectedYear)}
                  filter="receipt"
                  onDocumentSelect={setSelectedDocument}
                />
              </TabsContent>

              <TabsContent value="deductions" className="mt-6">
                <DocumentViewer
                  taxYear={parseInt(selectedYear)}
                  filter="deduction"
                  onDocumentSelect={setSelectedDocument}
                />
              </TabsContent>
            </Tabs>
          </Card>

          {/* Upload Modal */}
          {showUpload && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Upload Tax Documents</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowUpload(false)}>
                    ✕
                  </Button>
                </div>
                <DocumentUploadZone
                  taxYear={parseInt(selectedYear)}
                  onUploadComplete={() => setShowUpload(false)}
                />
              </Card>
            </div>
          )}
        </div>
      </PageLayout>
    </>
  );
}
