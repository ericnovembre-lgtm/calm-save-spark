import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe2, MapPin } from "lucide-react";

interface Program {
  id: string;
  name: string;
  type: 'federal' | 'state' | 'local' | 'ngo';
  description: string;
  participants: number;
  status: 'active' | 'pilot' | 'coming-soon';
}

const programs: Program[] = [
  {
    id: 'fed-1',
    name: 'Federal Financial Literacy Initiative',
    type: 'federal',
    description: 'Nationwide program for underserved communities',
    participants: 50000,
    status: 'active',
  },
  {
    id: 'state-1',
    name: 'California Youth Financial Education',
    type: 'state',
    description: 'State-funded program for high school students',
    participants: 12000,
    status: 'active',
  },
  {
    id: 'local-1',
    name: 'NYC Community Banking Access',
    type: 'local',
    description: 'Local initiative for immigrant families',
    participants: 3500,
    status: 'pilot',
  },
  {
    id: 'ngo-1',
    name: 'Global Financial Inclusion Project',
    type: 'ngo',
    description: 'International NGO partnership program',
    participants: 75000,
    status: 'active',
  },
];

export function ProgramSelector() {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'federal': return <Building2 className="h-4 w-4" />;
      case 'state': return <MapPin className="h-4 w-4" />;
      case 'local': return <MapPin className="h-4 w-4" />;
      case 'ngo': return <Globe2 className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pilot': return 'bg-yellow-500';
      case 'coming-soon': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Program Selector</CardTitle>
        <CardDescription>Choose or create a financial literacy program</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a program type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="federal">Federal Programs</SelectItem>
              <SelectItem value="state">State Programs</SelectItem>
              <SelectItem value="local">Local Programs</SelectItem>
              <SelectItem value="ngo">NGO Partnerships</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {programs.map((program) => (
            <div
              key={program.id}
              className="border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getTypeIcon(program.type)}</div>
                  <div>
                    <div className="font-medium">{program.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {program.description}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {program.participants.toLocaleString()} participants
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={getStatusColor(program.status)}>
                  {program.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
