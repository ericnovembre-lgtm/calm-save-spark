import { useState } from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AutomationTemplate } from "@/hooks/useTemplates";
import { ActivateRecipeDialog } from "./ActivateRecipeDialog";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { useAutomationSounds } from "@/hooks/useAutomationSounds";

interface RecipeCardProps {
  template: AutomationTemplate;
}

export function RecipeCard({ template }: RecipeCardProps) {
  const [showActivate, setShowActivate] = useState(false);
  const sounds = useAutomationSounds();
  
  const handleActivate = () => {
    haptics.select();
    sounds.playRecipeActivated();
    setShowActivate(true);
  };
  
  // Get icon component dynamically
  const IconComponent = template.icon ? (LucideIcons as any)[template.icon] : LucideIcons.Sparkles;

  const categoryColors = {
    savings: "bg-green-500/10 text-green-400 border-green-500/30",
    "micro-savings": "bg-amber-500/10 text-amber-400 border-amber-500/30",
    optimization: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    protection: "bg-red-500/10 text-red-400 border-red-500/30",
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        className="snap-start shrink-0 w-80"
      >
        <Card className={cn(
          "glass-panel h-full p-6 space-y-4 cursor-pointer",
          "hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
        )}>
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              {IconComponent && <IconComponent className="w-6 h-6" />}
            </div>
            <Badge variant="outline" className={categoryColors[template.category]}>
              {template.category}
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{template.name}</h3>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </div>

          {/* Mini Flow Preview */}
          <div className="flex items-center gap-2 py-3 border-t border-border/50">
            <div className="flex-1 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <LucideIcons.Zap className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-green-400 to-amber-400" />
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <LucideIcons.Target className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={handleActivate}
          >
            Activate Recipe
          </Button>
        </Card>
      </motion.div>

      <ActivateRecipeDialog
        template={template}
        open={showActivate}
        onOpenChange={setShowActivate}
      />
    </>
  );
}
