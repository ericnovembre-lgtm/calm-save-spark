import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, Sparkles, Target, TrendingUp, ShoppingBag } from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";
import { fadeInUp } from "@/lib/motion-variants";

interface CreateBudgetWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  categories: any[];
}

const BUDGET_TEMPLATES = [
  {
    id: 'custom',
    name: 'Custom Budget',
    icon: Target,
    description: 'Create your own budget from scratch',
    categories: {}
  },
  {
    id: '50-30-20',
    name: '50/30/20 Rule',
    icon: TrendingUp,
    description: '50% needs, 30% wants, 20% savings',
    allocations: { needs: 50, wants: 30, savings: 20 }
  },
  {
    id: 'zero-based',
    name: 'Zero-Based Budget',
    icon: Sparkles,
    description: 'Every dollar has a purpose',
    allocations: { essential: 60, lifestyle: 25, savings: 15 }
  },
  {
    id: 'envelope',
    name: 'Envelope Method',
    icon: ShoppingBag,
    description: 'Allocate specific amounts per category',
    allocations: { groceries: 30, dining: 15, entertainment: 10, transportation: 20, misc: 25 }
  }
];

export function CreateBudgetWizard({ isOpen, onClose, onSave, categories }: CreateBudgetWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    period: 'monthly',
    total_limit: 0,
    template: 'custom',
    category_limits: {} as Record<string, number>
  });

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      await onSave({
        ...formData,
        is_active: true
      });
      onClose();
      // Reset form
      setFormData({ 
        name: '', 
        period: 'monthly', 
        total_limit: 0, 
        template: 'custom',
        category_limits: {} 
      });
      setStep(1);
    } catch (error) {
      console.error('Error creating budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const selectedTemplate = BUDGET_TEMPLATES.find(t => t.id === formData.template);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-all ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Template Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-4 py-4"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-foreground">Choose a Template</h3>
                <p className="text-sm text-muted-foreground">Start with a proven budgeting method</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {BUDGET_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setFormData({ ...formData, template: template.id })}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.template === template.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <template.icon className={`w-8 h-8 mb-2 ${
                      formData.template === template.id ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <h4 className="font-semibold text-foreground text-sm">{template.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                  </button>
                ))}
              </div>

              <Button onClick={nextStep} className="w-full mt-6">
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Basic Info */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-4 py-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Budget Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Monthly Budget"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Period</Label>
                <Select
                  value={formData.period}
                  onValueChange={(value) => setFormData({ ...formData, period: value })}
                >
                  <SelectTrigger id="period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={prevStep} className="flex-1">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={nextStep} className="flex-1" disabled={!formData.name}>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Set Total Amount */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6 py-4"
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Set Your Total Budget</h3>
                <p className="text-sm text-muted-foreground">
                  Drag the slider or type an amount
                </p>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    ${formData.total_limit.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">per {formData.period}</p>
                </div>

                <Slider
                  value={[formData.total_limit]}
                  onValueChange={([value]) => setFormData({ ...formData, total_limit: value })}
                  max={10000}
                  step={50}
                  className="py-4"
                />

                <div className="flex gap-2">
                  {[1000, 2500, 5000, 7500].map(amount => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, total_limit: amount })}
                      className="flex-1"
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>

                <Input
                  type="number"
                  value={formData.total_limit || ''}
                  onChange={(e) => setFormData({ ...formData, total_limit: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter custom amount"
                  className="text-center text-lg"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={prevStep} className="flex-1">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={nextStep} className="flex-1" disabled={formData.total_limit <= 0}>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Category Allocation */}
          {step === 4 && (
            <motion.div
              key="step4"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-4 py-4"
            >
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Allocate by Category</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate?.name} allocation
                </p>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {categories.slice(0, 5).map((category, index) => {
                  const suggestedPercentage = selectedTemplate?.allocations 
                    ? Object.values(selectedTemplate.allocations)[index] || 20
                    : 20;
                  const suggestedAmount = (formData.total_limit * suggestedPercentage) / 100;

                  return (
                    <div key={category.id} className="p-3 rounded-lg bg-muted/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CategoryIcon icon={category.icon} color={category.color} size={32} />
                          <span className="font-medium text-foreground">{category.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          ${suggestedAmount.toFixed(0)}
                        </span>
                      </div>
                      <Slider
                        value={[formData.category_limits[category.code] || suggestedAmount]}
                        onValueChange={([value]) => setFormData({
                          ...formData,
                          category_limits: {
                            ...formData.category_limits,
                            [category.code]: value
                          }
                        })}
                        max={formData.total_limit}
                        step={10}
                        className="py-2"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={prevStep} className="flex-1" disabled={loading}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Budget'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
