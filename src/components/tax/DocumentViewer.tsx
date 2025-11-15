import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface DocumentViewerProps {
  taxYear: number;
  filter: string;
  onDocumentSelect?: (documentId: string) => void;
}

export function DocumentViewer({ taxYear, filter, onDocumentSelect }: DocumentViewerProps) {
  const { toast } = useToast();

  const { data: documents, isLoading } = useQuery({
    queryKey: ["tax-documents", taxYear, filter],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("tax_documents")
        .select("*")
        .eq("user_id", user.id)
        .eq("tax_year", taxYear)
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("document_type", filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const handleDownload = async (storagePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("tax-documents")
        .download(storagePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: "Downloaded successfully" });
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string, storagePath: string) => {
    try {
      // Delete from storage
      await supabase.storage.from("tax-documents").remove([storagePath]);
      
      // Delete from database
      const { error } = await supabase
        .from("tax_documents")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Document deleted" });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No documents yet</h3>
        <p className="text-sm text-muted-foreground">
          Upload your first tax document to get started
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc, idx) => (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Card className="p-4 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                      <h4 className="text-sm font-medium text-foreground line-clamp-1">
                      {doc.file_url.split('/').pop() || 'Document'}
                    </h4>
                    <p className="text-xs text-muted-foreground capitalize mt-1">
                      {doc.document_type.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <div className={`text-xs px-2 py-1 rounded ${
                  doc.processing_status === "completed" 
                    ? "bg-green-500/10 text-green-500"
                    : doc.processing_status === "processing"
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {doc.processing_status}
                </div>
              </div>

              {doc.parsed_data && (
                <div className="text-xs space-y-1 p-3 bg-muted rounded-lg">
                  {Object.entries(doc.parsed_data as Record<string, any>).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key.replace("_", " ")}:</span>
                      <span className="text-foreground font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDocumentSelect?.(doc.id)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDownload(doc.storage_path, doc.file_url.split('/').pop() || 'document')}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(doc.id, doc.storage_path)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
