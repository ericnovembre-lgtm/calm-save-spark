import { Card } from "@/components/ui/card";

export function AgentPerformanceChart() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Agent Performance</h3>
      <p className="text-center text-muted-foreground py-12">
        Performance metrics will appear as agents complete tasks
      </p>
    </Card>
  );
}
