import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, ArrowRight, Target, Check, X, AlertCircle } from "lucide-react";
import { TriggerBlock } from "./TriggerBlock";
import { ActionBlock } from "./ActionBlock";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
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
  icon: string;
  color: string;
  confidence: number;
  semantic_tags: string[];
}

// Helper to render Lucide icons dynamically
const DynamicIcon = ({ name, className = "" }: { name: string; className?: string }) => {
  const IconComponent = (LucideIcons as any)[
    name.split('-').map((w: string) => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join('')
  ] || LucideIcons.Sparkles;
  
  return <IconComponent className={className} />;
};

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

  const examplePrompts = [
    { text: "Save $2 every time I buy from Steam", icon: "gamepad-2", color: "purple" },
    { text: "Transfer $100 every Friday", icon: "calendar", color: "blue" },
    { text: "If balance drops below $500, move $50 from Savings", icon: "shield-alert", color: "rose" },
    { text: "Put aside 10% of every paycheck", icon: "piggy-bank", color: "emerald" },
    { text: "Save $5 when I order from UberEats", icon: "utensils", color: "orange" }
  ];

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

      {/* Example Prompts Carousel */}
      {!parsedRule && !isParsing && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent">
          {examplePrompts.map((example, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => setInput(example.text)}
              className={`shrink-0 gap-2 border-${example.color}-500/30 hover:bg-${example.color}-500/5 hover:border-${example.color}-500/50 transition-all`}
            >
              <DynamicIcon name={example.icon} className={`w-4 h-4 text-${example.color}-500`} />
              <span className="text-xs">{example.text}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Parsed Rule Display - Enhanced with Visual Intelligence */}
      {parsedRule && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="space-y-6 p-8 rounded-2xl bg-gradient-to-br from-card via-card/90 to-accent/10 backdrop-blur-xl border-2 border-accent/30 shadow-2xl relative overflow-hidden"
        >
          {/* Animated background glow */}
          <motion.div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, hsl(var(--${parsedRule.color}-500) / 0.3), transparent 70%)`
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Confidence Badge */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Sparkles className={`w-6 h-6 text-${parsedRule.color}-500`} />
              </motion.div>
              <span className="text-sm font-semibold text-muted-foreground">
                AI Generated Rule
              </span>
            </div>
            
            <Badge 
              variant={parsedRule.confidence >= 0.9 ? "default" : parsedRule.confidence >= 0.7 ? "secondary" : "outline"}
              className="gap-1.5"
            >
              <Target className="w-3 h-3" />
              {(parsedRule.confidence * 100).toFixed(0)}% Confident
            </Badge>
          </div>

          {/* Rule Title with Icon */}
          <div className="flex items-center gap-4 relative z-10">
            <motion.div
              className={`w-16 h-16 rounded-2xl bg-${parsedRule.color}-500/10 border-2 border-${parsedRule.color}-500/30 flex items-center justify-center`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <DynamicIcon name={parsedRule.icon} className={`w-8 h-8 text-${parsedRule.color}-500`} />
            </motion.div>
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold tracking-tight">{parsedRule.rule_name}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {parsedRule.semantic_tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Trigger → Action Flow */}
          <div className="flex flex-col md:flex-row gap-6 items-center relative z-10">
            <TriggerBlock 
              triggerCondition={parsedRule.trigger_condition}
              icon={parsedRule.icon}
              color={parsedRule.color}
            />
            
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowRight className={`w-8 h-8 text-${parsedRule.color}-500 rotate-90 md:rotate-0`} />
            </motion.div>
            
            <ActionBlock 
              actionConfig={parsedRule.action_config}
              icon={parsedRule.icon}
              color={parsedRule.color}
            />
          </div>

          {/* Low Confidence Warning */}
          {parsedRule.confidence < 0.7 && (
            <Alert className="relative z-10">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Review Recommended</AlertTitle>
              <AlertDescription>
                I'm not 100% sure I understood correctly. Please verify the details above before creating.
              </AlertDescription>
            </Alert>
          )}

          {/* Target Selection - Enhanced */}
          {needsTargetSelection && availableTargets && availableTargets.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-accent/20 relative z-10">
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
          <div className="flex gap-3 pt-4 relative z-10">
            <Button
              onClick={handleCreateRule}
              disabled={needsTargetSelection && !selectedTarget}
              size="lg"
              className="flex-1 font-semibold shadow-lg hover:shadow-xl transition-all gap-2"
            >
              <Check className="w-5 h-5" />
              Create This Rule
            </Button>
            <Button 
              variant="ghost" 
              size="lg"
              onClick={() => setParsedRule(null)}
              className="border-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
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
