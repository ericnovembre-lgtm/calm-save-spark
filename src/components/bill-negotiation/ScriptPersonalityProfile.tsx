import { Target, Users, TrendingUp, Shield, Zap, Heart } from "lucide-react";

interface ScriptPersonalityProfileProps {
  variant: 'aggressive' | 'friendly' | 'data_driven';
}

const profiles = {
  aggressive: {
    color: 'text-red-400',
    bgColor: 'bg-red-950/20',
    borderColor: 'border-red-500/20',
    traits: [
      { icon: Target, text: 'Direct & Confrontational' },
      { icon: Zap, text: 'Heavy Switching Threats' },
      { icon: Shield, text: 'Early Retention Escalation' },
    ],
  },
  friendly: {
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-950/20',
    borderColor: 'border-emerald-500/20',
    traits: [
      { icon: Heart, text: 'Warm & Collaborative' },
      { icon: Users, text: 'Builds Rapport First' },
      { icon: Shield, text: 'Loyalty-Based Leverage' },
    ],
  },
  data_driven: {
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-950/20',
    borderColor: 'border-cyan-500/20',
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
    <div className={`space-y-2 p-3 ${profile.bgColor} rounded border ${profile.borderColor}`}>
      <div className={`text-xs font-semibold ${profile.color}`}>
        PERSONALITY TRAITS:
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
