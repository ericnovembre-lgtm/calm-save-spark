import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link2, Shield, AlertCircle, Eye, Edit, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ConnectedApp {
  id: string;
  name: string;
  icon: React.ReactNode;
  connectedDate: string;
  permissions: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

const MOCK_APPS: ConnectedApp[] = [
  {
    id: '1',
    name: 'Plaid',
    icon: <Link2 className="w-5 h-5" />,
    connectedDate: '2024-01-15',
    permissions: ['Read transactions', 'View account balance'],
    riskLevel: 'low',
  },
  {
    id: '2',
    name: 'Stripe',
    icon: <DollarSign className="w-5 h-5" />,
    connectedDate: '2024-02-20',
    permissions: ['Process payments', 'Initiate transfers'],
    riskLevel: 'high',
  },
];

export function ConnectedAppsScanner() {
  const prefersReducedMotion = useReducedMotion();

  const getRiskBadge = (level: string) => {
    const config = {
      low: {
        label: 'Low Risk',
        className: 'bg-cyber-green/20 text-cyber-green border-cyber-green/30',
        icon: <Eye className="w-3 h-3" />,
      },
      medium: {
        label: 'Medium Risk',
        className: 'bg-cyber-amber/20 text-cyber-amber border-cyber-amber/30',
        icon: <Edit className="w-3 h-3" />,
      },
      high: {
        label: 'High Risk',
        className: 'bg-destructive/20 text-destructive border-destructive/30',
        icon: <DollarSign className="w-3 h-3" />,
      },
    };

    const { label, className, icon } = config[level as keyof typeof config] || config.low;

    return (
      <Badge variant="outline" className={className}>
        {icon}
        <span className="ml-1">{label}</span>
      </Badge>
    );
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths}mo ago`;
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-cyber-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-cyber-amber/20 rounded-lg">
            <Shield 
              className="w-5 h-5 text-cyber-amber"
              style={{ filter: 'drop-shadow(var(--cyber-glow-amber))' }}
            />
          </div>
          Connected Apps
        </CardTitle>
        <CardDescription>
          Third-party services with access to your data
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          {MOCK_APPS.map((app, index) => (
            <motion.div
              key={app.id}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-background rounded-lg border border-border">
                      {app.icon}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{app.name}</p>
                        {getRiskBadge(app.riskLevel)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Connected {getTimeAgo(app.connectedDate)}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Revoke
                  </Button>
                </div>

                {/* Permissions */}
                <div className="space-y-2 pl-11">
                  <p className="text-xs font-medium text-muted-foreground">
                    Permissions:
                  </p>
                  <div className="space-y-1">
                    {app.permissions.map((permission, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1 h-1 bg-cyber-green rounded-full" />
                        {permission}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk explanation */}
                {app.riskLevel === 'high' && (
                  <div className="flex items-start gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs">
                    <AlertCircle className="w-3 h-3 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      This app can move money from your account
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {MOCK_APPS.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No connected apps
          </div>
        )}

        <div className="pt-2 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Risk Levels:</p>
          <ul className="space-y-1 ml-4">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyber-green rounded-full" />
              <span><strong>Low:</strong> Read-only access</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyber-amber rounded-full" />
              <span><strong>Medium:</strong> Can modify data</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full" />
              <span><strong>High:</strong> Can move money</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
