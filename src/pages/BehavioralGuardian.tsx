import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { EmotionDetectionBar } from "@/components/guardian/EmotionDetectionBar";
import { BehaviorJournal } from "@/components/guardian/BehaviorJournal";
import { GuardrailSettings } from "@/components/guardian/GuardrailSettings";
import { Shield, Brain, TrendingUp } from "lucide-react";

export default function BehavioralGuardian() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              Behavioral Finance Guardian
            </h1>
            <p className="text-muted-foreground">
              Your emotional finance shield—protect yourself from FOMO, FUD, and panic decisions
            </p>
          </div>
          <Shield className="w-12 h-12 text-primary" />
        </div>

        <EmotionDetectionBar />

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">How It Works</h3>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">1. Emotion Detection:</strong> Our AI analyzes your trading patterns, transaction sizes, and timing to detect emotional decision-making.
              </p>
              <p>
                <strong className="text-foreground">2. Smart Interventions:</strong> When risky behavior is detected, we show you data-driven counter-arguments to help you pause and think rationally.
              </p>
              <p>
                <strong className="text-foreground">3. Cooling-Off Periods:</strong> For high-risk decisions, we enforce a mandatory reflection period to protect you from impulsive trades.
              </p>
              <p>
                <strong className="text-foreground">4. Pattern Learning:</strong> Over time, we learn your emotional triggers and help you build better habits.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Common Emotional Triggers</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                <div>
                  <strong className="text-foreground">FOMO (Fear of Missing Out):</strong>
                  <p className="text-muted-foreground">Rapid buying when markets surge</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />
                <div>
                  <strong className="text-foreground">FUD (Fear, Uncertainty, Doubt):</strong>
                  <p className="text-muted-foreground">Panic selling during volatility</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5" />
                <div>
                  <strong className="text-foreground">Greed:</strong>
                  <p className="text-muted-foreground">Oversized positions chasing gains</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                <div>
                  <strong className="text-foreground">Revenge Trading:</strong>
                  <p className="text-muted-foreground">Impulsive trades after losses</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <GuardrailSettings />
        <BehaviorJournal />
      </div>
    </AppLayout>
  );
}
