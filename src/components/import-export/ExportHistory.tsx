import { motion } from 'framer-motion';
import { Download, Trash2, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useExportJobs, type ExportJob } from '@/hooks/useExportJobs';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-500',
  processing: 'bg-blue-500/10 text-blue-500',
  completed: 'bg-green-500/10 text-green-500',
  failed: 'bg-red-500/10 text-red-500',
};

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  processing: Clock,
  completed: CheckCircle,
  failed: XCircle,
};

export function ExportHistory() {
  const { jobs, isLoading, deleteJob } = useExportJobs();

  const handleDownload = (job: ExportJob) => {
    if (job.file_url) {
      // For blob URLs created during export
      const a = document.createElement('a');
      a.href = job.file_url;
      a.download = `export-${job.export_type}-${format(new Date(job.created_at), 'yyyy-MM-dd')}.${job.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Export History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No exports yet</p>
            <p className="text-sm">Your export history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job, index) => {
              const StatusIcon = statusIcons[job.status] || Clock;

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">
                        {job.export_type.replace('_', ' ')}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{format(new Date(job.created_at), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span className="uppercase">{job.format}</span>
                        {job.file_size && (
                          <>
                            <span>•</span>
                            <span>{(job.file_size / 1024).toFixed(1)} KB</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={cn('gap-1', statusColors[job.status])}>
                      <StatusIcon className="w-3 h-3" />
                      {job.status}
                    </Badge>

                    {job.status === 'completed' && job.file_url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(job)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteJob.mutate(job.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
