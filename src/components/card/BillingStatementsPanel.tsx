import { useState } from 'react';
import { FileText, Download, Calendar, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCardStatements } from '@/hooks/useCardStatements';
import { format } from 'date-fns';

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Billing Statements
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => generateStatement(accountId)}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Statement'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {statements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No statements available</p>
            <p className="text-sm mt-1">Statements will appear here each billing cycle</p>
          </div>
        ) : (
          <div className="space-y-3">
            {statements.map((statement) => (
              <div
                key={statement.id}
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(statement.statement_date), 'MMMM yyyy')}
                      </span>
                      {statement.is_paid ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />
                          Due {format(new Date(statement.due_date), 'MMM d')}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      <div>
                        <div className="text-xs text-muted-foreground">New Balance</div>
                        <div className="font-semibold">
                          ${(statement.new_balance_cents / 100).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Minimum Due</div>
                        <div className="font-semibold">
                          ${(statement.minimum_payment_cents / 100).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Purchases</div>
                        <div className="font-semibold">
                          ${(statement.purchases_cents / 100).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Payments</div>
                        <div className="font-semibold text-green-600">
                          ${(statement.payments_cents / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {expandedId === statement.id && (
                      <div className="mt-4 pt-4 border-t space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Previous Balance</span>
                          <span>${(statement.previous_balance_cents / 100).toFixed(2)}</span>
                        </div>
                        {statement.fees_cents > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Fees</span>
                            <span>${(statement.fees_cents / 100).toFixed(2)}</span>
                          </div>
                        )}
                        {statement.interest_cents > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Interest Charged</span>
                            <span>${(statement.interest_cents / 100).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Available Credit</span>
                          <span>${(statement.available_credit_cents / 100).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownloadPDF(statement.id)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedId(expandedId === statement.id ? null : statement.id)}
                    >
                      {expandedId === statement.id ? 'Less' : 'More'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
