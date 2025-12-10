import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

interface CombinedNetWorthCardProps {
  myNetWorth: number;
  partnerNetWorth: number;
}

export function CombinedNetWorthCard({ myNetWorth, partnerNetWorth }: CombinedNetWorthCardProps) {
  const combined = myNetWorth + partnerNetWorth;
  const myPercent = combined > 0 ? (myNetWorth / combined) * 100 : 50;
  const partnerPercent = combined > 0 ? (partnerNetWorth / combined) * 100 : 50;

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Users className="w-5 h-5" />
          Combined Net Worth
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <p className="text-4xl font-bold text-foreground">
            ${combined.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            Combined household wealth
          </p>
        </motion.div>
        
        {/* Split visualization */}
        <div className="space-y-2">
          <div className="flex h-4 rounded-full overflow-hidden bg-muted">
            <div 
              className="bg-primary transition-all"
              style={{ width: `${myPercent}%` }}
            />
            <div 
              className="bg-secondary transition-all"
              style={{ width: `${partnerPercent}%` }}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <p className="text-muted-foreground">You</p>
              <p className="font-semibold text-foreground">${myNetWorth.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{myPercent.toFixed(0)}%</p>
            </div>
            <div className="text-center p-3 bg-secondary/10 rounded-lg">
              <p className="text-muted-foreground">Partner</p>
              <p className="font-semibold text-foreground">${partnerNetWorth.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{partnerPercent.toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
