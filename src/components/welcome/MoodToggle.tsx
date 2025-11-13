import { Sun, Moon, Sunrise } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMoodBasedTheme } from "@/hooks/useMoodBasedTheme";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const MoodToggle = () => {
  const { mood, isEnabled, toggleMoodTheme } = useMoodBasedTheme();

  const getMoodIcon = () => {
    if (!isEnabled) return <Sun className="w-5 h-5" />;
    
    switch (mood) {
      case "energetic":
        return <Sunrise className="w-5 h-5" />;
      case "calm":
        return <Moon className="w-5 h-5" />;
      default:
        return <Sun className="w-5 h-5" />;
    }
  };

  const getMoodLabel = () => {
    if (!isEnabled) return "Match my vibe";
    
    switch (mood) {
      case "energetic":
        return "Energetic mode";
      case "calm":
        return "Calm mode";
      default:
        return "Neutral mode";
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMoodTheme}
            className="relative"
          >
            {getMoodIcon()}
            {isEnabled && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{getMoodLabel()}</p>
          <p className="text-xs text-muted-foreground">
            Colors adapt to time of day
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
