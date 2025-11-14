import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const skipLinks = [
  { id: 'main-content', label: 'Skip to main content' },
  { id: 'balance-card', label: 'Skip to balance' },
  { id: 'goals-section', label: 'Skip to goals' },
  { id: 'navigation', label: 'Skip to navigation' },
];

export function SkipLinks() {
  const handleSkip = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="sr-only focus-within:not-sr-only">
      <div className="fixed top-0 left-0 right-0 z-[999] bg-primary p-2 flex gap-2 justify-center">
        {skipLinks.map((link) => (
          <Button
            key={link.id}
            variant="secondary"
            size="sm"
            onClick={() => handleSkip(link.id)}
            className={cn(
              "focus:ring-4 focus:ring-primary focus:ring-offset-2",
              "transition-all duration-200"
            )}
          >
            {link.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
