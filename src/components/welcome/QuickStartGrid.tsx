import { Target, Link as LinkIcon, Zap, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface QuickStartTileProps {
  icon: React.ReactNode;
  title: string;
  href: string;
}

const QuickStartTile = ({ icon, title, href }: QuickStartTileProps) => (
  <Link to={href} className="block">
    <Button
      variant="outline"
      className="w-full h-auto flex-col gap-3 p-6 hover:bg-accent transition-all"
    >
      <div className="text-foreground">{icon}</div>
      <span className="font-medium text-foreground">{title}</span>
    </Button>
  </Link>
);

export const QuickStartGrid = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <QuickStartTile
        icon={<Target className="w-8 h-8" />}
        title="Create Goal"
        href="/goals"
      />
      <QuickStartTile
        icon={<LinkIcon className="w-8 h-8" />}
        title="Link Account"
        href="/accounts"
      />
      <QuickStartTile
        icon={<Zap className="w-8 h-8" />}
        title="Set Automation"
        href="/automations"
      />
      <QuickStartTile
        icon={<BookOpen className="w-8 h-8" />}
        title="Read Docs"
        href="/docs"
      />
    </div>
  );
};
