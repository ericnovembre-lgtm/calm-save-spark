import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Home, Heart, UserPlus, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface SharedCategoryTemplatesProps {
  onApplyTemplate?: (categories: any[]) => void;
}

const templateIcons = {
  household: Home,
  couple: Heart,
  family: Users,
  roommates: UserPlus,
  custom: Users,
};

const defaultTemplates = {
  household: [
    { name: "Housing", percentage: 30, color: "#6366f1" },
    { name: "Groceries", percentage: 15, color: "#10b981" },
    { name: "Utilities", percentage: 10, color: "#f59e0b" },
    { name: "Transportation", percentage: 15, color: "#ef4444" },
    { name: "Savings", percentage: 20, color: "#8b5cf6" },
    { name: "Entertainment", percentage: 10, color: "#ec4899" },
  ],
  couple: [
    { name: "Shared Rent", percentage: 35, color: "#6366f1" },
    { name: "Joint Groceries", percentage: 12, color: "#10b981" },
    { name: "Date Nights", percentage: 8, color: "#ec4899" },
    { name: "Utilities Split", percentage: 10, color: "#f59e0b" },
    { name: "Joint Savings", percentage: 25, color: "#8b5cf6" },
    { name: "Personal Spending", percentage: 10, color: "#06b6d4" },
  ],
  family: [
    { name: "Housing", percentage: 30, color: "#6366f1" },
    { name: "Childcare", percentage: 15, color: "#f59e0b" },
    { name: "Groceries", percentage: 15, color: "#10b981" },
    { name: "Education", percentage: 10, color: "#8b5cf6" },
    { name: "Transportation", percentage: 10, color: "#ef4444" },
    { name: "Family Savings", percentage: 15, color: "#06b6d4" },
    { name: "Activities", percentage: 5, color: "#ec4899" },
  ],
  roommates: [
    { name: "Shared Rent", percentage: 40, color: "#6366f1" },
    { name: "Utilities Split", percentage: 15, color: "#f59e0b" },
    { name: "Shared Groceries", percentage: 10, color: "#10b981" },
    { name: "Personal Food", percentage: 10, color: "#06b6d4" },
    { name: "Personal Savings", percentage: 20, color: "#8b5cf6" },
    { name: "Personal Fun", percentage: 5, color: "#ec4899" },
  ],
};

export const SharedCategoryTemplates = ({ onApplyTemplate }: SharedCategoryTemplatesProps) => {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<keyof typeof defaultTemplates>("household");
  const [templateName, setTemplateName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["shared-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shared_category_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const createTemplateMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const categories = defaultTemplates[selectedType];
      
      const { error } = await supabase.from("shared_category_templates").insert({
        template_name: templateName || `${selectedType} template`,
        template_type: selectedType,
        categories,
        created_by: session.user.id,
        is_public: isPublic,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Template created!");
      queryClient.invalidateQueries({ queryKey: ["shared-templates"] });
      setTemplateName("");
      setIsPublic(false);
    },
    onError: () => {
      toast.error("Failed to create template");
    },
  });

  const applyTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const template = templates?.find((t) => t.id === templateId);
      if (!template) throw new Error("Template not found");

      // Ensure categories is an array
      const categories = Array.isArray(template.categories) 
        ? template.categories 
        : [];

      if (onApplyTemplate) {
        onApplyTemplate(categories);
      }
    },
    onSuccess: () => {
      toast.success("Template applied!");
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to apply template");
    },
  });

  const handleApplyBuiltIn = () => {
    const categories = defaultTemplates[selectedType];
    if (onApplyTemplate) {
      onApplyTemplate(categories);
      toast.success("Template applied!");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="w-4 h-4 mr-2" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Category Templates</DialogTitle>
          <DialogDescription>
            Use pre-built templates for common household budgeting scenarios
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Built-in Templates */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Built-in Templates</Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(defaultTemplates).map(([type, categories]) => {
                const Icon = templateIcons[type as keyof typeof templateIcons];
                return (
                  <Card
                    key={type}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedType === type ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedType(type as keyof typeof defaultTemplates)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium capitalize mb-1">{type}</h4>
                        <p className="text-xs text-muted-foreground">
                          {categories.length} categories
                        </p>
                      </div>
                      {selectedType === type && (
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Preview Selected Template */}
            {selectedType && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm font-medium">Preview:</p>
                <div className="grid grid-cols-2 gap-2">
                  {defaultTemplates[selectedType].map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{cat.name}</span>
                      <span className="font-medium">{cat.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleApplyBuiltIn} className="w-full">
              Apply {selectedType} template
            </Button>
          </div>

          {/* Save as Custom Template */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-base font-semibold">Save as Custom Template</Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template name (optional)</Label>
                <Input
                  id="template-name"
                  placeholder="My family budget"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="public"
                  checked={isPublic}
                  onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                />
                <Label htmlFor="public" className="text-sm cursor-pointer">
                  Make this template public (share with community)
                </Label>
              </div>

              <Button
                onClick={() => createTemplateMutation.mutate()}
                disabled={createTemplateMutation.isPending}
                variant="outline"
                className="w-full"
              >
                {createTemplateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save as template"
                )}
              </Button>
            </div>
          </div>

          {/* User Templates */}
          {templates && templates.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <Label className="text-base font-semibold">Your Templates</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {templates.map((template) => (
                  <Card key={template.id} className="p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{template.template_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {template.template_type}
                          {template.is_public && " • Public"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => applyTemplateMutation.mutate(template.id)}
                        disabled={applyTemplateMutation.isPending}
                      >
                        Apply
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
