import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface DocumentCenterProps {
  executionId: string | null;
}

export function DocumentCenter({ executionId }: DocumentCenterProps) {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['playbook-documents', executionId],
    queryFn: async () => {
      if (!executionId) return [];
      
      const { data, error } = await supabase
        .from('playbook_documents' as any)
        .select('*')
        .eq('playbook_id', executionId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!executionId,
  });

  if (!executionId) {
    return (
      <Card className="p-12 text-center">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Select an active event to view documents</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { icon: Clock, label: 'Pending', className: 'bg-gray-500/10 text-gray-600' },
      generating: { icon: Loader2, label: 'Generating', className: 'bg-blue-500/10 text-blue-600' },
      completed: { icon: CheckCircle2, label: 'Completed', className: 'bg-green-500/10 text-green-600' },
      failed: { icon: XCircle, label: 'Failed', className: 'bg-red-500/10 text-red-600' },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  if (!documents || documents.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No documents generated yet</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {documents.map((doc) => {
        const statusConfig = getStatusConfig(doc.generation_status);
        const StatusIcon = statusConfig.icon;

        return (
          <Card key={doc.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <FileText className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold">{doc.document_name}</h4>
                  <p className="text-sm text-muted-foreground capitalize">{doc.document_type}</p>
                </div>
              </div>
              <Badge className={statusConfig.className}>
                <StatusIcon className={`w-3 h-3 mr-1 ${doc.generation_status === 'generating' ? 'animate-spin' : ''}`} />
                {statusConfig.label}
              </Badge>
            </div>

            {doc.provider && (
              <div className="text-sm mb-4">
                <span className="text-muted-foreground">Provider: </span>
                <span className="font-medium capitalize">{doc.provider}</span>
              </div>
            )}

            {doc.download_url && (
              <Button className="w-full gap-2" asChild>
                <a href={doc.download_url} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4" />
                  Download Document
                </a>
              </Button>
            )}

            {doc.generation_status === 'pending' && (
              <Button variant="outline" className="w-full">
                Generate Document
              </Button>
            )}
          </Card>
        );
      })}
    </div>
  );
}
