import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const INVOICE_STATUSES = ["draft", "sent", "paid", "overdue", "cancelled"];

export function InvoiceTracking({ businessProfileId }: { businessProfileId: string }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: "",
    invoice_type: "payable",
    amount: "",
    status: "draft",
    issue_date: new Date().toISOString().split('T')[0],
    due_date: "",
    description: "",
    notes: "",
    vendor_id: "",
  });

  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('invoices')
        .select('*, vendors(vendor_name)')
        .eq('user_id', user.id)
        .order('due_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('invoices')
        .insert({
          business_profile_id: businessProfileId,
          invoice_number: data.invoice_number,
          invoice_type: data.invoice_type,
          amount: parseFloat(data.amount),
          status: data.status as any,
          issue_date: data.issue_date,
          due_date: data.due_date,
          description: data.description,
          notes: data.notes,
          vendor_id: data.vendor_id || null,
        } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['business-stats'] });
      toast.success("Invoice added successfully");
      setOpen(false);
      setFormData({
        invoice_number: "",
        invoice_type: "payable",
        amount: "",
        status: "draft",
        issue_date: new Date().toISOString().split('T')[0],
        due_date: "",
        description: "",
        notes: "",
        vendor_id: "",
      });
    },
    onError: (error) => {
      toast.error(`Failed to add invoice: ${error.message}`);
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'overdue': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'sent': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalReceivable = invoices?.filter(i => i.invoice_type === 'receivable').reduce((sum, inv) => sum + parseFloat(inv.amount.toString()), 0) || 0;
  const totalPayable = invoices?.filter(i => i.invoice_type === 'payable').reduce((sum, inv) => sum + parseFloat(inv.amount.toString()), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Receivable (AR)</p>
            <p className="text-2xl font-bold text-green-600">${totalReceivable.toFixed(2)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Payable (AP)</p>
            <p className="text-2xl font-bold text-red-600">${totalPayable.toFixed(2)}</p>
          </Card>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Invoice</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              createInvoice.mutate(formData);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice_number">Invoice Number *</Label>
                  <Input
                    id="invoice_number"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="invoice_type">Type *</Label>
                  <Select value={formData.invoice_type} onValueChange={(value) => setFormData({ ...formData, invoice_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receivable">Receivable (AR)</SelectItem>
                      <SelectItem value="payable">Payable (AP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVOICE_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="issue_date">Issue Date *</Label>
                  <Input
                    id="issue_date"
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="due_date">Due Date *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="vendor_id">Vendor</Label>
                  <Select value={formData.vendor_id} onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors?.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.vendor_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <Button type="submit" disabled={createInvoice.isPending}>
                {createInvoice.isPending ? "Adding..." : "Add Invoice"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">Loading invoices...</p>
          </Card>
        ) : invoices?.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">No invoices yet. Add your first invoice to get started.</p>
          </Card>
        ) : (
          invoices?.map((invoice) => (
            <Card key={invoice.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-orbital bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{invoice.invoice_number}</h3>
                      <Badge variant="outline" className={getStatusColor(invoice.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(invoice.status)}
                          {invoice.status}
                        </span>
                      </Badge>
                      <Badge variant={invoice.invoice_type === 'receivable' ? 'default' : 'secondary'}>
                        {invoice.invoice_type === 'receivable' ? 'AR' : 'AP'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {invoice.vendors?.vendor_name || 'No vendor'} • Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                    </p>
                    {invoice.description && (
                      <p className="text-sm mt-2">{invoice.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${parseFloat(invoice.amount.toString()).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{invoice.currency}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
