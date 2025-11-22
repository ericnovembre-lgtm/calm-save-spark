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
    <div className={`space-y-4 ${className}`}>
      {/* Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your automation rule... (e.g., 'Save $5 every time I buy coffee')"
          className="pl-10 h-12 text-base bg-card/50 backdrop-blur-sm border-primary/20 focus:border-primary/50"
        />
        {isParsing && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Parsed Rule Display */}
      {parsedRule && (
        <div className="animate-fade-in space-y-4 p-4 rounded-lg bg-card/30 backdrop-blur-sm border border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>I understand:</span>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <TriggerBlock triggerCondition={parsedRule.trigger_condition} />
            
            <ArrowRight className="w-6 h-6 text-primary mx-auto md:mx-0 rotate-90 md:rotate-0" />
            
            <ActionBlock actionConfig={parsedRule.action_config} />
          </div>

          {/* Target Selection */}
          {needsTargetSelection && availableTargets && availableTargets.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Destination:</label>
              <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                <SelectTrigger>
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

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleCreateRule}
              disabled={needsTargetSelection && !selectedTarget}
              className="flex-1"
            >
              Create This Rule
            </Button>
            <Button variant="outline" onClick={() => setParsedRule(null)}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {parseError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {parseError}
        </div>
      )}
    </div>
  );
}
