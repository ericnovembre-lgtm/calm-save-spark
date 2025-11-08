import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Users, Mail, Phone } from "lucide-react";

export function VendorManagement({ businessProfileId }: { businessProfileId: string }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    vendor_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    payment_terms: "",
    notes: "",
  });

  const queryClient = useQueryClient();

  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createVendor = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('vendors')
        .insert({
          business_profile_id: businessProfileId,
          ...data,
        } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['business-stats'] });
      toast.success("Vendor added successfully");
      setOpen(false);
      setFormData({
        vendor_name: "",
        contact_person: "",
        email: "",
        phone: "",
        address: "",
        payment_terms: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error(`Failed to add vendor: ${error.message}`);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Vendor</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              createVendor.mutate(formData);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendor_name">Vendor Name *</Label>
                  <Input
                    id="vendor_name"
                    value={formData.vendor_name}
                    onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="payment_terms">Payment Terms</Label>
                  <Input
                    id="payment_terms"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    placeholder="e.g., Net 30"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <Button type="submit" disabled={createVendor.isPending}>
                {createVendor.isPending ? "Adding..." : "Add Vendor"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">Loading vendors...</p>
          </Card>
        ) : vendors?.length === 0 ? (
          <Card className="p-6 col-span-full">
            <p className="text-center text-muted-foreground">No vendors yet. Add your first vendor to get started.</p>
          </Card>
        ) : (
          vendors?.map((vendor) => (
            <Card key={vendor.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-orbital bg-primary/10">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{vendor.vendor_name}</h3>
                      {vendor.contact_person && (
                        <p className="text-sm text-muted-foreground">{vendor.contact_person}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={vendor.is_active ? "default" : "secondary"}>
                    {vendor.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  {vendor.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  )}
                  {vendor.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.payment_terms && (
                    <div className="text-muted-foreground">
                      Terms: {vendor.payment_terms}
                    </div>
                  )}
                </div>

                {vendor.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{vendor.notes}</p>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
