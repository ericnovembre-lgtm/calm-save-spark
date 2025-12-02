import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HelpCircle, History } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useWhatsNew } from "@/hooks/useWhatsNew";
import { Badge } from "@/components/ui/badge";

interface HelpButtonProps {
  onResetTour: () => void;
}

export const HelpButton = ({ onResetTour }: HelpButtonProps) => {
  const navigate = useNavigate();
  const { openWhatsNew, hasNewUpdates } = useWhatsNew();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <HelpCircle className="h-5 w-5" />
          {hasNewUpdates && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full" />
          )}
          <span className="sr-only">Help menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={openWhatsNew} className="flex items-center gap-2">
          <span>What's New</span>
          {hasNewUpdates && (
            <Badge variant="default" className="ml-auto text-[10px] px-1.5 py-0">
              NEW
            </Badge>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/changelog')}>
          <History className="w-4 h-4 mr-2" />
          <span>Changelog</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
