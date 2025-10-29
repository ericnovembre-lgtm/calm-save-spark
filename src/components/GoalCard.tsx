import { ProgressRing } from "./ProgressRing";

interface GoalCardProps {
  title: string;
  current: number;
  target: number;
  emoji?: string;
}

export const GoalCard = ({ title, current, target, emoji = "🎯" }: GoalCardProps) => {
  const progress = (current / target) * 100;
  
  return (
    <div className="bg-card rounded-lg p-6 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-soft)] hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="text-3xl mb-2">{emoji}</div>
          <h3 className="font-display font-semibold text-lg text-foreground mb-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">
            ${current.toLocaleString()} of ${target.toLocaleString()}
          </p>
        </div>
        <ProgressRing progress={progress} size={80} strokeWidth={6} />
      </div>
    </div>
  );
};
