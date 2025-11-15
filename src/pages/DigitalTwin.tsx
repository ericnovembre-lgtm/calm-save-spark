import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TwinDashboard } from "@/components/digital-twin/TwinDashboard";
import { ScenarioBuilder } from "@/components/digital-twin/ScenarioBuilder";
import { ScenarioList } from "@/components/digital-twin/ScenarioList";
import { ComparisonView } from "@/components/digital-twin/ComparisonView";

export default function DigitalTwin() {
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Personal Financial Digital Twin</h1>
          <p className="text-muted-foreground mt-2">
            Model your entire financial life and visualize the long-term impact of major decisions
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="builder">Create Scenario</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <TwinDashboard />
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <ScenarioList 
            selectedScenarios={selectedScenarios}
            onSelectionChange={setSelectedScenarios}
          />
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <Card className="p-6">
            <ScenarioBuilder />
          </Card>
        </TabsContent>

        <TabsContent value="compare" className="space-y-6">
          {selectedScenarios.length >= 2 ? (
            <ComparisonView scenarioIds={selectedScenarios} />
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                Select at least 2 scenarios from the Scenarios tab to compare them
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
