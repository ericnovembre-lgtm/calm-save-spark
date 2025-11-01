import { Button } from "@/components/ui/button";
import { Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const AutoSaveBanner = () => {
  return (
    <div className="bg-foreground rounded-lg p-6 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-background" fill="currentColor" />
        </div>
        <div>
          <h3 className="text-background font-semibold">Auto-Save is Active</h3>
          <p className="text-background/80 text-sm">Saving automatically based on your rules</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Link to="/automations">
          <Button variant="outline" className="bg-background/10 text-background border-background/20 hover:bg-background/20">
            Adjust Rules
          </Button>
        </Link>
        <Link to="/transactions">
          <Button className="bg-background text-foreground hover:bg-background/90">
            View Activity
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
