import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PROTOCOLS = [
  { name: "Aave", type: "Lending", version: "v3", audited: true },
  { name: "Compound", type: "Lending", version: "v3", audited: true },
];

export function ProtocolConnector() {
  return (
    <div className="grid gap-4">
      {PROTOCOLS.map((protocol) => (
        <Card key={protocol.name}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{protocol.name} {protocol.version}</CardTitle>
              {protocol.audited && <Badge variant="default">Audited</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>Connect (Coming Soon)</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
