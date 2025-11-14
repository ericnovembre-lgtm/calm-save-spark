import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Leaf } from "lucide-react";
import { LazyLineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "@/components/charts/LazyLineChart";
import { format, subDays } from "date-fns";

export function CarbonTracker() {
  const { data: carbonData, isLoading } = useQuery({
    queryKey: ['carbon-footprint'],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30);

      const { data, error } = await supabase
        .from('carbon_footprint_logs')
        .select('*')
        .gte('log_date', thirtyDaysAgo.toISOString())
        .order('log_date', { ascending: true });

      if (error) throw error;

      // Group by date
      const dailyData: Record<string, number> = {};
      data?.forEach(log => {
        const date = format(new Date(log.log_date), 'MMM dd');
        dailyData[date] = (dailyData[date] || 0) + parseFloat(log.carbon_kg.toString());
      });

      return Object.entries(dailyData).map(([date, carbon]) => ({
        date,
        carbon: parseFloat(carbon.toFixed(2)),
      }));
    },
  });

  const { data: categoryBreakdown } = useQuery({
    queryKey: ['carbon-by-category'],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30);

      const { data, error } = await supabase
        .from('carbon_footprint_logs')
        .select('category, carbon_kg')
        .gte('log_date', thirtyDaysAgo.toISOString());

      if (error) throw error;

      const categoryData: Record<string, number> = {};
      data?.forEach(log => {
        categoryData[log.category] = (categoryData[log.category] || 0) + parseFloat(log.carbon_kg.toString());
      });

      return Object.entries(categoryData)
        .map(([category, carbon]) => ({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          carbon: parseFloat(carbon.toFixed(2)),
        }))
        .sort((a, b) => b.carbon - a.carbon);
    },
  });

  const totalCarbon = categoryBreakdown?.reduce((sum, cat) => sum + cat.carbon, 0) || 0;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Leaf className="w-6 h-6 text-green-600" />
          30-Day Carbon Footprint
        </h2>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading carbon data...</p>
        ) : (
          <LazyLineChart data={carbonData} height={300}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => `${value} kg CO2`} />
            <Line type="monotone" dataKey="carbon" stroke="#16a34a" strokeWidth={2} />
          </LazyLineChart>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Carbon by Category</h3>
        <div className="space-y-3">
          {categoryBreakdown?.map((cat) => (
            <div key={cat.category} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{cat.category}</span>
                  <span className="text-sm text-muted-foreground">
                    {cat.carbon} kg ({((cat.carbon / totalCarbon) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(cat.carbon / totalCarbon) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">To offset your emissions:</p>
          <p className="text-2xl font-bold text-green-600">
            {Math.round(totalCarbon / 21.77)} trees needed
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Average tree absorbs ~21.77 kg CO2 per year
          </p>
        </div>
      </Card>
    </div>
  );
}
