import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, GripVertical, Edit, Trash2, Palette } from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";
import { motion, Reorder, useMotionValue } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/motion-variants";
import { useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface EnhancedCategoryManagerProps {
  categories: any[];
  onAddCategory?: (category: any) => void;
  onUpdateCategory?: (id: string, updates: any) => void;
  onDeleteCategory?: (id: string) => void;
  onReorderCategories?: (categories: any[]) => void;
}

const ICON_OPTIONS = ['shopping-cart', 'utensils', 'car', 'home', 'heart', 'briefcase', 'gift', 'plane'];
const COLOR_OPTIONS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'
];

export function EnhancedCategoryManager({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories
}: EnhancedCategoryManagerProps) {
  const prefersReducedMotion = useReducedMotion();
  const [orderedCategories, setOrderedCategories] = useState(categories);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: 'shopping-cart',
    color: '#3b82f6',
    code: ''
  });

  const handleReorder = (newOrder: any[]) => {
    setOrderedCategories(newOrder);
    onReorderCategories?.(newOrder);
  };

  const handleAddCategory = () => {
    if (!newCategory.name) return;
    
    const categoryData = {
      ...newCategory,
      code: newCategory.name.toLowerCase().replace(/\s+/g, '_'),
      is_custom: true
    };
    
    onAddCategory?.(categoryData);
    setShowAddDialog(false);
    setNewCategory({ name: '', icon: 'shopping-cart', color: '#3b82f6', code: '' });
  };

  const CategoryCard = ({ category, index }: { category: any; index: number }) => {
    const y = useMotionValue(0);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.02 }}
        className="group"
      >
        <Card className="p-4 hover:shadow-lg transition-all cursor-move backdrop-blur-sm bg-card/80 border-border/50">
          <div className="flex items-center gap-3">
            {!prefersReducedMotion && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            
            <CategoryIcon
              icon={category.icon}
              color={category.color}
              size={40}
            />
            
            <div className="flex-1">
              <h4 className="font-medium text-foreground">{category.name}</h4>
              {category.is_custom && (
                <span className="text-xs text-muted-foreground">Custom</span>
              )}
            </div>
            
            {category.is_custom && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => setEditingCategory(category)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive"
                  onClick={() => onDeleteCategory?.(category.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Budget Categories</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Drag to reorder • Click to edit custom categories
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid with Drag to Reorder */}
      {!prefersReducedMotion ? (
        <Reorder.Group
          axis="y"
          values={orderedCategories}
          onReorder={handleReorder}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {orderedCategories.map((category, index) => (
            <Reorder.Item key={category.id} value={category}>
              <CategoryCard category={category} index={index} />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orderedCategories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      )}

      {/* Add/Edit Category Dialog */}
      <Dialog open={showAddDialog || !!editingCategory} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingCategory(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Custom Category'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                value={editingCategory ? editingCategory.name : newCategory.name}
                onChange={(e) => editingCategory 
                  ? setEditingCategory({ ...editingCategory, name: e.target.value })
                  : setNewCategory({ ...newCategory, name: e.target.value })
                }
                placeholder="e.g., Entertainment"
              />
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-4 gap-2">
                {ICON_OPTIONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => editingCategory
                      ? setEditingCategory({ ...editingCategory, icon })
                      : setNewCategory({ ...newCategory, icon })
                    }
                    className={`p-3 rounded-lg border-2 transition-all ${
                      (editingCategory ? editingCategory.icon : newCategory.icon) === icon
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <CategoryIcon 
                      icon={icon} 
                      color={editingCategory ? editingCategory.color : newCategory.color}
                      size={32}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    onClick={() => editingCategory
                      ? setEditingCategory({ ...editingCategory, color })
                      : setNewCategory({ ...newCategory, color })
                    }
                    className={`h-12 rounded-lg border-2 transition-all ${
                      (editingCategory ? editingCategory.color : newCategory.color) === color
                        ? 'border-primary scale-110'
                        : 'border-border hover:border-primary/50'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingCategory(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editingCategory) {
                    onUpdateCategory?.(editingCategory.id, editingCategory);
                    setEditingCategory(null);
                  } else {
                    handleAddCategory();
                  }
                }}
                className="flex-1"
              >
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
