import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

export function OrganizationSetup() {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    plan_type: "basic",
  });

  const queryClient = useQueryClient();

  const createOrganization = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('organizations')
        .insert(data as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-organization'] });
      toast.success("Organization created successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to create organization: ${error.message}`);
    },
  });

  const handleSlugChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setFormData({ ...formData, name, slug });
  };

  return (
    <Card className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Create Organization</h2>
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        createOrganization.mutate(formData);
      }} className="space-y-4">
        <div>
          <Label htmlFor="name">Organization Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="Acme Financial"
            required
          />
        </div>

        <div>
          <Label htmlFor="slug">Organization Slug *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="acme-financial"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Used in URLs and API endpoints
          </p>
        </div>

        <div>
          <Label htmlFor="plan_type">Plan Type *</Label>
          <Select value={formData.plan_type} onValueChange={(value) => setFormData({ ...formData, plan_type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={createOrganization.isPending}>
          {createOrganization.isPending ? "Creating..." : "Create Organization"}
        </Button>
      </form>
    </Card>
  );
}
