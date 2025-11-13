import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotFoundAnalytic {
  id: string;
  attempted_url: string;
  suggestion_clicked: string | null;
  contextual_help_shown: boolean;
  recent_pages_count: number;
  created_at: string;
}

export function NotFoundAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['404-analytics'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)('page_not_found_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as NotFoundAnalytic[];
    },
  });

  // Calculate top 404 URLs
  const topUrls = analytics?.reduce((acc, item) => {
    acc[item.attempted_url] = (acc[item.attempted_url] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedUrls = topUrls
    ? Object.entries(topUrls)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-semibold text-foreground">
          404 Analytics
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor which URLs users are trying to access and can't find
        </p>
      </div>

      {/* Top 404 URLs */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Most Common 404 Errors</h3>
        </div>
        {sortedUrls.length > 0 ? (
          <div className="space-y-2">
            {sortedUrls.map(([url, count]) => (
              <div
                key={url}
                className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
              >
                <span className="font-mono text-sm">{url}</span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <AlertCircle className="w-3 h-3" />
                  {count} hits
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No 404 errors recorded yet
          </p>
        )}
      </Card>

      {/* Recent 404s */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Recent 404 Errors</h3>
        </div>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading analytics...
          </div>
        ) : analytics && analytics.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attempted URL</TableHead>
                <TableHead>Suggestion Clicked</TableHead>
                <TableHead className="text-center">Help Shown</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.slice(0, 20).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">
                    {item.attempted_url}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.suggestion_clicked || '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.contextual_help_shown ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600">
                        Yes
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        No
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">No 404 errors recorded yet.</p>
            <p className="text-sm">
              Analytics will appear here as users encounter missing pages.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
