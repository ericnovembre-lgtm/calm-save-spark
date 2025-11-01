import { ReactNode } from 'react';
import { useFeatureAccess, UserFeatures } from '@/hooks/useFeatureAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeatureGateProps {
  feature: keyof UserFeatures;
  children: ReactNode;
  fallback?: ReactNode;
}

function UpgradeBanner({ featureName }: { featureName: string }) {
  const navigate = useNavigate();

  return (
    <Card className="border-2 border-dashed border-muted">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-muted-foreground">
          <Lock className="w-5 h-5" />
          Feature Locked
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Upgrade your subscription to unlock {featureName} and more features.
        </p>
        <Button onClick={() => navigate('/pricing')} className="gap-2">
          <TrendingUp className="w-4 h-4" />
          View Pricing
        </Button>
      </CardContent>
    </Card>
  );
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { features, loading } = useFeatureAccess();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
      </div>
    );
  }

  const hasFeature = features && features[feature];

  if (!hasFeature) {
    return <>{fallback || <UpgradeBanner featureName={String(feature)} />}</>;
  }

  return <>{children}</>;
}
