import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTemplates } from "@/hooks/useTemplates";
import { RecipeCard } from "./RecipeCard";

export function SmartRecipes() {
  const [category, setCategory] = useState<string>('all');
  const { data: templates, isLoading } = useTemplates(category);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-80 h-48 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Smart Recipes</h2>
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
          <TabsTrigger value="micro-savings">Micro-Savings</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="protection">Protection</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
        {templates?.map((template) => (
          <RecipeCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
