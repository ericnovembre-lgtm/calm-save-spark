import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Camera, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartCategorySelector } from '@/components/budget/SmartCategorySelector';
import { useAddTransaction } from '@/hooks/useAddTransaction';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ReceiptScanner } from './ReceiptScanner';

const formSchema = z.object({
  merchant: z.string()
    .trim()
    .min(1, 'Merchant name is required')
    .max(100, 'Merchant name too long'),
  amount: z.number()
    .positive('Amount must be positive')
    .max(999999, 'Amount too large'),
  category: z.string()
    .min(1, 'Category is required'),
  transaction_date: z.date(),
  description: z.string()
    .max(500, 'Description too long')
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTransactionDialog({ isOpen, onClose }: AddTransactionDialogProps) {
  const addTransaction = useAddTransaction();
  const [receiptScannerOpen, setReceiptScannerOpen] = useState(false);
  const [scannedReceiptPath, setScannedReceiptPath] = useState<string>();
  
  const { data: categories = [] } = useQuery({
    queryKey: ['budget-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('code, name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      merchant: '',
      amount: 0,
      category: '',
      transaction_date: new Date(),
      description: '',
    },
  });

  const handleSubmit = (values: FormValues) => {
    addTransaction.mutate(
      {
        merchant: values.merchant,
        amount: -Math.abs(values.amount), // Negative for expense
        category: values.category,
        transaction_date: format(values.transaction_date, 'yyyy-MM-dd'),
        description: values.description,
        enrichment_metadata: scannedReceiptPath ? {
          manually_added: true,
          added_at: new Date().toISOString(),
          receipt_image_path: scannedReceiptPath,
          ocr_extracted: true,
        } : {
          manually_added: true,
          added_at: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          form.reset();
          setScannedReceiptPath(undefined);
          onClose();
        },
      }
    );
  };

  const handleReceiptScanComplete = (data: any) => {
    // Auto-fill form fields from OCR
    form.setValue('merchant', data.merchant);
    form.setValue('amount', Math.abs(data.amount));
    form.setValue('transaction_date', new Date(data.date));
    if (data.category) {
      form.setValue('category', data.category);
    }
    
    // Create description from line items
    if (data.items && data.items.length > 0) {
      const itemsSummary = data.items
        .map((item: any) => `${item.name} ($${item.price.toFixed(2)})`)
        .join(', ');
      form.setValue('description', itemsSummary);
    }
    
    // Store receipt image path
    setScannedReceiptPath(data.imagePath);
    setReceiptScannerOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-accent/20 to-transparent -mx-6 -mt-6 px-6 py-4">
            Add Manual Transaction
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-4">
            <FormField
              control={form.control}
              name="merchant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Merchant Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Starbucks" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <SmartCategorySelector
                    merchantName={form.watch('merchant')}
                    amount={form.watch('amount')}
                    description={form.watch('description')}
                    value={field.value}
                    onChange={field.onChange}
                    categories={categories}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transaction_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={addTransaction.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={addTransaction.isPending}
              >
                {addTransaction.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Transaction'
                )}
              </Button>
            </div>

            {/* Receipt Scanner Button */}
            <div className="pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReceiptScannerOpen(true)}
                className="w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                {scannedReceiptPath ? 'Rescan Receipt' : 'Scan Receipt'}
              </Button>
              {scannedReceiptPath && (
                <div className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3 text-success" />
                  Receipt attached
                </div>
              )}
            </div>
          </form>
        </Form>

        <ReceiptScanner
          open={receiptScannerOpen}
          onOpenChange={setReceiptScannerOpen}
          onScanComplete={handleReceiptScanComplete}
        />
      </DialogContent>
    </Dialog>
  );
}
