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
      <div className="space-y-8">
        <div className="h-10 w-64 bg-muted animate-pulse rounded-xl" />
        <div className="flex gap-6 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-80 h-56 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Smart Recipes</h2>
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="h-12">
          <TabsTrigger value="all" className="px-6">All</TabsTrigger>
          <TabsTrigger value="savings" className="px-6">Savings</TabsTrigger>
          <TabsTrigger value="micro-savings" className="px-6">Micro-Savings</TabsTrigger>
          <TabsTrigger value="optimization" className="px-6">Optimization</TabsTrigger>
          <TabsTrigger value="protection" className="px-6">Protection</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 snap-x snap-mandatory">
        {templates?.map((template) => (
          <RecipeCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
