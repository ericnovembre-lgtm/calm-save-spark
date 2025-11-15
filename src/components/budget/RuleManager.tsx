import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface RuleManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RuleManager({ isOpen, onClose }: RuleManagerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Auto-Categorization Rules</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Set up rules to automatically categorize transactions
            </p>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Rule
            </Button>
          </div>

          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No rules yet. Create your first rule to start auto-categorizing transactions.</p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
