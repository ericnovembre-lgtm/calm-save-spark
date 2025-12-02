import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettingsStore } from '@/stores/settingsStore';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MODEL_OPTIONS = [
  { value: 'null', label: 'Auto (Smart Routing)' },
  { value: 'gemini-flash', label: 'Gemini 2.5 Flash (Fast)' },
  { value: 'claude-sonnet', label: 'Claude Sonnet 4.5 (Advanced)' },
  { value: 'perplexity', label: 'Perplexity Sonar (Real-time)' },
];

const COST_LEVELS = [
  { 
    value: 'fastest', 
    label: 'Fastest',
    description: 'Prioritize speed (Gemini for most queries)'
  },
  { 
    value: 'balanced', 
    label: 'Balanced',
    description: 'Smart routing based on complexity'
  },
  { 
    value: 'highest_quality', 
    label: 'Highest Quality',
    description: 'Use Claude for complex reasoning'
  },
];

export function AIModelPreferences() {
  const { aiModelPreferences, setAIModelPreferences } = useSettingsStore();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-routing">Enable Smart Routing</Label>
            <p className="text-sm text-muted-foreground">
              Automatically select the best AI model for each query
            </p>
          </div>
          <Switch
            id="auto-routing"
            checked={aiModelPreferences.autoRoutingEnabled}
            onCheckedChange={(checked) =>
              setAIModelPreferences({ autoRoutingEnabled: checked })
            }
          />
        </div>

        {!aiModelPreferences.autoRoutingEnabled && (
          <div className="space-y-2">
            <Label htmlFor="preferred-model">Default Model Override</Label>
            <Select
              value={aiModelPreferences.preferredModel || 'null'}
              onValueChange={(value) =>
                setAIModelPreferences({ 
                  preferredModel: value === 'null' ? null : value as any 
                })
              }
            >
              <SelectTrigger id="preferred-model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {aiModelPreferences.autoRoutingEnabled && (
        <>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Cost Optimization Level</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Controls how aggressively the system optimizes for speed vs. quality
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={aiModelPreferences.costOptimizationLevel}
              onValueChange={(value) =>
                setAIModelPreferences({ costOptimizationLevel: value as any })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COST_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="space-y-1">
                      <div className="font-medium">{level.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {level.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">Advanced: Per-Query-Type Override</CardTitle>
              <CardDescription className="text-xs">
                Force specific models for different query types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="simple-model" className="text-xs">Simple Queries</Label>
                <Select
                  value={aiModelPreferences.forceModelForSimple || 'null'}
                  onValueChange={(value) =>
                    setAIModelPreferences({ 
                      forceModelForSimple: value === 'null' ? null : value as any 
                    })
                  }
                >
                  <SelectTrigger id="simple-model" className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complex-model" className="text-xs">Complex Queries</Label>
                <Select
                  value={aiModelPreferences.forceModelForComplex || 'null'}
                  onValueChange={(value) =>
                    setAIModelPreferences({ 
                      forceModelForComplex: value === 'null' ? null : value as any 
                    })
                  }
                >
                  <SelectTrigger id="complex-model" className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="market-model" className="text-xs">Market Data Queries</Label>
                <Select
                  value={aiModelPreferences.forceModelForMarket || 'null'}
                  onValueChange={(value) =>
                    setAIModelPreferences({ 
                      forceModelForMarket: value === 'null' ? null : value as any 
                    })
                  }
                >
                  <SelectTrigger id="market-model" className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
