import { useState } from "react";
import { Camera, TrendingUp, Target, PiggyBank, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReceiptScanner } from "./ReceiptScanner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * Quick action buttons for common mobile tasks
 * Provides fast access to key features
 */
export const QuickActionsWidget = () => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      icon: Camera,
      label: "Scan",
      color: "bg-primary/10 text-primary",
      onClick: () => setScannerOpen(true),
    },
    {
      icon: PiggyBank,
      label: "Save",
      color: "bg-success/10 text-success",
      onClick: () => navigate("/goals"),
    },
    {
      icon: Target,
      label: "Goals",
      color: "bg-accent/10 text-accent",
      onClick: () => navigate("/goals"),
    },
    {
      icon: TrendingUp,
      label: "Invest",
      color: "bg-secondary/10 text-secondary",
      onClick: () => navigate("/investments"),
    },
  ];

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
          <Zap className="w-4 h-4 text-primary" />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {actions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                variant="ghost"
                onClick={action.onClick}
                className="flex flex-col items-center gap-2 h-auto py-3 px-2 w-full"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-foreground">{action.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </Card>

      <ReceiptScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScanComplete={(data) => {
          console.log("Receipt scanned:", data);
          navigate("/transactions");
        }}
      />
    </>
  );
};
