import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Building2, CheckCircle, Clock, XCircle } from "lucide-react";

export function SCorpSetup() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    entity_type: "s_corp",
    state: "",
    annual_revenue_estimate: "",
  });

  const { data: registrations } = useQuery({
    queryKey: ["business-registrations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("business_registrations" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createRegistration = useMutation({
    mutationFn: async (registration: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("business_registrations" as any)
        .insert({
          user_id: user.id,
          ...registration,
          annual_revenue_estimate: parseFloat(registration.annual_revenue_estimate),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-registrations"] });
      toast.success("S-Corp registration initiated!");
      setFormData({ entity_type: "s_corp", state: "", annual_revenue_estimate: "" });
    },
    onError: (error: Error) => {
      toast.error(`Failed to start registration: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRegistration.mutate(formData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Start S-Corp Registration
          </CardTitle>
          <CardDescription>
            Register your business entity through Stripe Atlas with guided setup and compliance support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="entity_type">Entity Type</Label>
              <Select
                value={formData.entity_type}
                onValueChange={(value) => setFormData({ ...formData, entity_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="s_corp">S Corporation</SelectItem>
                  <SelectItem value="c_corp">C Corporation</SelectItem>
                  <SelectItem value="llc">LLC</SelectItem>
                  <SelectItem value="sole_prop">Sole Proprietorship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State of Incorporation</Label>
              <Input
                id="state"
                placeholder="e.g., Delaware"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenue">Estimated Annual Revenue ($)</Label>
              <Input
                id="revenue"
                type="number"
                placeholder="100000"
                value={formData.annual_revenue_estimate}
                onChange={(e) => setFormData({ ...formData, annual_revenue_estimate: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={createRegistration.isPending}>
              {createRegistration.isPending ? "Starting..." : "Start Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {registrations && registrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Registration History</CardTitle>
            <CardDescription>Track your business registration applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {registrations.map((reg: any) => (
                <div key={reg.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{reg.entity_type.toUpperCase()} - {reg.state}</p>
                    <p className="text-sm text-muted-foreground">
                      Applied {new Date(reg.created_at).toLocaleDateString()}
                    </p>
                    {reg.ein && <p className="text-sm">EIN: {reg.ein}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(reg.registration_status)}
                    <span className="text-sm capitalize">{reg.registration_status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
