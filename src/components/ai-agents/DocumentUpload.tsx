import { useState, useCallback } from 'react';
import { Upload, File, X, CheckCircle, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
  conversationId?: string;
  onUploadComplete?: (documentId: string) => void;
  className?: string;
}

export function DocumentUpload({ conversationId, onUploadComplete, className }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string; status: string }>>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        
        // Upload to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${file.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('tax-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Create document record
        const { data: docData, error: docError } = await supabase
          .from('agent_documents')
          .insert({
            user_id: user.id,
            conversation_id: conversationId,
            file_name: file.name,
            file_type: file.type,
            file_size_bytes: file.size,
            storage_path: fileName,
            analysis_status: 'pending'
          })
          .select()
          .single();

        if (docError) throw docError;

        setUploadedFiles(prev => [...prev, {
          id: docData.id,
          name: file.name,
          status: 'uploaded'
        }]);

        // Trigger analysis
        const { error: functionError } = await supabase.functions.invoke('process-document', {
          body: { documentId: docData.id }
        });

        if (functionError) {
          console.error('Analysis trigger error:', functionError);
          setUploadedFiles(prev => 
            prev.map(f => f.id === docData.id ? { ...f, status: 'analysis_failed' } : f)
          );
        } else {
          setUploadedFiles(prev => 
            prev.map(f => f.id === docData.id ? { ...f, status: 'analyzing' } : f)
          );
        }

        setUploadProgress(((i + 1) / acceptedFiles.length) * 100);
        onUploadComplete?.(docData.id);
      }

      toast.success(`Uploaded ${acceptedFiles.length} document(s)`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
        setUploadedFiles([]);
      }, 3000);
    }
  }, [conversationId, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png'],
      'text/csv': ['.csv']
    },
    maxSize: 20 * 1024 * 1024, // 20MB
    maxFiles: 5,
    disabled: uploading
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer',
          'hover:border-primary/50 hover:bg-accent/5',
          isDragActive && 'border-primary bg-accent/10',
          uploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2 text-center">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {isDragActive ? 'Drop files here' : 'Upload documents'}
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, JPG, PNG, CSV • Max 20MB • Up to 5 files
            </p>
          </div>
        </div>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uploading...</span>
            <span className="font-medium">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-accent/5 rounded-lg border"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <File className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm truncate">{file.name}</span>
                {file.status === 'analyzing' && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {file.status === 'uploaded' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => removeFile(file.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
