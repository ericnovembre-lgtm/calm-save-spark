import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnsplashAttributionProps {
  photographer: string;
  photographerUrl: string;
  className?: string;
  variant?: "overlay" | "inline";
}

export const UnsplashAttribution = ({
  photographer,
  photographerUrl,
  className,
  variant = "overlay",
}: UnsplashAttributionProps) => {
  if (variant === "inline") {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        Photo by{" "}
        <a
          href={photographerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          {photographer}
        </a>{" "}
        on{" "}
        <a
          href="https://unsplash.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          Unsplash
        </a>
      </p>
    );
  }

  return (
    <a
      href={photographerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "absolute bottom-2 left-2 px-2 py-1 rounded-md",
        "bg-black/50 backdrop-blur-sm",
        "text-xs text-white/90 hover:text-white",
        "flex items-center gap-1 transition-colors",
        className
      )}
    >
      Photo by {photographer}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
};
