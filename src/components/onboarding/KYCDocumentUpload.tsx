import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, CheckCircle, XCircle, Loader2, Camera, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface KYCDocument {
  id: string;
  type: string;
  url: string;
  status: "pending" | "verified" | "rejected";
  fileName: string;
}

export function KYCDocumentUpload() {
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = async (acceptedFiles: File[]) => {
    setUploading(true);
    
    for (const file of acceptedFiles) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Upload to storage
        const filePath = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("kyc-documents")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("kyc-documents")
          .getPublicUrl(filePath);

        // Create verification record
        const { data, error } = await supabase
          .from("kyc_verifications")
          .insert({
            user_id: user.id,
            document_type: detectDocumentType(file.name),
            document_url: publicUrl,
            verification_status: "pending"
          })
          .select()
          .single();

        if (error) throw error;

        // Call edge function to process document
        const { error: processError } = await supabase.functions.invoke("process-kyc-document", {
          body: { documentId: data.id, documentUrl: publicUrl }
        });

        if (processError) throw processError;

        setDocuments(prev => [...prev, {
          id: data.id,
          type: data.document_type,
          url: publicUrl,
          status: "pending",
          fileName: file.name
        }]);

        toast({
          title: "Document uploaded",
          description: "Processing verification..."
        });
      } catch (error: any) {
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive"
        });
      }
    }

    setUploading(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10485760 // 10MB
  });

  const detectDocumentType = (fileName: string): string => {
    const lower = fileName.toLowerCase();
    if (lower.includes("passport")) return "passport";
    if (lower.includes("license") || lower.includes("driver")) return "drivers_license";
    if (lower.includes("utility") || lower.includes("bill")) return "utility_bill";
    return "other";
  };

  return (
    <div className="space-y-6">
      <Card
        {...getRootProps()}
        className={`p-12 border-2 border-dashed cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4 text-center">
          {uploading ? (
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-12 w-12 text-muted-foreground" />
          )}
          <div>
            <p className="text-lg font-medium text-foreground">
              {isDragActive ? "Drop documents here" : "Upload KYC Documents"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Drag & drop or click to upload passport, driver's license, or utility bill
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Supported: JPG, PNG, PDF (max 10MB)
            </p>
          </div>
        </div>
      </Card>

      <AnimatePresence>
        {documents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-foreground">Uploaded Documents</h3>
            {documents.map((doc) => (
              <Card key={doc.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.fileName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{doc.type.replace("_", " ")}</p>
                    </div>
                  </div>
                  {doc.status === "pending" && (
                    <div className="flex items-center gap-2 text-amber-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-xs">Verifying...</span>
                    </div>
                  )}
                  {doc.status === "verified" && (
                    <div className="flex items-center gap-2 text-green-500">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs">Verified</span>
                    </div>
                  )}
                  {doc.status === "rejected" && (
                    <div className="flex items-center gap-2 text-destructive">
                      <XCircle className="h-4 w-4" />
                      <span className="text-xs">Rejected</span>
                    </div>
                  )}
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
  if (lower.includes("passport")) return "passport";
  if (lower.includes("license") || lower.includes("driver")) return "drivers_license";
  if (lower.includes("utility") || lower.includes("bill")) return "utility_bill";
  return "other";
}
