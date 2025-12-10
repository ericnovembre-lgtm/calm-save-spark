import { Crown, Star, Shield, Award } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type BadgeType = 'admin' | 'moderator' | 'top_contributor' | 'verified' | 'newcomer';

interface ForumUserBadgeProps {
  type: BadgeType;
  size?: 'sm' | 'md';
}

const badgeConfig: Record<BadgeType, { icon: typeof Crown; label: string; color: string }> = {
  admin: {
    icon: Crown,
    label: 'Admin',
    color: 'text-amber-500',
  },
  moderator: {
    icon: Shield,
    label: 'Moderator',
    color: 'text-blue-500',
  },
  top_contributor: {
    icon: Award,
    label: 'Top Contributor',
    color: 'text-purple-500',
  },
  verified: {
    icon: Star,
    label: 'Verified Member',
    color: 'text-green-500',
  },
  newcomer: {
    icon: Star,
    label: 'Newcomer',
    color: 'text-muted-foreground',
  },
};

export function ForumUserBadge({ type, size = 'md' }: ForumUserBadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`inline-flex ${config.color}`}>
          <Icon className={sizeClasses} />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{config.label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
