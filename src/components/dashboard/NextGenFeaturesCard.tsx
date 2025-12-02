import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Gamepad2, 
  BarChart3, 
  MapPin, 
  RefreshCw, 
  FileText, 
  Coins 
} from "lucide-react";

const nextGenFeatures = [
  {
    title: "LifeSim Game",
    description: "Learn finance through simulation",
    icon: Gamepad2,
    route: "/lifesim",
    status: "beta" as const,
    color: "text-purple-600"
  },
  {
    title: "Investment Manager",
    description: "Autonomous portfolio optimization",
    icon: BarChart3,
    route: "/investment-manager",
    status: "beta" as const,
    color: "text-green-600"
  },
  {
    title: "Life Planner",
    description: "Automated life milestone management",
    icon: MapPin,
    route: "/life-planner",
    status: "beta" as const,
    color: "text-blue-600"
  },
  {
    title: "Refinancing Hub",
    description: "Proactive loan optimization",
    icon: RefreshCw,
    route: "/refinancing-hub",
    status: "beta" as const,
    color: "text-orange-600"
  },
  {
    title: "Business-of-One",
    description: "Freelancer financial OS",
    icon: FileText,
    route: "/business-os",
    status: "beta" as const,
    color: "text-indigo-600"
  },
  {
    title: "DeFi Manager",
    description: "Automated yield optimization",
    icon: Coins,
    route: "/defi-manager",
    status: "beta" as const,
    color: "text-yellow-600"
  }
];

export function NextGenFeaturesCard() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Next-Gen Features</span>
          <Badge variant="secondary">New</Badge>
        </CardTitle>
        <CardDescription>
          AI-powered autonomous financial tools
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {nextGenFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Button
                key={feature.route}
                variant="outline"
                className="h-auto justify-start p-4 hover:bg-accent"
                onClick={() => navigate(feature.route)}
              >
                <div className="flex items-start gap-3 w-full">
                  <Icon className={`h-5 w-5 mt-0.5 ${feature.color}`} />
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{feature.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {feature.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
