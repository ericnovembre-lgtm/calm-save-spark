import { TrendingUp, Target, Zap } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}

const FeatureCard = ({ icon, title, value, description }: FeatureCardProps) => (
  <div className="bg-card rounded-lg p-6 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-soft)] hover:scale-[1.02]">
    <div className="mb-4 text-foreground">{icon}</div>
    <h3 className="font-display font-semibold text-lg text-foreground mb-2">{title}</h3>
    <p className="text-3xl font-display font-bold text-foreground mb-1 tabular-nums">{value}</p>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export const FeatureHighlights = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <FeatureCard
        icon={<TrendingUp className="w-8 h-8" />}
        title="Your Balance"
        value="$3,247.85"
        description="Total saved across all goals"
      />
      <FeatureCard
        icon={<Target className="w-8 h-8" />}
        title="This Month's Savings"
        value="$245.00"
        description="Automated and manual contributions"
      />
      <FeatureCard
        icon={<Zap className="w-8 h-8" />}
        title="Active Automations"
        value="3"
        description="Rules working in the background"
      />
    </div>
  );
};
