import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function BenchmarkComparison() {
  const { data: benchmarks, refetch } = useQuery({
    queryKey: ['user-benchmarks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_benchmarks')
        .select('*')
        .order('calculated_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  const calculateBenchmarks = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('calculate-benchmarks');

      if (error) throw error;

      toast.success("Benchmarks calculated successfully");
      refetch();
    } catch (error: any) {
      toast.error(`Failed to calculate benchmarks: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-bold">Peer Comparison</h3>
              <p className="text-sm text-muted-foreground">
                See how you compare to similar users
              </p>
            </div>
          </div>
          <Button onClick={calculateBenchmarks}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Recalculate
          </Button>
        </div>

        {benchmarks && benchmarks.length > 0 ? (
          <div className="space-y-4">
            {benchmarks.map((benchmark) => {
              const userValue = parseFloat(benchmark.user_value.toString());
              const peerAverage = parseFloat(benchmark.peer_average.toString());
              const isAboveAverage = userValue > peerAverage;

              return (
                <div key={benchmark.id} className="p-4 bg-secondary rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize">
                      {benchmark.benchmark_type.replace('_', ' ')}
                    </h4>
                    <span className={`flex items-center gap-1 text-sm font-medium ${
                      isAboveAverage ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {isAboveAverage ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      {benchmark.peer_percentile}th percentile
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Your Value</p>
                      <p className="font-bold text-lg">{userValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Peer Average</p>
                      <p className="font-bold text-lg">{peerAverage.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No benchmarks calculated yet</p>
            <p className="text-sm mt-1">Click "Recalculate" to compare with peers</p>
          </div>
        )}
      </Card>
    </div>
  );
}