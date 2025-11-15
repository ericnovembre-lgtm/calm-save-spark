import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Plus, Download, Settings, PieChart, BarChart3, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion-variants";
import { soundEffects } from "@/lib/sound-effects";

interface BudgetHeaderProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onCreateBudget: () => void;
  onExport: () => void;
  onManageRules: () => void;
  budgetCount: number;
}

export function BudgetHeader({
  activeView,
  onViewChange,
  onCreateBudget,
  onExport,
  onManageRules,
  budgetCount
}: BudgetHeaderProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'categories', label: 'Categories', icon: Filter }
  ];

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
            <PieChart className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Smart Budgets</h1>
            <p className="text-muted-foreground mt-1">
              Track spending across {budgetCount} budget{budgetCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              soundEffects.click();
              onManageRules();
            }}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Auto-Categorize
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              soundEffects.click();
              onExport();
            }}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <MagneticButton
            onClick={() => {
              soundEffects.success();
              onCreateBudget();
            }}
            className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
            magneticRadius={100}
            strength={0.4}
          >
            <Plus className="w-5 h-5" />
            New Budget
          </MagneticButton>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-border">
        {tabs.map(tab => (
          <motion.button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
              activeView === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
