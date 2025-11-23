import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { TriggerBlock } from "./TriggerBlock";
import { ActionBlock } from "./ActionBlock";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface ParsedRule {
  rule_name: string;
  rule_type: string;
  trigger_condition: any;
  action_config: any;
}

interface ConversationalRuleBuilderProps {
  onRuleCreated: () => void;
  className?: string;
}

export function ConversationalRuleBuilder({ onRuleCreated, className = "" }: ConversationalRuleBuilderProps) {
  const [input, setInput] = useState("");
  const [parsedRule, setParsedRule] = useState<ParsedRule | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const { toast } = useToast();

  // Fetch goals and pots for destination selection
  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('goals')
        .select('id, name')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: pots } = useQuery({
    queryKey: ['pots'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('pots')
        .select('id, name')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Debounced parsing
  useEffect(() => {
    if (input.length < 10) {
      setParsedRule(null);
      setParseError(null);
      return;
    }

    const timer = setTimeout(() => {
      parseInput();
    }, 1000);

    return () => clearTimeout(timer);
  }, [input]);

  const parseInput = async () => {
    setIsParsing(true);
    setParseError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('parse-automation-rule', {
        body: { input, userId: user.id }
      });

      if (error) throw error;

      if (data.success) {
        setParsedRule(data.rule);
        
        // Auto-select target if AI found a match
        if (data.rule.action_config.target_id) {
          setSelectedTarget(data.rule.action_config.target_id);
        }
      } else {
        setParseError(data.error || 'Could not parse rule');
      }
    } catch (error) {
      console.error('Parse error:', error);
      setParseError('Failed to parse rule. Try being more specific.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleCreateRule = async () => {
    if (!parsedRule) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update target_id if user selected a destination
      if (selectedTarget && !parsedRule.action_config.target_id) {
        parsedRule.action_config.target_id = selectedTarget;
      }

      const { error } = await supabase.from('automation_rules').insert({
        user_id: user.id,
        rule_name: parsedRule.rule_name,
        rule_type: parsedRule.rule_type,
        trigger_condition: parsedRule.trigger_condition,
        action_config: parsedRule.action_config,
        is_active: true
      });

      if (error) throw error;

      toast({
        title: "✨ Rule Created!",
        description: `${parsedRule.rule_name} is now active.`,
      });

      // Reset form
      setInput("");
      setParsedRule(null);
      setSelectedTarget("");
      onRuleCreated();
    } catch (error) {
      console.error('Create rule error:', error);
      toast({
        title: "Error",
        description: "Failed to create automation rule.",
        variant: "destructive"
      });
    }
  };

  const needsTargetSelection = parsedRule && !parsedRule.action_config.target_id;
  const availableTargets = parsedRule?.action_config.type === 'transfer_to_goal' ? goals : pots;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Input Bar - Enhanced */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
          <Sparkles className="w-5 h-5 text-accent group-hover:text-accent/80 transition-colors" />
        </div>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your automation rule... (e.g., 'Save $5 every time I buy coffee')"
          className="pl-12 pr-12 h-14 text-base bg-card/70 backdrop-blur-sm border-2 border-border hover:border-accent/30 focus:border-accent/50 transition-all duration-200 rounded-xl shadow-sm"
        />
        {isParsing && (
          <div className="absolute inset-y-0 right-4 flex items-center z-10">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
          </div>
        )}
      </div>

      {/* Parsed Rule Display - Enhanced */}
      {parsedRule && (
        <div className="animate-fade-in space-y-6 p-6 rounded-xl bg-gradient-to-br from-card/80 to-accent/5 backdrop-blur-md border-2 border-accent/20 shadow-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>I understand:</span>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <TriggerBlock triggerCondition={parsedRule.trigger_condition} />
            
            <div className="mx-auto md:mx-0">
              <ArrowRight className="w-7 h-7 text-accent rotate-90 md:rotate-0 animate-pulse" />
            </div>
            
            <ActionBlock actionConfig={parsedRule.action_config} />
          </div>

          {/* Target Selection - Enhanced */}
          {needsTargetSelection && availableTargets && availableTargets.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-accent/20">
              <label className="text-sm font-semibold">Select Destination:</label>
              <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                <SelectTrigger className="h-11 border-2 hover:border-accent/30 transition-colors">
                  <SelectValue placeholder={`Choose a ${parsedRule.action_config.type === 'transfer_to_goal' ? 'goal' : 'pot'}`} />
                </SelectTrigger>
                <SelectContent>
                  {availableTargets.map((target: any) => (
                    <SelectItem key={target.id} value={target.id}>
                      {target.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions - Enhanced */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleCreateRule}
              disabled={needsTargetSelection && !selectedTarget}
              size="lg"
              className="flex-1 font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create This Rule
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setParsedRule(null)}
              className="border-2"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Error Display - Enhanced */}
      {parseError && (
        <div className="p-4 rounded-xl bg-destructive/10 border-2 border-destructive/30 text-sm text-destructive font-medium animate-fade-in backdrop-blur-sm">
          {parseError}
        </div>
      )}
    </div>
  );
}
