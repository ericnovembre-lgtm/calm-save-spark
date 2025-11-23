import { Target, Users, TrendingUp, Shield, Zap, Heart } from "lucide-react";

interface ScriptPersonalityProfileProps {
  variant: 'aggressive' | 'friendly' | 'data_driven';
}

const profiles = {
  aggressive: {
    color: 'text-warning',
    bgColor: 'bg-warning/5',
    borderColor: 'border-warning/20',
    traits: [
      { icon: Target, text: 'Direct & Results-Focused' },
      { icon: Zap, text: 'Emphasizes Competition' },
      { icon: Shield, text: 'Escalates Strategically' },
    ],
  },
  friendly: {
    color: 'text-success',
    bgColor: 'bg-success/5',
    borderColor: 'border-success/20',
    traits: [
      { icon: Heart, text: 'Warm & Collaborative' },
      { icon: Users, text: 'Builds Rapport First' },
      { icon: Shield, text: 'Loyalty-Based Leverage' },
    ],
  },
  data_driven: {
    color: 'text-accent',
    bgColor: 'bg-accent/5',
    borderColor: 'border-accent/20',
    traits: [
      { icon: TrendingUp, text: 'Logical & Methodical' },
      { icon: Target, text: 'Market Data Focus' },
      { icon: Zap, text: 'Cost-Benefit Analysis' },
    ],
  },
};

export function ScriptPersonalityProfile({ variant }: ScriptPersonalityProfileProps) {
  const profile = profiles[variant];

  return (
    <div className={`space-y-2 p-3 rounded-xl ${profile.bgColor} border ${profile.borderColor}`}>
      <div className={`text-xs font-semibold uppercase tracking-wide ${profile.color}`}>
        Personality Traits
      </div>
      <div className="space-y-1">
        {profile.traits.map((trait, idx) => {
          const Icon = trait.icon;
          return (
            <div key={idx} className="flex items-center gap-2 text-xs text-foreground">
              <Icon className={`w-3 h-3 ${profile.color}`} />
              <span>{trait.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
