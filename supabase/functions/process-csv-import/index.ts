import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedRow {
  date: string;
  amount: number;
  description: string;
  category?: string;
  merchant?: string;
}

// Bank format detection patterns
const BANK_PATTERNS = {
  chase: {
    dateColumn: ['Transaction Date', 'Posting Date'],
    amountColumn: ['Amount'],
    descriptionColumn: ['Description'],
  },
  bofa: {
    dateColumn: ['Date'],
    amountColumn: ['Amount'],
    descriptionColumn: ['Description', 'Payee'],
  },
  wellsfargo: {
    dateColumn: ['Date'],
    amountColumn: ['Amount'],
    descriptionColumn: ['Description'],
  },
  capitalone: {
    dateColumn: ['Transaction Date', 'Posted Date'],
    amountColumn: ['Debit', 'Credit', 'Amount'],
    descriptionColumn: ['Description', 'Merchant'],
  },
  generic: {
    dateColumn: ['date', 'Date', 'transaction_date', 'Transaction Date'],
    amountColumn: ['amount', 'Amount', 'value', 'Value'],
    descriptionColumn: ['description', 'Description', 'merchant', 'Merchant', 'memo', 'Memo'],
  }
};

function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map(line => parseCSVLine(line));

  return { headers, rows };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function detectBankFormat(headers: string[]): string {
  const headerSet = new Set(headers.map(h => h.toLowerCase()));
  
  for (const [bank, patterns] of Object.entries(BANK_PATTERNS)) {
    if (bank === 'generic') continue;
    
    const hasDate = patterns.dateColumn.some(col => headerSet.has(col.toLowerCase()));
    const hasAmount = patterns.amountColumn.some(col => headerSet.has(col.toLowerCase()));
    const hasDesc = patterns.descriptionColumn.some(col => headerSet.has(col.toLowerCase()));
    
    if (hasDate && hasAmount && hasDesc) {
      return bank;
    }
  }
  
  return 'generic';
}

function findColumn(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex(h => h.toLowerCase() === name.toLowerCase());
    if (index !== -1) return index;
  }
  return -1;
}

function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;
  
  // Try various date formats
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY
    /^(\d{2})-(\d{2})-(\d{4})$/, // MM-DD-YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/, // M/D/YY or M/D/YYYY
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      let year, month, day;
      if (format.source.startsWith('^(\\d{4})')) {
        [, year, month, day] = match;
      } else {
        [, month, day, year] = match;
        if (year.length === 2) {
          year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
        }
      }
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  
  // Try Date.parse as fallback
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  
  return null;
}

function parseAmount(amountStr: string): number | null {
  if (!amountStr) return null;
  
  // Remove currency symbols and commas
  const cleaned = amountStr.replace(/[$,\s]/g, '').replace(/\(([^)]+)\)/, '-$1');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? null : parsed;
}

function generateTransactionHash(row: ParsedRow): string {
  const str = `${row.date}|${row.amount}|${row.description}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
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

    const { jobId, csvContent, mappingConfig } = await req.json();

    console.log(`Processing import job ${jobId} for user ${user.id}`);

    // Parse CSV
    const { headers, rows } = parseCSV(csvContent);
    
    if (headers.length === 0 || rows.length === 0) {
      throw new Error('CSV file is empty or invalid');
    }

    // Detect bank format or use provided mapping
    const bankFormat = detectBankFormat(headers);
    const patterns = mappingConfig || BANK_PATTERNS[bankFormat as keyof typeof BANK_PATTERNS] || BANK_PATTERNS.generic;

    // Find column indices
    const dateIdx = findColumn(headers, patterns.dateColumn);
    const amountIdx = findColumn(headers, patterns.amountColumn);
    const descIdx = findColumn(headers, patterns.descriptionColumn);

    if (dateIdx === -1 || amountIdx === -1 || descIdx === -1) {
      throw new Error('Could not find required columns (date, amount, description)');
    }

    // Update job status
    await supabase
      .from('import_jobs')
      .update({ 
        status: 'processing',
        total_rows: rows.length,
        started_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Get existing transaction hashes for duplicate detection
    const { data: existingTransactions } = await supabase
      .from('transactions')
      .select('id, transaction_date, amount, merchant')
      .eq('user_id', user.id);

    const existingHashes = new Set(
      (existingTransactions || []).map(t => 
        generateTransactionHash({
          date: t.transaction_date,
          amount: t.amount,
          description: t.merchant || ''
        })
      )
    );

    // Process rows
    const parsedRows: ParsedRow[] = [];
    const errors: Array<{ row: number; error: string }> = [];
    let duplicates = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      try {
        const date = parseDate(row[dateIdx]);
        const amount = parseAmount(row[amountIdx]);
        const description = row[descIdx]?.trim();

        if (!date) {
          errors.push({ row: i + 2, error: 'Invalid date format' });
          continue;
        }
        if (amount === null) {
          errors.push({ row: i + 2, error: 'Invalid amount format' });
          continue;
        }
        if (!description) {
          errors.push({ row: i + 2, error: 'Missing description' });
          continue;
        }

        const parsed: ParsedRow = { date, amount, description };
        const hash = generateTransactionHash(parsed);

        if (existingHashes.has(hash)) {
          duplicates++;
          continue;
        }

        existingHashes.add(hash);
        parsedRows.push(parsed);
      } catch (err) {
        errors.push({ row: i + 2, error: String(err) });
      }
    }

    // Batch insert transactions
    const batchSize = 100;
    let successfulRows = 0;

    for (let i = 0; i < parsedRows.length; i += batchSize) {
      const batch = parsedRows.slice(i, i + batchSize);
      
      const transactions = batch.map(row => ({
        user_id: user.id,
        transaction_date: row.date,
        amount: row.amount,
        merchant: row.description,
        category: row.category || 'uncategorized',
        is_recurring: false,
        source: 'csv_import',
      }));

      const { error: insertError } = await supabase
        .from('transactions')
        .insert(transactions);

      if (insertError) {
        console.error('Batch insert error:', insertError);
        errors.push({ row: i, error: `Batch insert failed: ${insertError.message}` });
      } else {
        successfulRows += batch.length;
      }

      // Update progress
      await supabase
        .from('import_jobs')
        .update({
          processed_rows: Math.min(i + batchSize, parsedRows.length) + duplicates + errors.length,
          successful_rows: successfulRows,
          failed_rows: errors.length,
        })
        .eq('id', jobId);
    }

    // Finalize job
    await supabase
      .from('import_jobs')
      .update({
        status: 'completed',
        processed_rows: rows.length,
        successful_rows: successfulRows,
        failed_rows: errors.length,
        error_log: errors.slice(0, 100),
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    console.log(`Import complete: ${successfulRows} imported, ${duplicates} duplicates skipped, ${errors.length} errors`);

    return new Response(JSON.stringify({
      success: true,
      imported: successfulRows,
      duplicates,
      errors: errors.length,
      bankFormat,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Import error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});