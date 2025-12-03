import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Search, Download, Eye, Trash2, Upload, 
  PieChart, BarChart3, TrendingUp, Calendar, Filter,
  ChevronDown, ChevronUp, Sparkles, Clock, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ModelAttributionBadge, ModelBadgeInline } from '@/components/tax/ModelAttributionBadge';
import { ConfidenceGauge, ConfidenceBar } from '@/components/tax/ConfidenceGauge';
import { ExtractionResultsCard } from '@/components/tax/ExtractionResultsCard';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TaxDocument {
  id: string;
  document_type: string;
  tax_year: number;
  file_url: string;
  storage_path: string;
  processing_status: string;
  parsed_data: Record<string, any> | null;
  created_at: string;
}

export default function TaxDocumentAnalysis() {
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'confidence' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDocument, setSelectedDocument] = useState<TaxDocument | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['tax-documents-analysis'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tax_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TaxDocument[];
    },
  });

  // Calculate statistics
  const stats = {
    total: documents?.length || 0,
    avgConfidence: documents?.reduce((sum, doc) => {
      const conf = (doc.parsed_data as any)?.confidence || 0;
      return sum + conf;
    }, 0) / (documents?.length || 1) || 0,
    gpt5Count: documents?.filter(doc => 
      (doc.parsed_data as any)?.model_used?.toLowerCase().includes('gpt')
    ).length || 0,
    geminiCount: documents?.filter(doc => 
      (doc.parsed_data as any)?.model_used?.toLowerCase().includes('gemini')
    ).length || 0,
  };

  // Get unique years and types for filters
  const years = [...new Set(documents?.map(d => d.tax_year) || [])].sort((a, b) => b - a);
  const types = [...new Set(documents?.map(d => d.document_type) || [])];

  // Filter and sort documents
  const filteredDocuments = documents?.filter(doc => {
    if (yearFilter !== 'all' && doc.tax_year !== parseInt(yearFilter)) return false;
    if (typeFilter !== 'all' && doc.document_type !== typeFilter) return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const fileName = doc.file_url.split('/').pop()?.toLowerCase() || '';
      return fileName.includes(searchLower) || doc.document_type.toLowerCase().includes(searchLower);
    }
    return true;
  }).sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'confidence':
        comparison = ((a.parsed_data as any)?.confidence || 0) - ((b.parsed_data as any)?.confidence || 0);
        break;
      case 'type':
        comparison = a.document_type.localeCompare(b.document_type);
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  }) || [];

  const toggleRowExpand = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (doc: TaxDocument) => {
    try {
      await supabase.storage.from('tax-documents').remove([doc.storage_path]);
      await supabase.from('tax_documents').delete().eq('id', doc.id);
      toast.success('Document deleted');
      refetch();
    } catch (error: any) {
      toast.error('Failed to delete', { description: error.message });
    }
  };

  const handleDownload = async (doc: TaxDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('tax-documents')
        .download(doc.storage_path);
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_url.split('/').pop() || 'document';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error('Download failed', { description: error.message });
    }
  };

  // Upload handler
  const handleUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      for (const file of files) {
        const fileName = `${user.id}/${Date.now()}_${file.name}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('tax-documents')
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('tax-documents')
          .getPublicUrl(fileName);

        // Create document record
        const { data: docData, error: insertError } = await supabase
          .from('tax_documents')
          .insert({
            user_id: user.id,
            file_url: publicUrl,
            storage_path: fileName,
            document_type: 'unknown',
            tax_year: new Date().getFullYear(),
            processing_status: 'processing',
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Process with AI
        toast.info('Processing with GPT-5...', { id: `processing-${docData.id}` });
        
        const { error: processError } = await supabase.functions.invoke('process-tax-document', {
          body: { documentId: docData.id, fileUrl: publicUrl },
        });

        if (processError) {
          toast.error('Processing failed', { description: processError.message });
        } else {
          toast.success('Document analyzed successfully', { id: `processing-${docData.id}` });
        }
      }
      
      refetch();
      setShowUploadZone(false);
    } catch (error: any) {
      toast.error('Upload failed', { description: error.message });
    } finally {
      setIsUploading(false);
    }
  }, [refetch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    disabled: isUploading,
  });

  return (
    <AppLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header with Upload Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tax Document Analysis</h1>
            <p className="text-muted-foreground">View and analyze processed tax documents</p>
          </div>
          <Button 
            onClick={() => setShowUploadZone(!showUploadZone)}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Documents
          </Button>
        </div>

        {/* Quick Upload Zone */}
        <AnimatePresence>
          {showUploadZone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={cn(
                "border-2 border-dashed transition-colors mb-6",
                isDragActive ? "border-primary bg-primary/5" : "border-border"
              )}>
                <CardContent className="pt-6">
                  <div
                    {...getRootProps()}
                    className="flex flex-col items-center justify-center py-8 cursor-pointer"
                  >
                    <input {...getInputProps()} />
                    {isUploading ? (
                      <>
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                        <p className="text-sm text-muted-foreground">Processing with GPT-5...</p>
                      </>
                    ) : isDragActive ? (
                      <>
                        <Upload className="w-10 h-10 text-primary mb-3" />
                        <p className="text-sm font-medium text-primary">Drop files here</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                        <p className="text-sm font-medium text-foreground mb-1">
                          Drag & drop tax documents here
                        </p>
                        <p className="text-xs text-muted-foreground">
                          W-2, 1099, and other tax forms • PDF or images
                        </p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Documents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{Math.round(stats.avgConfidence)}%</p>
                  <p className="text-xs text-muted-foreground">Avg Confidence</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <FileText className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.gpt5Count}</p>
                  <p className="text-xs text-muted-foreground">GPT-5 Analyzed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Sparkles className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.geminiCount}</p>
                  <p className="text-xs text-muted-foreground">Gemini Analyzed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Model Performance Chart */}
        {stats.total > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Model Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-emerald-500" />
                  <span className="text-sm">GPT-5: {stats.gpt5Count} ({Math.round((stats.gpt5Count / stats.total) * 100)}%)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-cyan-500" />
                  <span className="text-sm">Gemini: {stats.geminiCount} ({Math.round((stats.geminiCount / stats.total) * 100)}%)</span>
                </div>
              </div>
              <div className="mt-4 h-3 rounded-full bg-muted overflow-hidden flex">
                <div 
                  className="h-full bg-emerald-500 transition-all" 
                  style={{ width: `${(stats.gpt5Count / stats.total) * 100}%` }} 
                />
                <div 
                  className="h-full bg-cyan-500 transition-all" 
                  style={{ width: `${(stats.geminiCount / stats.total) * 100}%` }} 
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map(type => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-full md:w-36">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="confidence">Confidence</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Processed Documents</CardTitle>
            <CardDescription>{filteredDocuments.length} documents found</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No documents found</h3>
                <p className="text-sm text-muted-foreground">
                  Upload tax documents to see them analyzed here
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDocuments.map((doc, idx) => {
                  const parsedData = doc.parsed_data || {};
                  const modelUsed = (parsedData as any).model_used || 'gemini-2.5-flash';
                  const confidence = (parsedData as any).confidence || 0;
                  const isExpanded = expandedRows.has(doc.id);

                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <div 
                        className={cn(
                          "border rounded-lg overflow-hidden transition-colors",
                          isExpanded ? "border-primary/50" : "border-border hover:border-primary/30"
                        )}
                      >
                        {/* Row Header */}
                        <div 
                          className="flex items-center gap-4 p-4 cursor-pointer"
                          onClick={() => toggleRowExpand(doc.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="font-medium text-foreground truncate">
                                {doc.file_url.split('/').pop() || 'Document'}
                              </span>
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded",
                                doc.processing_status === 'completed' 
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              )}>
                                {doc.processing_status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="capitalize">{doc.document_type.replace(/_/g, ' ')}</span>
                              <span>•</span>
                              <span>{doc.tax_year}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(doc.created_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <ModelBadgeInline model={modelUsed} />
                            <ConfidenceBar confidence={confidence} />
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDocument(doc);
                              }}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(doc);
                              }}>
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(doc);
                              }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-border"
                            >
                              <div className="p-4 bg-muted/30">
                                <ExtractionResultsCard
                                  documentType={doc.document_type}
                                  extractedData={parsedData}
                                  modelUsed={modelUsed}
                                  confidence={confidence}
                                  analyzedAt={(parsedData as any).processed_at}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Detail Modal */}
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Document Details
              </DialogTitle>
            </DialogHeader>
            {selectedDocument && (
              <ExtractionResultsCard
                documentType={selectedDocument.document_type}
                extractedData={selectedDocument.parsed_data || {}}
                modelUsed={(selectedDocument.parsed_data as any)?.model_used || 'gemini-2.5-flash'}
                confidence={(selectedDocument.parsed_data as any)?.confidence || 0}
                analyzedAt={(selectedDocument.parsed_data as any)?.processed_at}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
