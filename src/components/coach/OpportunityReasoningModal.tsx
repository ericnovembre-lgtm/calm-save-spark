import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, TrendingUp, Database, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OpportunityReasoningModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: {
    title: string;
    description: string;
    type: string;
    roi: number;
  } | null;
}

export function OpportunityReasoningModal({
  isOpen,
  onClose,
  opportunity,
}: OpportunityReasoningModalProps) {
  if (!opportunity) return null;

  // Mock reasoning data - in real implementation, this would come from the AI backend
  const reasoning = {
    confidence: 87,
    dataSources: [
      "Transaction history (last 90 days)",
      "Subscription patterns",
      "Market rate comparisons",
    ],
    keyFactors: [
      `Detected recurring charge of $${Math.abs(opportunity.roi / 12).toFixed(2)}/month`,
      "Similar services offer 20-30% lower rates",
      "No usage detected in last 45 days",
    ],
    recommendation: `Based on your transaction history, this ${opportunity.type} opportunity has high confidence. Executing this action could save you approximately $${Math.abs(opportunity.roi).toLocaleString()} annually.`,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-command-surface border border-white/10 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white font-mono flex items-center gap-2">
            <Brain className="w-5 h-5 text-command-cyan" />
            AI Reasoning: {opportunity.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Confidence Score */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono text-white/60">
                Confidence Score
              </span>
              <span className="text-2xl font-bold font-mono text-command-cyan">
                {reasoning.confidence}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${reasoning.confidence}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-command-cyan to-command-violet"
              />
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-command-violet" />
              <h4 className="text-sm font-semibold font-mono text-white">
                Data Sources Analyzed
              </h4>
            </div>
            <div className="space-y-2">
              {reasoning.dataSources.map((source, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-2 text-sm text-white/70 font-mono"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-command-violet" />
                  {source}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Key Factors */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-command-amber" />
              <h4 className="text-sm font-semibold font-mono text-white">
                Key Factors Identified
              </h4>
            </div>
            <div className="space-y-2">
              {reasoning.keyFactors.map((factor, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white/80"
                >
                  {factor}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-command-cyan/10 border border-command-cyan/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-command-cyan mt-0.5 flex-shrink-0" />
              <p className="text-sm text-white/90 leading-relaxed">
                {reasoning.recommendation}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white font-mono"
          >
            Got It
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
