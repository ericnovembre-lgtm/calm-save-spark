import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/motion-variants";

interface CategoryManagerProps {
  categories: any[];
  onAddCategory?: () => void;
}

export function CategoryManager({ categories, onAddCategory }: CategoryManagerProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Budget Categories</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your budget categories
          </p>
        </div>
        <Button onClick={onAddCategory} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <motion.div key={category.id} variants={fadeInUp} custom={index}>
            <Card className="p-4 hover:shadow-lg transition-all cursor-pointer backdrop-blur-sm bg-card/80 border-border/50">
              <div className="flex flex-col items-center text-center gap-3">
                <CategoryIcon
                  icon={category.icon}
                  color={category.color}
                  size={48}
                />
                <div>
                  <h4 className="font-medium text-foreground">{category.name}</h4>
                  {category.is_custom && (
                    <span className="text-xs text-muted-foreground">Custom</span>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
