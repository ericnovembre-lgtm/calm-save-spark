import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { motion } from "framer-motion";

interface AutopilotToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function AutopilotToggle({ enabled, onToggle }: AutopilotToggleProps) {
  const [showDialog, setShowDialog] = useState(false);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      setShowDialog(true);
    } else {
      onToggle(false);
    }
  };

  const confirmEnable = () => {
    onToggle(true);
    setShowDialog(false);
  };

  return (
    <>
      <div className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
        <motion.div
          animate={{
            scale: enabled ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: enabled ? Infinity : 0,
          }}
        >
          <Bot className={`w-5 h-5 ${enabled ? 'text-cyan-400' : 'text-slate-500'}`} />
        </motion.div>
        
        <Label htmlFor="autopilot" className="flex-1 cursor-pointer">
          <div className="font-medium text-sm text-foreground">AI Autopilot</div>
          <div className="text-xs text-muted-foreground">
            {enabled ? 'Agent assigned' : 'Let AI negotiate for you'}
          </div>
        </Label>
        
        <Switch
          id="autopilot"
          checked={enabled}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-cyan-500"
        />
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-slate-900 border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              Enable AI Autopilot?
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-4">
              <p>
                Our AI agent will negotiate on your behalf using proven tactics and real-time competitor data.
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5" />
                  <span>Automated negotiation calls</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5" />
                  <span>Real-time competitor pricing analysis</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5" />
                  <span>Average success rate: 87%</span>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mt-4">
                <p className="text-sm text-amber-200">
                  <strong>Success Fee:</strong> 30% of achieved savings (only if we succeed)
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmEnable}
              className="bg-cyan-600 hover:bg-cyan-500"
            >
              Enable Autopilot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
