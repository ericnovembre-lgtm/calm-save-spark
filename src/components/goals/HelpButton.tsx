import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface HelpButtonProps {
  onShowShortcuts: () => void;
  onResetTour: () => void;
}

export const HelpButton = ({ onShowShortcuts, onResetTour }: HelpButtonProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Help menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onShowShortcuts}>
          <span>Keyboard Shortcuts</span>
          <span className="ml-auto text-xs text-muted-foreground">?</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onResetTour}>
          Restart Tour
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="https://docs.example.com" target="_blank" rel="noopener noreferrer">
            Documentation
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
