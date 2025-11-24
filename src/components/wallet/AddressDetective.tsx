import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface AddressDetectiveProps {
  result?: {
    isValid: boolean;
    type?: string;
    label?: string;
    warning?: string;
    info?: string;
  };
}

export function AddressDetective({ result }: AddressDetectiveProps) {
  if (!result) return null;

  const getIcon = () => {
    if (result.warning) return <AlertTriangle className="w-5 h-5 text-warning" />;
    if (result.isValid) return <CheckCircle2 className="w-5 h-5 text-success" />;
    return <Shield className="w-5 h-5 text-muted-foreground" />;
  };

  const getBorderColor = () => {
    if (result.warning) return "border-warning/50";
    if (result.isValid) return "border-success/50";
    return "border-border";
  };

  const getBgColor = () => {
    if (result.warning) return "bg-warning/5";
    if (result.isValid) return "bg-success/5";
    return "bg-muted/5";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-xl border-2 ${getBorderColor()} ${getBgColor()} p-4 space-y-2`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Address Detective</span>
            {result.type && (
              <span className="px-2 py-0.5 bg-accent/20 rounded text-xs font-medium">
                {result.type}
              </span>
            )}
          </div>
          
          {result.label && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Info className="w-3 h-3" />
              <span>{result.label}</span>
            </div>
          )}
          
          {result.warning && (
            <div className="text-sm text-warning font-medium">
              ⚠️ {result.warning}
            </div>
          )}
          
          {result.info && (
            <div className="text-sm text-muted-foreground">
              {result.info}
            </div>
          )}
          
          {result.isValid && !result.warning && (
            <div className="text-sm text-success">
              ✅ Valid address format
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}