import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const ManualTransferCard = () => {
  return (
    <div className="bg-card rounded-lg p-8 shadow-[var(--shadow-card)] text-center">
      <h3 className="text-xl font-display font-semibold text-foreground mb-2">
        Make a Manual Transfer
      </h3>
      <p className="text-muted-foreground mb-6">
        Move money to your savings goals anytime
      </p>
      <Link to="/pots">
        <Button className="w-full sm:w-auto">
          Transfer
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
};
