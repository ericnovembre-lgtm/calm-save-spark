import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: number;
}

export function CategoryIcon({ icon, color, size = 40 }: CategoryIconProps) {
  // Convert icon name to PascalCase for Lucide
  const iconName = icon.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
  
  const IconComponent = (LucideIcons as any)[iconName] as LucideIcon || LucideIcons.Tag;

  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center justify-center rounded-xl p-2.5"
      style={{
        backgroundColor: `${color}20`,
        border: `1px solid ${color}40`,
      }}
    >
      <IconComponent size={size * 0.5} style={{ color }} />
    </motion.div>
  );
}
