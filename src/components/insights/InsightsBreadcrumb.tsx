import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Breadcrumb {
  label: string;
  onClick: () => void;
}

interface InsightsBreadcrumbProps {
  breadcrumbs: Breadcrumb[];
}

export function InsightsBreadcrumb({ breadcrumbs }: InsightsBreadcrumbProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2 text-sm"
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <Button
            variant={index === breadcrumbs.length - 1 ? 'ghost' : 'link'}
            size="sm"
            onClick={crumb.onClick}
            disabled={index === breadcrumbs.length - 1}
            className={index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}
          >
            {crumb.label}
          </Button>
        </div>
      ))}
    </motion.nav>
  );
}
