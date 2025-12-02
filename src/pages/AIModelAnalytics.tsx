import { AppLayout } from '@/components/layout/AppLayout';
import { AIRoutingAnalyticsDashboard } from '@/components/ai-analytics/AIRoutingAnalyticsDashboard';

export default function AIModelAnalytics() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <AIRoutingAnalyticsDashboard />
      </div>
    </AppLayout>
  );
}
