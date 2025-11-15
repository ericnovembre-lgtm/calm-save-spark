import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

interface Supporter {
  id: string;
  name: string;
  avatar?: string;
}

interface SupporterAvatarsProps {
  supporters: Supporter[];
  maxVisible?: number;
  className?: string;
}

/**
 * Orbiting supporter avatars with hover effects
 */
export const SupporterAvatars = ({ 
  supporters, 
  maxVisible = 5,
  className = '' 
}: SupporterAvatarsProps) => {
  const visibleSupporters = supporters.slice(0, maxVisible);
  const remainingCount = Math.max(0, supporters.length - maxVisible);

  if (supporters.length === 0) return null;

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center -space-x-2">
        {visibleSupporters.map((supporter, index) => (
          <motion.div
            key={supporter.id}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              delay: index * 0.1,
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
            whileHover={{ 
              scale: 1.2, 
              zIndex: 10,
              transition: { duration: 0.2 }
            }}
            className="relative"
          >
            <Avatar className="w-8 h-8 border-2 border-background ring-1 ring-primary/20">
              <AvatarImage src={supporter.avatar} alt={supporter.name} />
              <AvatarFallback className="text-xs">
                {supporter.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Tooltip on hover */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              whileHover={{ opacity: 1, y: -35 }}
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            >
              <div className="bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg">
                {supporter.name}
              </div>
            </motion.div>
          </motion.div>
        ))}

        {remainingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: maxVisible * 0.1,
              type: 'spring',
            }}
            className="relative"
          >
            <Avatar className="w-8 h-8 border-2 border-background ring-1 ring-primary/20 bg-muted">
              <AvatarFallback className="text-xs font-semibold">
                +{remainingCount}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="ml-3 flex items-center gap-1 text-xs text-muted-foreground"
      >
        <Users className="w-3 h-3" />
        <span>
          {supporters.length} {supporters.length === 1 ? 'supporter' : 'supporters'}
        </span>
      </motion.div>
    </div>
  );
};
