import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Settings } from "lucide-react";
import { useState } from "react";
import { PermissionGrantModal } from "./PermissionGrantModal";

interface AgentCardProps {
  agent: any;
  delegation?: any;
}

export function AgentCard({ agent, delegation }: AgentCardProps) {
  const [showModal, setShowModal] = useState(false);
  const isActive = delegation?.status === 'active';

  return (
    <>
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{agent.agent_name}</h3>
              <p className="text-sm text-muted-foreground capitalize">{agent.agent_type}</p>
            </div>
          </div>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{agent.description}</p>

        <Button 
          className="w-full" 
          variant={isActive ? "outline" : "default"}
          onClick={() => setShowModal(true)}
        >
          <Settings className="h-4 w-4 mr-2" />
          {isActive ? "Manage Permissions" : "Activate Agent"}
        </Button>
      </Card>

      <PermissionGrantModal
        agent={agent}
        delegation={delegation}
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
