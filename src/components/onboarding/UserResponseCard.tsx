import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface UserResponseCardProps {
  content: string;
}

export function UserResponseCard({ content }: UserResponseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex justify-end"
    >
      <div className={cn(
        "max-w-[80%] p-4 rounded-2xl rounded-tr-none",
        "bg-primary text-primary-foreground"
      )}>
        <p>{content}</p>
      </div>
    </motion.div>
  );
}
