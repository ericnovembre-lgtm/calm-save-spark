import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, BookOpen, TrendingUp, Users, GraduationCap, Briefcase, Home, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BudgetTemplatesLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: any) => void;
}

const TEMPLATE_ICONS = {
  student: GraduationCap,
  family: Users,
  freelancer: Briefcase,
  couple: Home,
  individual: TrendingUp,
  default: BookOpen,
};

export function BudgetTemplatesLibrary({ isOpen, onClose, onSelect }: BudgetTemplatesLibraryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch all templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['budget_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_templates')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: isOpen,
  });

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      onClose();
      toast.success(`Using ${selectedTemplate.name} template`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Budget Templates Library
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Templates Grid */}
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {templates.map((template) => {
                  const Icon = TEMPLATE_ICONS[template.income_level as keyof typeof TEMPLATE_ICONS] || TEMPLATE_ICONS.default;
                  const isSelected = selectedTemplate?.id === template.id;
                  
                  return (
                    <Card
                      key={template.id}
                      className={`p-4 cursor-pointer transition-all hover:border-primary ${
                        isSelected ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold">{template.name}</h3>
                            {template.income_level && (
                              <Badge variant="outline" className="text-xs">
                                {template.income_level}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}

                {templates.length === 0 && (
                  <Card className="p-8 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No templates available yet</p>
                  </Card>
                )}
              </div>
            </ScrollArea>

            {/* Template Preview */}
            <div className="border-l pl-4">
              {selectedTemplate ? (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{selectedTemplate.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                      {selectedTemplate.income_level && (
                        <Badge className="mt-2">{selectedTemplate.income_level}</Badge>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Category Distribution</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedTemplate.category_percentages as Record<string, number>).map(([category, percentage]) => (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-sm capitalize">{category.replace('_', ' ')}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium w-12 text-right">{percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleUseTemplate}
                      className="w-full gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Use This Template
                    </Button>
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex items-center justify-center h-[500px]">
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a template to preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
