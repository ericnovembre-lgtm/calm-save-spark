import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, FileText, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface DocumentUploadZoneProps {
  taxYear: number;
  onUploadComplete?: () => void;
}

interface UploadingFile {
  name: string;
  progress: number;
  status: "uploading" | "processing" | "complete" | "error";
  error?: string;
}

export function DocumentUploadZone({ taxYear, onUploadComplete }: DocumentUploadZoneProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const { toast } = useToast();

  const onDrop = async (acceptedFiles: File[]) => {
    const newFiles: UploadingFile[] = acceptedFiles.map(f => ({
      name: f.name,
      progress: 0,
      status: "uploading"
    }));
    setUploadingFiles(newFiles);

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Upload to storage
        const filePath = `${user.id}/${taxYear}/${Date.now()}-${file.name}`;
        
        setUploadingFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, progress: 30 } : f
        ));

        const { error: uploadError } = await supabase.storage
          .from("tax-documents")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        setUploadingFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, progress: 60, status: "processing" } : f
        ));

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("tax-documents")
          .getPublicUrl(filePath);

        // Create tax document record
        const { data: docData, error: docError } = await supabase
          .from("tax_documents")
          .insert({
            user_id: user.id,
            tax_year: taxYear,
            document_name: file.name,
            document_type: detectDocumentType(file.name),
            storage_path: filePath,
            processing_status: "processing"
          })
          .select()
          .single();

        if (docError) throw docError;

        // Call edge function to process document
        const { error: processError } = await supabase.functions.invoke("process-tax-document", {
          body: { documentId: docData.id, documentUrl: publicUrl, fileName: file.name }
        });

        if (processError) throw processError;

        setUploadingFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, progress: 100, status: "complete" } : f
        ));

      } catch (error: any) {
        setUploadingFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: "error", error: error.message } : f
        ));
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive"
        });
      }
    }

    setTimeout(() => {
      onUploadComplete?.();
    }, 2000);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxSize: 20971520 // 20MB
  });

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={`p-12 border-2 border-dashed cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4 text-center">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <div>
            <p className="text-lg font-medium text-foreground">
              {isDragActive ? "Drop documents here" : "Upload Tax Documents"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Drag & drop or click to upload W-2, 1099, receipts, and more
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Supported: JPG, PNG, PDF (max 20MB each)
            </p>
          </div>
        </div>
      </Card>

      <AnimatePresence>
        {uploadingFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {uploadingFiles.map((file, idx) => (
              <Card key={idx} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{file.name}</span>
                    </div>
                    {file.status === "complete" && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {(file.status === "uploading" || file.status === "processing") && (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <Progress value={file.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {file.status === "uploading" && "Uploading..."}
                      {file.status === "processing" && "Processing with AI..."}
                      {file.status === "complete" && "Complete"}
                      {file.status === "error" && `Error: ${file.error}`}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function detectDocumentType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.includes("w-2") || lower.includes("w2")) return "w2";
  if (lower.includes("1099")) return "1099";
  if (lower.includes("receipt")) return "receipt";
  if (lower.includes("invoice")) return "invoice";
  return "other";
}
