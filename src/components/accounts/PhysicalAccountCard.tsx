import { motion } from 'framer-motion';
import { Wallet, CircleDollarSign, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import { AccountSparkline } from './AccountSparkline';
import { AccountNicknameEditor } from './AccountNicknameEditor';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Badge } from '@/components/ui/badge';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

interface PhysicalAccountCardProps {
  id: string;
  institutionName: string;
  accountType: string;
  accountMask?: string;
  balance: number;
  currency?: string;
  apy?: number;
  color?: string;
  nickname?: string | null;
  lastSynced?: string | null;
  isHovered?: boolean;
  isDragging?: boolean;
  dragHandlers?: any;
  onRegisterDropZone?: (id: string, element: HTMLElement) => void;
}

const accountTypeIcons = {
  checking: Wallet,
  savings: CircleDollarSign,
  credit_card: CreditCard,
  investment: TrendingUp,
};

const colorMap: Record<string, { border: string; bg: string; text: string }> = {
  cyan: {
    border: 'border-cyan-500/30',
    bg: 'from-cyan-500/5 to-cyan-500/10',
    text: 'text-cyan-500',
  },
  rose: {
    border: 'border-rose-500/30',
    bg: 'from-rose-500/5 to-rose-500/10',
    text: 'text-rose-500',
  },
  violet: {
    border: 'border-violet-500/30',
    bg: 'from-violet-500/5 to-violet-500/10',
    text: 'text-violet-500',
  },
};

export const PhysicalAccountCard = ({
  id,
  institutionName,
  accountType,
  accountMask,
  balance,
  currency = 'USD',
  apy = 0.01,
  color = 'cyan',
  nickname,
  lastSynced,
  isHovered,
  isDragging,
  dragHandlers,
  onRegisterDropZone,
}: PhysicalAccountCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const queryClient = useQueryClient();
  const Icon = accountTypeIcons[accountType as keyof typeof accountTypeIcons] || Wallet;
  const colorTheme = colorMap[color] || colorMap.cyan;

  const isStagnant = accountType === 'checking' && balance > 3000 && apy < 1;

  return (
    <motion.div
      ref={(el) => el && onRegisterDropZone?.(id, el)}
      {...dragHandlers}
      className={`
        group relative rounded-xl p-6 bg-gradient-to-br ${colorTheme.bg}
        border-2 ${isHovered ? 'border-primary' : colorTheme.border}
        backdrop-blur-glass cursor-grab active:cursor-grabbing
        ${isDragging ? 'shadow-glass-elevated scale-105 z-50' : 'shadow-glass'}
        transition-all duration-200
      `}
      whileHover={prefersReducedMotion ? {} : { 
        scale: 1.03, 
        rotateZ: 2,
      }}
      whileTap={prefersReducedMotion ? {} : { 
        scale: 0.98 
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${colorTheme.bg}`}>
            <Icon className={`w-5 h-5 ${colorTheme.text}`} />
          </div>
          <div className="flex-1">
            <AccountNicknameEditor
              accountId={id}
              currentNickname={nickname}
              institutionName={institutionName}
              onUpdate={() => queryClient.invalidateQueries({ queryKey: ['connected_accounts'] })}
            />
            <p className="text-sm text-muted-foreground capitalize">
              {accountType.replace('_', ' ')}
              {accountMask && ` •••• ${accountMask}`}
            </p>
            {lastSynced && (
              <p className="text-xs text-muted-foreground mt-1">
                Synced {formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>

        {apy > 1 && (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            {apy.toFixed(2)}% APY
          </Badge>
        )}
      </div>

      {/* Balance */}
      <div className="mb-4">
        <p className="text-3xl font-bold text-foreground tabular-nums">
          {currency === 'USD' ? '$' : currency}{' '}
          {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Sparkline */}
      <div className="mb-4">
        <AccountSparkline accountId={id} color={colorTheme.text.replace('text-', 'hsl(var(--')} />
      </div>

      {/* Stagnant warning */}
      {isStagnant && (
        <div className="flex items-center gap-2 text-xs text-warning">
          <AlertCircle className="w-3 h-3" />
          <span>Low interest — Consider moving to savings</span>
        </div>
      )}
    </motion.div>
  );
};