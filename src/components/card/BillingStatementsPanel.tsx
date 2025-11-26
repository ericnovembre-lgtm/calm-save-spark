import { useState } from 'react';
import { FileText, Download, Calendar, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCardStatements } from '@/hooks/useCardStatements';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface BillingStatementsPanelProps {
  accountId: string;
}

export function BillingStatementsPanel({ accountId }: BillingStatementsPanelProps) {
  const { statements, isLoading, generateStatement, isGenerating } = useCardStatements(accountId);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDownloadPDF = (statementId: string) => {
    // In production, this would generate and download a real PDF
    console.log('Downloading statement:', statementId);
    // Placeholder: You could integrate with a PDF generation service
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Billing Statements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-background to-accent/5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <span>Billing Statements</span>
          </CardTitle>
          <Button
            size="sm"
            onClick={() => generateStatement(accountId)}
            disabled={isGenerating}
            className="hover:scale-105 transition-transform"
          >
            {isGenerating ? 'Generating...' : 'Generate Statement'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {statements.length === 0 ? (
          <div className="text-center py-12 animate-in fade-in-50 duration-500">
            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium mb-1">No statements yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Statements generate automatically each billing cycle
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => generateStatement(accountId)}
              disabled={isGenerating}
            >
              Generate Test Statement
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {statements.map((statement, index) => (
              <motion.div
                key={statement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-xl p-5 hover:shadow-md hover:border-primary/50 transition-all bg-gradient-to-br from-background to-accent/5 cursor-pointer"
                onClick={() => setExpandedId(expandedId === statement.id ? null : statement.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <span className="font-semibold text-lg block">
                          {format(new Date(statement.statement_date), 'MMMM yyyy')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Statement Date: {format(new Date(statement.statement_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {statement.is_paid ? (
                        <Badge className="bg-green-500 hover:bg-green-600 ml-auto">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="ml-auto">
                          <Clock className="w-3 h-3 mr-1" />
                          Due {format(new Date(statement.due_date), 'MMM d')}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-xs text-muted-foreground mb-1">New Balance</div>
                        <div className="text-lg font-bold">
                          ${(statement.new_balance_cents / 100).toFixed(2)}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-amber-500/10">
                        <div className="text-xs text-muted-foreground mb-1">Minimum Due</div>
                        <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                          ${(statement.minimum_payment_cents / 100).toFixed(2)}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-500/10">
                        <div className="text-xs text-muted-foreground mb-1">Purchases</div>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ${(statement.purchases_cents / 100).toFixed(2)}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-green-500/10">
                        <div className="text-xs text-muted-foreground mb-1">Payments</div>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          ${(statement.payments_cents / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {expandedId === statement.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t space-y-3"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Previous Balance</span>
                          <span className="font-medium">${(statement.previous_balance_cents / 100).toFixed(2)}</span>
                        </div>
                        {statement.fees_cents > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Fees</span>
                            <span className="font-medium text-red-600">${(statement.fees_cents / 100).toFixed(2)}</span>
                          </div>
                        )}
                        {statement.interest_cents > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Interest Charged</span>
                            <span className="font-medium text-red-600">${(statement.interest_cents / 100).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm pt-2 border-t">
                          <span className="text-muted-foreground">Available Credit</span>
                          <span className="font-semibold text-green-600">${(statement.available_credit_cents / 100).toFixed(2)}</span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPDF(statement.id);
                      }}
                      className="hover:bg-primary/10"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
