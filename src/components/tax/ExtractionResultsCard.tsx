import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ModelAttributionBadge } from './ModelAttributionBadge';
import { ConfidenceGauge } from './ConfidenceGauge';
import { FileText, Calendar, DollarSign, User, Building, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ExtractionResultsCardProps {
  documentType: string;
  extractedData: Record<string, any>;
  modelUsed: string;
  confidence: number;
  analyzedAt?: string;
  compact?: boolean;
}

// Group fields by semantic category
const FIELD_GROUPS = {
  identity: ['employer_name', 'employer_ein', 'employee_name', 'payer_name', 'recipient_name', 'ssn'],
  income: ['wages', 'federal_income_tax', 'social_security_wages', 'medicare_wages', 'total_income', 'dividends', 'interest', 'capital_gains'],
  withholdings: ['federal_tax_withheld', 'state_tax_withheld', 'social_security_tax', 'medicare_tax'],
  other: ['tax_year', 'form_type', 'state', 'box_numbers'],
};

const FIELD_ICONS: Record<string, any> = {
  employer_name: Building,
  employee_name: User,
  payer_name: Building,
  recipient_name: User,
  wages: DollarSign,
  dividends: DollarSign,
  interest: DollarSign,
  capital_gains: DollarSign,
  total_income: DollarSign,
  federal_income_tax: DollarSign,
  federal_tax_withheld: DollarSign,
  state_tax_withheld: DollarSign,
  tax_year: Calendar,
  form_type: FileText,
};

function formatFieldName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function formatFieldValue(key: string, value: any): string {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'number') {
    // Format as currency if it looks like a money field
    if (key.includes('wage') || key.includes('tax') || key.includes('income') || 
        key.includes('dividend') || key.includes('interest') || key.includes('capital')) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }
    return value.toLocaleString();
  }
  return String(value);
}

export function ExtractionResultsCard({
  documentType,
  extractedData,
  modelUsed,
  confidence,
  analyzedAt,
  compact = false,
}: ExtractionResultsCardProps) {
  // Filter out metadata fields
  const displayData = Object.entries(extractedData || {}).filter(
    ([key]) => !['model_used', 'confidence', 'processed_at', 'raw_response'].includes(key)
  );

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <ModelAttributionBadge model={modelUsed} size="sm" />
          <ConfidenceGauge confidence={confidence} size="sm" />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {displayData.slice(0, 4).map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <span className="text-muted-foreground">{formatFieldName(key)}</span>
              <span className="font-medium text-foreground truncate">{formatFieldValue(key, value)}</span>
            </div>
          ))}
        </div>
        {displayData.length > 4 && (
          <p className="text-xs text-muted-foreground">+{displayData.length - 4} more fields</p>
        )}
      </div>
    );
  }

  // Group fields by category
  const groupedFields = Object.keys(FIELD_GROUPS).reduce((acc, group) => {
    const fields = displayData.filter(([key]) => 
      FIELD_GROUPS[group as keyof typeof FIELD_GROUPS].some(f => key.toLowerCase().includes(f.toLowerCase()))
    );
    if (fields.length > 0) {
      acc[group] = fields;
    }
    return acc;
  }, {} as Record<string, typeof displayData>);

  // Fields that don't fit any group
  const ungroupedFields = displayData.filter(([key]) => 
    !Object.values(FIELD_GROUPS).flat().some(f => key.toLowerCase().includes(f.toLowerCase()))
  );

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground capitalize">
              {documentType.replace(/_/g, ' ')}
            </h3>
          </div>
          {analyzedAt && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Analyzed {format(new Date(analyzedAt), 'MMM d, yyyy h:mm a')}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <ModelAttributionBadge model={modelUsed} size="md" />
          <ConfidenceGauge confidence={confidence} size="md" />
        </div>
      </div>

      {/* Grouped Fields */}
      <div className="space-y-4">
        {Object.entries(groupedFields).map(([group, fields]) => (
          <motion.div
            key={group}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.replace(/_/g, ' ')}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {fields.map(([key, value]) => {
                const Icon = FIELD_ICONS[key] || FileText;
                return (
                  <div 
                    key={key} 
                    className={cn(
                      "p-3 rounded-lg bg-muted/50",
                      confidence < 60 && "opacity-75"
                    )}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{formatFieldName(key)}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {formatFieldValue(key, value)}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* Ungrouped fields */}
        {ungroupedFields.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Other Details
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ungroupedFields.map(([key, value]) => (
                <div key={key} className="p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground">{formatFieldName(key)}</span>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {formatFieldValue(key, value)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
