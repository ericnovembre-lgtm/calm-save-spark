import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportOptions {
  jobId: string;
  exportType: 'transactions' | 'budgets' | 'goals' | 'tax_report' | 'full_backup';
  format: 'csv' | 'json' | 'pdf';
  dateRangeStart?: string;
  dateRangeEnd?: string;
  filters?: Record<string, any>;
}

function generateCSV(data: any[], columns?: string[]): string {
  if (data.length === 0) return '';
  
  const headers = columns || Object.keys(data[0]);
  const headerRow = headers.join(',');
  
  const dataRows = data.map(row => 
    headers.map(col => {
      const value = row[col];
      if (value === null || value === undefined) return '';
      const str = String(value);
      // Escape quotes and wrap in quotes if contains comma/newline/quote
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  );
  
  return [headerRow, ...dataRows].join('\n');
}

function generateJSON(data: any[]): string {
  return JSON.stringify(data, null, 2);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const options: ExportOptions = await req.json();
    const { jobId, exportType, format, dateRangeStart, dateRangeEnd, filters } = options;

    console.log(`Generating export job ${jobId} for user ${user.id}: ${exportType} as ${format}`);

    // Update job status
    await supabase
      .from('export_jobs')
      .update({ status: 'processing' })
      .eq('id', jobId);

    let exportData: any[] = [];
    let fileName = '';

    // Fetch data based on export type
    switch (exportType) {
      case 'transactions': {
        let query = supabase
          .from('transactions')
          .select('transaction_date, amount, merchant, category, is_recurring, notes')
          .eq('user_id', user.id)
          .order('transaction_date', { ascending: false });

        if (dateRangeStart) {
          query = query.gte('transaction_date', dateRangeStart);
        }
        if (dateRangeEnd) {
          query = query.lte('transaction_date', dateRangeEnd);
        }
        if (filters?.category) {
          query = query.eq('category', filters.category);
        }

        const { data, error } = await query;
        if (error) throw error;
        exportData = data || [];
        fileName = `transactions_${dateRangeStart || 'all'}_${dateRangeEnd || 'now'}`;
        break;
      }

      case 'budgets': {
        const { data, error } = await supabase
          .from('user_budgets')
          .select('category, total_limit, period, is_active, created_at')
          .eq('user_id', user.id);

        if (error) throw error;
        exportData = data || [];
        fileName = 'budgets';
        break;
      }

      case 'goals': {
        const { data, error } = await supabase
          .from('goals')
          .select('name, target_amount, current_amount, deadline, is_active, created_at')
          .eq('user_id', user.id);

        if (error) throw error;
        exportData = data || [];
        fileName = 'goals';
        break;
      }

      case 'tax_report': {
        // Aggregate transactions by category for tax purposes
        const year = dateRangeStart?.substring(0, 4) || new Date().getFullYear().toString();
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const { data, error } = await supabase
          .from('transactions')
          .select('transaction_date, amount, merchant, category')
          .eq('user_id', user.id)
          .gte('transaction_date', startDate)
          .lte('transaction_date', endDate)
          .order('category')
          .order('transaction_date');

        if (error) throw error;
        exportData = data || [];
        fileName = `tax_report_${year}`;
        break;
      }

      case 'full_backup': {
        // Comprehensive backup of all user data
        const [transactions, budgets, goals, pots, debts] = await Promise.all([
          supabase.from('transactions').select('*').eq('user_id', user.id),
          supabase.from('user_budgets').select('*').eq('user_id', user.id),
          supabase.from('goals').select('*').eq('user_id', user.id),
          supabase.from('pots').select('*').eq('user_id', user.id),
          supabase.from('debts').select('*').eq('user_id', user.id),
        ]);

        exportData = [{
          exported_at: new Date().toISOString(),
          transactions: transactions.data || [],
          budgets: budgets.data || [],
          goals: goals.data || [],
          pots: pots.data || [],
          debts: debts.data || [],
        }];
        fileName = 'full_backup';
        break;
      }

      default:
        throw new Error(`Unknown export type: ${exportType}`);
    }

    // Generate file content
    let content: string;
    let mimeType: string;
    let extension: string;

    switch (format) {
      case 'csv':
        content = exportType === 'full_backup' 
          ? generateJSON(exportData) // Full backup always JSON
          : generateCSV(exportData);
        mimeType = 'text/csv';
        extension = exportType === 'full_backup' ? 'json' : 'csv';
        break;
      case 'json':
        content = generateJSON(exportData);
        mimeType = 'application/json';
        extension = 'json';
        break;
      case 'pdf':
        // PDF generation would require additional library
        // For now, generate JSON and note PDF not yet supported
        content = generateJSON(exportData);
        mimeType = 'application/json';
        extension = 'json';
        break;
      default:
        throw new Error(`Unknown format: ${format}`);
    }

    const finalFileName = `${fileName}_${new Date().toISOString().split('T')[0]}.${extension}`;
    const filePath = `exports/${user.id}/${finalFileName}`;

    // Ensure exports bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const exportsBucket = buckets?.find(b => b.name === 'exports');
    
    if (!exportsBucket) {
      await supabase.storage.createBucket('exports', {
        public: false,
        fileSizeLimit: 52428800, // 50MB
      });
    }

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('exports')
      .upload(filePath, new Blob([content], { type: mimeType }), {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Generate signed URL (valid for 24 hours)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('exports')
      .createSignedUrl(filePath, 86400); // 24 hours

    if (signedUrlError) {
      throw new Error(`Failed to generate download URL: ${signedUrlError.message}`);
    }

    // Update job with file info
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await supabase
      .from('export_jobs')
      .update({
        status: 'completed',
        file_url: signedUrlData.signedUrl,
        file_size: content.length,
        expires_at: expiresAt.toISOString(),
      })
      .eq('id', jobId);

    console.log(`Export complete: ${exportData.length} records, ${content.length} bytes`);

    return new Response(JSON.stringify({
      success: true,
      fileUrl: signedUrlData.signedUrl,
      fileName: finalFileName,
      recordCount: Array.isArray(exportData) ? exportData.length : 1,
      fileSize: content.length,
      expiresAt: expiresAt.toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Export error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});