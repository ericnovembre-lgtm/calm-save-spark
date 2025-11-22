import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, RotateCcw, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLogicBlockBuilder } from "@/hooks/useLogicBlockBuilder";
import { BlockPalette } from "./BlockPalette";
import { Canvas } from "./Canvas";
import { supabase } from "@/integrations/supabase/client";

interface LogicBlockBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

export function LogicBlockBuilder({ open, onOpenChange, onSave }: LogicBlockBuilderProps) {
  const { toast } = useToast();
  const [ruleName, setRuleName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const {
    blocks,
    connections,
    selectedBlock,
    connectingFrom,
    addBlock,
    updateBlockPosition,
    removeBlock,
    addConnection,
    startConnecting,
    cancelConnecting,
    setSelectedBlock,
    validateRule,
    exportToJSON,
    reset,
  } = useLogicBlockBuilder();

  const handleSelectBlock = (template: any) => {
    const position = {
      x: 300 + Math.random() * 100,
      y: 150 + Math.random() * 100,
    };
    addBlock(template, position);
  };

  const handleSave = async () => {
    if (!ruleName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your automation rule",
        variant: "destructive",
      });
      return;
    }

    const validation = validateRule();
    if (!validation.valid) {
      toast({
        title: "Invalid rule",
        description: validation.error || "Please check your automation logic",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const ruleJSON = exportToJSON();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('automation_rules')
        .insert([{
          user_id: user.id,
          rule_name: ruleName,
          rule_type: 'advanced_logic',
          trigger_condition: ruleJSON.trigger_condition as any,
          action_config: ruleJSON.action_config as any,
          metadata: {
            conditions: ruleJSON.conditions,
            blocks: blocks,
            connections: connections,
          } as any,
          is_active: true,
        }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your automation rule has been created",
      });

      reset();
      setRuleName("");
      onOpenChange(false);
      onSave?.();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Failed to save",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (blocks.length > 0) {
      if (confirm("Are you sure you want to clear the canvas?")) {
        reset();
        setRuleName("");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-border/50 bg-slate-950/50">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">Logic Block Builder</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={blocks.length === 0}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="rule-name" className="text-sm">Automation Name</Label>
              <Input
                id="rule-name"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="e.g., Smart Coffee Tax Rule"
                className="mt-1"
              />
            </div>
          </DialogHeader>

          {/* Main Content */}
          <div className="flex-1 grid grid-cols-12 gap-4 p-6 overflow-hidden">
            {/* Left: Trigger Palette */}
            <div className="col-span-2 overflow-y-auto pr-2 custom-scrollbar">
              <BlockPalette type="trigger" onSelectBlock={handleSelectBlock} />
            </div>

            {/* Center: Canvas */}
            <div className="col-span-7 overflow-hidden">
              <Canvas
                blocks={blocks}
                connections={connections}
                selectedBlock={selectedBlock}
                connectingFrom={connectingFrom}
                onBlockDragEnd={updateBlockPosition}
                onBlockRemove={removeBlock}
                onBlockSelect={setSelectedBlock}
                onStartConnect={startConnecting}
                onCompleteConnect={(toId) => {
                  if (connectingFrom) {
                    addConnection(connectingFrom, toId);
                  }
                }}
                onCancelConnect={cancelConnecting}
              />
            </div>

            {/* Right: Condition & Action Palettes */}
            <div className="col-span-3 overflow-y-auto pr-2 custom-scrollbar space-y-6">
              <BlockPalette type="condition" onSelectBlock={handleSelectBlock} />
              <BlockPalette type="action" onSelectBlock={handleSelectBlock} />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/50 bg-slate-950/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>
                {blocks.filter(b => b.type === 'trigger').length} trigger •{' '}
                {blocks.filter(b => b.type === 'condition').length} condition •{' '}
                {blocks.filter(b => b.type === 'action').length} action
              </span>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving || !ruleName.trim() || blocks.length === 0}
              className="min-w-[120px]"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Rule"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
