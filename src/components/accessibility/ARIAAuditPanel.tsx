import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  RefreshCw, 
  ChevronDown,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';
import { runFullAudit, AuditSummary, AuditResult } from '@/lib/aria-audit';
import { cn } from '@/lib/utils';

interface ARIAAuditPanelProps {
  onClose?: () => void;
}

/**
 * Enhanced ARIA Audit Panel
 * Displays comprehensive accessibility audit results with 25+ checks
 */
export function ARIAAuditPanel({ onClose }: ARIAAuditPanelProps) {
  const [audit, setAudit] = useState<AuditSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [highlightedElements, setHighlightedElements] = useState<HTMLElement[]>([]);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  const runAudit = () => {
    setIsRunning(true);
    // Delay to allow UI to update
    setTimeout(() => {
      const results = runFullAudit();
      setAudit(results);
      setIsRunning(false);
    }, 100);
  };

  useEffect(() => {
    runAudit();
  }, []);

  const highlightElements = (elements: HTMLElement[]) => {
    // Remove previous highlights
    highlightedElements.forEach((el) => {
      el.style.outline = '';
      el.style.outlineOffset = '';
    });

    // Add new highlights
    elements.forEach((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });

    setHighlightedElements(elements);
  };

  const clearHighlights = () => {
    highlightedElements.forEach((el) => {
      el.style.outline = '';
      el.style.outlineOffset = '';
    });
    setHighlightedElements([]);
  };

  const toggleExpanded = (id: string) => {
    setExpandedResults((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getSeverityIcon = (severity: AuditResult['severity']) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-destructive';
  };

  if (!audit) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="py-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Running accessibility audit...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            ARIA Compliance Audit
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHighlights}
              disabled={highlightedElements.length === 0}
            >
              <EyeOff className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={runAudit}
              disabled={isRunning}
            >
              <RefreshCw className={cn('h-4 w-4 mr-1', isRunning && 'animate-spin')} />
              Re-run
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score Overview */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className={cn('text-4xl font-bold', getScoreColor(audit.score))}>
            {audit.score}%
          </div>
          <div className="flex-1">
            <Progress value={audit.score} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>{audit.passed} passed</span>
              <span>{audit.failed} errors</span>
              <span>{audit.warnings} warnings</span>
            </div>
          </div>
        </div>

        {/* Results List */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {audit.results.map((result) => (
              <Collapsible
                key={result.id}
                open={expandedResults.has(result.id)}
                onOpenChange={() => toggleExpanded(result.id)}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors',
                      result.passed
                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20'
                        : result.severity === 'error'
                        ? 'bg-destructive/10 hover:bg-destructive/20'
                        : 'bg-amber-500/10 hover:bg-amber-500/20'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {result.passed ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        getSeverityIcon(result.severity)
                      )}
                      <span className="font-medium">{result.name}</span>
                      {!result.passed && result.count > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {result.count} issue{result.count !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {result.wcagCriteria && (
                        <Badge variant="outline" className="text-xs">
                          WCAG {result.wcagCriteria}
                        </Badge>
                      )}
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          expandedResults.has(result.id) && 'rotate-180'
                        )}
                      />
                    </div>
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-3 py-2 text-sm space-y-2">
                    <p className="text-muted-foreground">{result.description}</p>
                    
                    {result.elements && result.elements.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => highlightElements(result.elements!)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Highlight Elements
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {result.elements.length} element{result.elements.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {result.wcagCriteria && (
                      <a
                        href={`https://www.w3.org/WAI/WCAG21/Understanding/${result.wcagCriteria}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-primary hover:underline"
                      >
                        Learn more about WCAG {result.wcagCriteria}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>

        {/* Summary */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          {audit.totalChecks} checks performed • Last run: {new Date().toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}
