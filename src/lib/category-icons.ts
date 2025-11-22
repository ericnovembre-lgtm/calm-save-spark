import {
  ShoppingCart,
  Utensils,
  Car,
  Home,
  Heart,
  Zap,
  Wifi,
  Plane,
  GraduationCap,
  ShoppingBag,
  Smartphone,
  Coffee,
  Film,
  Dumbbell,
  Package,
  type LucideIcon,
} from 'lucide-react';

/**
 * Category Icon Mapping
 * Maps transaction categories to their corresponding Lucide icons
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  // Shopping & Retail
  shopping: ShoppingCart,
  retail: ShoppingBag,
  groceries: ShoppingCart,
  
  // Food & Dining
  'food & dining': Utensils,
  restaurants: Utensils,
  'fast food': Coffee,
  coffee: Coffee,
  
  // Transportation
  transportation: Car,
  gas: Car,
  'auto & transport': Car,
  
  // Housing
  housing: Home,
  'home & garden': Home,
  rent: Home,
  
  // Healthcare
  healthcare: Heart,
  medical: Heart,
  pharmacy: Heart,
  
  // Utilities
  utilities: Zap,
  electricity: Zap,
  water: Zap,
  
  // Internet & Phone
  internet: Wifi,
  phone: Smartphone,
  mobile: Smartphone,
  
  // Travel
  travel: Plane,
  vacation: Plane,
  airlines: Plane,
  
  // Education
  education: GraduationCap,
  'books & supplies': GraduationCap,
  
  // Entertainment
  entertainment: Film,
  movies: Film,
  streaming: Film,
  
  // Fitness
  fitness: Dumbbell,
  gym: Dumbbell,
  sports: Dumbbell,
  
  // Other
  other: Package,
  miscellaneous: Package,
  uncategorized: Package,
};

/**
 * Get icon for a transaction category
 * Returns default icon if category not found
 */
export function getCategoryIcon(category: string): LucideIcon {
  const normalizedCategory = category.toLowerCase().trim();
  return CATEGORY_ICONS[normalizedCategory] || Package;
}

/**
 * Get color class for category badge
 * Uses semantic tokens for theme compatibility
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    shopping: 'bg-primary/10 text-primary border-primary/20',
    'food & dining': 'bg-accent/10 text-accent border-accent/20',
    transportation: 'bg-secondary/10 text-secondary border-secondary/20',
    utilities: 'bg-muted/20 text-muted-foreground border-muted/30',
    entertainment: 'bg-primary/10 text-primary border-primary/20',
    healthcare: 'bg-destructive/10 text-destructive border-destructive/20',
  };
  
  const normalizedCategory = category.toLowerCase().trim();
  return colors[normalizedCategory] || 'bg-muted/10 text-muted-foreground border-muted/20';
}

