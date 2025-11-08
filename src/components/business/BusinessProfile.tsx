import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

export function BusinessProfile() {
  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "",
    tax_id: "",
    address: "",
    phone: "",
    email: "",
  });

  const queryClient = useQueryClient();

  const createProfile = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('business_profiles')
        .insert(data as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile'] });
      toast.success("Business profile created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create profile: ${error.message}`);
    },
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Create Business Profile</h2>
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        createProfile.mutate(formData);
      }} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="business_name">Business Name *</Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="business_type">Business Type</Label>
            <Input
              id="business_type"
              value={formData.business_type}
              onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
              placeholder="e.g., LLC, Corporation"
            />
          </div>

          <div>
            <Label htmlFor="tax_id">Tax ID / EIN</Label>
            <Input
              id="tax_id"
              value={formData.tax_id}
              onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
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

          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>

        <Button type="submit" disabled={createProfile.isPending}>
          {createProfile.isPending ? "Creating..." : "Create Business Profile"}
        </Button>
      </form>
    </Card>
  );
}
