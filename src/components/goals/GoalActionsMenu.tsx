import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Plus, Edit2, Pause, Trash2, Play } from "lucide-react";

interface GoalActionsMenuProps {
  goalId: string;
  goalName: string;
  isPaused?: boolean;
  onContribute: () => void;
  onEdit: () => void;
  onTogglePause: () => void;
  onDelete: () => void;
}

export const GoalActionsMenu = ({ 
  goalId, 
  goalName, 
  isPaused = false,
  onContribute, 
  onEdit, 
  onTogglePause,
  onDelete 
}: GoalActionsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-accent/50 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open goal actions menu for {goalName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onContribute}>
          <Plus className="mr-2 h-4 w-4" />
          Add Funds
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Edit2 className="mr-2 h-4 w-4" />
          Edit Goal
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onTogglePause}>
          {isPaused ? (
            <>
              <Play className="mr-2 h-4 w-4" />
              Resume Goal
            </>
          ) : (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Pause Goal
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Goal
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
