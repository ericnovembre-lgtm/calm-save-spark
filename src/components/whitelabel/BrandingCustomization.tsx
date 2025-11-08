import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Palette } from "lucide-react";

export function BrandingCustomization({ organizationId }: { organizationId: string }) {
  const [formData, setFormData] = useState({
    logo_url: "",
    primary_color: "#000000",
    secondary_color: "#ffffff",
    accent_color: "#007bff",
    custom_domain: "",
    favicon_url: "",
    custom_css: "",
  });

  const queryClient = useQueryClient();

  const { data: branding } = useQuery({
    queryKey: ['organization-branding', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_branding')
        .select('*')
        .eq('organization_id', organizationId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  useEffect(() => {
    if (branding) {
      setFormData({
        logo_url: branding.logo_url || "",
        primary_color: branding.primary_color || "#000000",
        secondary_color: branding.secondary_color || "#ffffff",
        accent_color: branding.accent_color || "#007bff",
        custom_domain: branding.custom_domain || "",
        favicon_url: branding.favicon_url || "",
        custom_css: branding.custom_css || "",
      });
    }
  }, [branding]);

  const saveBranding = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('organization_branding')
        .upsert({
          organization_id: organizationId,
          ...data,
        } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-branding', organizationId] });
      toast.success("Branding updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update branding: ${error.message}`);
    },
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Palette className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Brand Customization</h2>
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        saveBranding.mutate(formData);
      }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <Label htmlFor="favicon_url">Favicon URL</Label>
            <Input
              id="favicon_url"
              value={formData.favicon_url}
              onChange={(e) => setFormData({ ...formData, favicon_url: e.target.value })}
              placeholder="https://example.com/favicon.ico"
            />
          </div>

          <div>
            <Label htmlFor="primary_color">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primary_color"
                type="color"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                className="w-20"
              />
              <Input
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                placeholder="#000000"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="secondary_color">Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                id="secondary_color"
                type="color"
                value={formData.secondary_color}
                onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                className="w-20"
              />
              <Input
                value={formData.secondary_color}
                onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="accent_color">Accent Color</Label>
            <div className="flex gap-2">
              <Input
                id="accent_color"
                type="color"
                value={formData.accent_color}
                onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                className="w-20"
              />
              <Input
                value={formData.accent_color}
                onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                placeholder="#007bff"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="custom_domain">Custom Domain</Label>
            <Input
              id="custom_domain"
              value={formData.custom_domain}
              onChange={(e) => setFormData({ ...formData, custom_domain: e.target.value })}
              placeholder="app.yourdomain.com"
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="custom_css">Custom CSS</Label>
            <Textarea
              id="custom_css"
              value={formData.custom_css}
              onChange={(e) => setFormData({ ...formData, custom_css: e.target.value })}
              placeholder="/* Your custom CSS here */"
              rows={6}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={saveBranding.isPending}>
            {saveBranding.isPending ? "Saving..." : "Save Branding"}
          </Button>
          <div className="flex-1" />
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">Preview:</span>
            <div className="w-8 h-8 rounded" style={{ backgroundColor: formData.primary_color }} />
            <div className="w-8 h-8 rounded" style={{ backgroundColor: formData.secondary_color }} />
            <div className="w-8 h-8 rounded" style={{ backgroundColor: formData.accent_color }} />
          </div>
        </div>
      </form>
    </Card>
  );
}
