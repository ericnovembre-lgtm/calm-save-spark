import { ProgressRing } from "@/components/ProgressRing";
import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

interface GoalProgressCardProps {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  icon?: string;
}

export const GoalProgressCard = ({ 
  name, 
  currentAmount, 
  targetAmount, 
  icon = "target" 
}: GoalProgressCardProps) => {
  const progress = (currentAmount / targetAmount) * 100;
  
  // Get the icon component dynamically
  const iconName = icon.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('') as keyof typeof Icons;
  
  const IconComponent = (Icons[iconName] || Icons.Target) as LucideIcon;

  return (
    <div className="bg-card rounded-lg p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <IconComponent className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">
              ${currentAmount.toLocaleString()} of ${targetAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      <ProgressRing progress={progress} size={100} strokeWidth={8} />
    </div>
  );
};
