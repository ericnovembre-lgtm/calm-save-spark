import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, AlertTriangle, Check, Loader2, Sparkles } from "lucide-react";
import { useImportTransactions } from "@/hooks/useImportTransactions";
import { format } from "date-fns";

interface ImportTransactionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedTransaction {
  transaction_date: string;
  merchant: string;
  amount: number;
  category: string;
  description: string;
  isAutoCategorized?: boolean;
  isDuplicate?: boolean;
}

// Category inference based on merchant keywords
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Groceries': ['walmart', 'target', 'costco', 'safeway', 'kroger', 'whole foods', 'trader joe', 'aldi', 'publix', 'grocery', 'market'],
  'Dining': ['restaurant', 'starbucks', 'mcdonald', 'chipotle', 'subway', 'pizza', 'uber eats', 'doordash', 'grubhub', 'cafe', 'coffee', 'diner', 'grill'],
  'Transportation': ['uber', 'lyft', 'shell', 'chevron', 'exxon', 'gas', 'fuel', 'parking', 'transit', 'metro', 'bus'],
  'Entertainment': ['netflix', 'spotify', 'hulu', 'disney', 'amazon prime', 'hbo', 'apple music', 'steam', 'xbox', 'playstation', 'movie', 'theater', 'cinema'],
  'Utilities': ['electric', 'water', 'gas bill', 'internet', 'comcast', 'verizon', 'at&t', 't-mobile', 'sprint', 'utility'],
  'Shopping': ['amazon', 'ebay', 'best buy', 'apple', 'nike', 'adidas', 'zara', 'h&m', 'nordstrom', 'macys', 'shop'],
  'Healthcare': ['cvs', 'walgreens', 'pharmacy', 'doctor', 'medical', 'dental', 'hospital', 'clinic', 'health', 'gym', 'fitness'],
  'Travel': ['airline', 'delta', 'united', 'american air', 'southwest', 'hotel', 'marriott', 'hilton', 'airbnb', 'booking', 'expedia'],
};

function inferCategory(merchant: string): { category: string; isAutoCategorized: boolean } {
  const lowerMerchant = merchant.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerMerchant.includes(keyword))) {
      return { category, isAutoCategorized: true };
    }
  }
  
  return { category: 'Other', isAutoCategorized: false };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
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

function parseAmount(value: string, debit?: string, credit?: string): number {
  // Handle debit/credit columns
  if (debit !== undefined && credit !== undefined) {
    const debitNum = parseFloat(debit.replace(/[$,]/g, '')) || 0;
    const creditNum = parseFloat(credit.replace(/[$,]/g, '')) || 0;
    return creditNum > 0 ? creditNum : -debitNum;
  }
  
  // Handle single amount column
  const cleanValue = value.replace(/[$,]/g, '').trim();
  const num = parseFloat(cleanValue);
  return isNaN(num) ? 0 : num;
}

function parseDate(dateStr: string): string {
  const cleanDate = dateStr.trim();
  
  // Try various date formats
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/,  // YYYY-MM-DD
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY
    /^(\d{2})-(\d{2})-(\d{4})$/,   // MM-DD-YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/, // M/D/YY or M/D/YYYY
  ];
  
  for (const fmt of formats) {
    const match = cleanDate.match(fmt);
    if (match) {
      if (fmt === formats[0]) {
        return cleanDate; // Already ISO format
      }
      const [, m, d, y] = match;
      const year = y.length === 2 ? `20${y}` : y;
      return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  
  // Fallback: try Date.parse
  const parsed = new Date(cleanDate);
  if (!isNaN(parsed.getTime())) {
    return format(parsed, 'yyyy-MM-dd');
  }
  
  return format(new Date(), 'yyyy-MM-dd');
}

function parseCSV(content: string): ParsedTransaction[] {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headerLine = lines[0].toLowerCase();
  const headers = parseCSVLine(headerLine);
  
  // Detect column indices
  const dateIdx = headers.findIndex(h => h.includes('date'));
  const merchantIdx = headers.findIndex(h => h.includes('merchant') || h.includes('description') || h.includes('name') || h.includes('payee'));
  const amountIdx = headers.findIndex(h => h === 'amount' || h.includes('amount'));
  const categoryIdx = headers.findIndex(h => h.includes('category'));
  const descIdx = headers.findIndex(h => h.includes('memo') || h.includes('note') || (h.includes('description') && merchantIdx !== headers.indexOf(h)));
  const debitIdx = headers.findIndex(h => h.includes('debit') || h.includes('withdrawal'));
  const creditIdx = headers.findIndex(h => h.includes('credit') || h.includes('deposit'));
  
  const transactions: ParsedTransaction[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 2) continue;
    
    const merchant = values[merchantIdx] || values[1] || 'Unknown';
    const { category: inferredCategory, isAutoCategorized } = inferCategory(merchant);
    
    let amount: number;
    if (debitIdx !== -1 && creditIdx !== -1) {
      amount = parseAmount('', values[debitIdx], values[creditIdx]);
    } else if (amountIdx !== -1) {
      amount = parseAmount(values[amountIdx]);
    } else {
      amount = parseAmount(values[2] || '0');
    }
    
    transactions.push({
      transaction_date: parseDate(values[dateIdx] || values[0] || ''),
      merchant: merchant,
      amount: amount,
      category: values[categoryIdx] || inferredCategory,
      description: values[descIdx] || '',
      isAutoCategorized: !values[categoryIdx] && isAutoCategorized,
    });
  }
  
  return transactions;
}

export function ImportTransactionsDialog({ isOpen, onClose }: ImportTransactionsDialogProps) {
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [parseError, setParseError] = useState<string>('');
  
  const { mutate: importTransactions, isPending } = useImportTransactions();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    setFileName(file.name);
    setParseError('');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const transactions = parseCSV(content);
        
        if (transactions.length === 0) {
          setParseError('No valid transactions found in the file. Please check the format.');
          return;
        }
        
        setParsedTransactions(transactions);
      } catch (error) {
        setParseError('Failed to parse file. Please ensure it\'s a valid CSV.');
      }
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
  });

  const handleImport = () => {
    const transactionsToImport = parsedTransactions.map(t => ({
      transaction_date: t.transaction_date,
      merchant: t.merchant,
      amount: t.amount,
      category: t.category,
      description: t.description,
    }));
    
    importTransactions(transactionsToImport, {
      onSuccess: () => {
        setParsedTransactions([]);
        setFileName('');
        onClose();
      },
    });
  };

  const handleClose = () => {
    setParsedTransactions([]);
    setFileName('');
    setParseError('');
    onClose();
  };

  const autoCategorizedCount = parsedTransactions.filter(t => t.isAutoCategorized).length;
  const totalExpenses = parsedTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalIncome = parsedTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Import Transactions
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to import transactions. Supports bank exports, Mint, and standard CSV formats.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {parsedTransactions.length === 0 ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-foreground font-medium">
                {isDragActive ? 'Drop the file here' : 'Drop CSV file here or click to browse'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Supports: Standard CSV, Bank Exports, Mint format
              </p>
              {parseError && (
                <p className="text-sm text-destructive mt-4 flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {parseError}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{fileName}</span>
                  <Badge variant="secondary">{parsedTransactions.length} transactions</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setParsedTransactions([])}>
                  Change file
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/30 p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Expenses</p>
                  <p className="text-lg font-semibold text-destructive">-${totalExpenses.toFixed(2)}</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Income</p>
                  <p className="text-lg font-semibold text-emerald-500">+${totalIncome.toFixed(2)}</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Auto-categorized
                  </p>
                  <p className="text-lg font-semibold">{autoCategorizedCount}</p>
                </div>
              </div>

              <ScrollArea className="flex-1 border rounded-lg">
                <div className="p-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Date</th>
                        <th className="text-left p-2 font-medium">Merchant</th>
                        <th className="text-right p-2 font-medium">Amount</th>
                        <th className="text-left p-2 font-medium">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedTransactions.slice(0, 100).map((t, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="p-2 text-muted-foreground">{t.transaction_date}</td>
                          <td className="p-2 truncate max-w-[200px]">{t.merchant}</td>
                          <td className={`p-2 text-right font-medium ${t.amount < 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                            {t.amount < 0 ? '-' : '+'}${Math.abs(t.amount).toFixed(2)}
                          </td>
                          <td className="p-2">
                            <Badge variant={t.isAutoCategorized ? "default" : "secondary"} className="text-xs">
                              {t.isAutoCategorized && <Sparkles className="w-3 h-3 mr-1" />}
                              {t.category}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedTransactions.length > 100 && (
                    <p className="text-center text-sm text-muted-foreground py-2">
                      Showing first 100 of {parsedTransactions.length} transactions
                    </p>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {parsedTransactions.length > 0 && (
            <Button onClick={handleImport} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Import {parsedTransactions.length} Transactions
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
