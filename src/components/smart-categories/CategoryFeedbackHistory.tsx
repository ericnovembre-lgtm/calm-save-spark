import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export function CategoryFeedbackHistory() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { data: feedback, isLoading } = useQuery({
    queryKey: ['category-feedback', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('category_feedback')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Category Corrections</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : !feedback?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No category corrections yet.</p>
            <p className="text-sm">Corrections help train the AI.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {feedback.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <ThumbsUp className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground line-through">
                        {item.suggested_category}
                      </span>
                      <ArrowRight className="w-3 h-3" />
                      <span className="font-medium">{item.accepted_category}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.merchant_name} • {format(new Date(item.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    Confidence: {((item.confidence_before || 0) * 100).toFixed(0)}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
