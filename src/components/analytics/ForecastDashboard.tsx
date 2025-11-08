import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrendingUp, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function ForecastDashboard() {
  const [category, setCategory] = useState("groceries");

  const { data: forecasts, refetch } = useQuery({
    queryKey: ['spending-forecasts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spending_forecasts')
        .select('*')
        .order('forecast_date', { ascending: true })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  const generateForecast = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('predict-spending-forecast', {
        body: { category, months: 3 }
      });

      if (error) throw error;

      toast.success("AI forecast generated successfully");
      refetch();
    } catch (error: any) {
      toast.error(`Failed to generate forecast: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-bold">AI Spending Forecast</h3>
              <p className="text-sm text-muted-foreground">
                Predict future spending using machine learning
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="groceries">Groceries</SelectItem>
                  <SelectItem value="dining">Dining Out</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generateForecast}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Generate Forecast
            </Button>
          </div>
        </div>
      </Card>

      {forecasts && forecasts.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Forecast Results</h4>
          <div className="space-y-3">
            {forecasts.slice(0, 3).map((forecast) => (
              <div key={forecast.id} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">{forecast.category}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(forecast.forecast_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    ${parseFloat(forecast.predicted_amount.toString()).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(parseFloat(forecast.confidence_score?.toString() || '0') * 100).toFixed(0)}% confidence
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}