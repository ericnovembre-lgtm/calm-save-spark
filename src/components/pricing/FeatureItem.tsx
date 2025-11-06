import { Check, Lock } from 'lucide-react';
import { FreemiumFeature } from '@/lib/constants';

interface FeatureItemProps {
  feature: FreemiumFeature;
  isUnlocked: boolean;
  index: number;
}

export default function FeatureItem({ feature, isUnlocked, index }: FeatureItemProps) {
  return (
    <div 
      className={`flex items-start space-x-3 p-3 rounded-lg transition-all ${
        isUnlocked 
          ? 'bg-primary/10 border border-primary/20' 
          : 'bg-muted/50 border border-border'
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {isUnlocked ? (
          <Check className="w-5 h-5 text-primary" />
        ) : (
          <Lock className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className={`font-medium ${
            isUnlocked ? 'text-foreground' : 'text-muted-foreground'
          }`}>
            {feature.name}
          </h3>
          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            ${index + 1}
          </span>
        </div>
        <p className={`text-sm mt-1 ${
          isUnlocked ? 'text-foreground/70' : 'text-muted-foreground'
        }`}>
          {feature.description}
        </p>
      </div>
    </div>
  );
}
