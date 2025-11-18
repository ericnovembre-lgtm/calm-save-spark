# Export & Data Management

Comprehensive documentation for Phase 11 - Export & Data Management features.

## Overview

The export and data management system provides users with complete control over their financial data with the following capabilities:
- **CSV Exports**: Budgets, transactions, and analytics
- **PDF Reports**: Professional reports with charts and tables
- **Data Import**: CSV import for bulk budget creation
- **Backup/Restore**: Complete account data backup
- **Print Views**: Optimized reports for printing

## Components

### 1. ExportService (`src/lib/export-service.ts`)

Core service handling all export/import operations.

#### Key Methods:

**CSV Exports:**
```typescript
// Export budgets to CSV
ExportService.exportBudgetsToCSV(budgets, spending);

// Export transactions to CSV
ExportService.exportTransactionsToCSV(transactions);

// Export analytics to CSV
ExportService.exportAnalyticsToCSV(budgets, spending, categories);
```

**PDF Generation:**
```typescript
// Generate professional PDF report
ExportService.generatePDFReport({
  budgets,
  transactions,
  spending,
  categories
});
```

**Data Backup:**
```typescript
// Create full account backup (JSON)
ExportService.exportFullBackup({
  budgets,
  transactions,
  categories,
  goals,
  pots,
  profile
});
```

**CSV Import:**
```typescript
// Parse CSV file
const data = await ExportService.parseCSV(file);
```

**Print View:**
```typescript
// Generate print-friendly HTML
const html = ExportService.generatePrintView({
  budgets,
  transactions,
  spending,
  categories
});
```

### 2. ExportDataManager (`src/components/budget/ExportDataManager.tsx`)

Main UI component for export/import operations.

#### Features:
- **Tabbed Interface**: Export, Import, Backup tabs
- **Drag & Drop**: CSV file upload with drag-and-drop
- **Progress Indicators**: Loading states for all operations
- **Error Handling**: Comprehensive error messages
- **File Validation**: CSV format validation

#### Usage:
```tsx
<ExportDataManager
  isOpen={isOpen}
  onClose={handleClose}
  budgets={budgets}
  transactions={transactions}
  spending={spending}
  categories={categories}
  onImportComplete={handleImportComplete}
/>
```

### 3. ImportCSVDialog (`src/components/budget/ImportCSVDialog.tsx`)

Dedicated component for CSV import with validation.

#### Features:
- **Validation**: Real-time CSV data validation
- **Error Reporting**: Detailed error messages per row
- **Success Tracking**: Import statistics (success/failed counts)
- **Format Guide**: Built-in CSV format documentation

#### CSV Import Format:
```csv
Name, Period, Limit
Monthly Budget, monthly, 5000
Weekly Groceries, weekly, 300
Annual Savings, annual, 50000
```

## Export Formats

### CSV Exports

#### 1. Budgets CSV
**Columns:**
- Name
- Period
- Limit
- Spent
- Remaining
- Usage %
- Created

**Example:**
```csv
Name,Period,Limit,Spent,Remaining,Usage %,Created
Monthly Budget,monthly,5000.00,3500.00,1500.00,70.0,2024-01-15
```

#### 2. Transactions CSV
**Columns:**
- Date
- Description
- Category
- Amount
- Type (Income/Expense)
- Account

**Example:**
```csv
Date,Description,Category,Amount,Type,Account
2024-01-15,"Grocery Store",Food,-45.50,Expense,Checking
```

#### 3. Analytics CSV
**Columns:**
- Budget
- Period
- Total Limit
- Total Spent
- Remaining
- Categories
- Transactions

### PDF Report

**Sections:**
1. **Header**
   - Title: "Budget Report"
   - Date: Current date
   - Logo/Branding

2. **Summary Section**
   - Total Budget
   - Total Spent
   - Total Remaining
   - Overall Usage %

3. **Budget Details Table**
   - All budgets with complete metrics
   - Color-coded for over/under budget
   - Professional styling

4. **Category Breakdown**
   - Per-budget category allocations
   - Spending by category

5. **Footer**
   - Page numbers
   - Copyright info
   - Generation timestamp

### JSON Backup

**Structure:**
```json
{
  "version": "1.0.0",
  "exportedAt": "2024-01-15T12:00:00.000Z",
  "data": {
    "budgets": [...],
    "transactions": [...],
    "categories": [...],
    "goals": [...],
    "pots": [...],
    "profile": {...}
  }
}
```

## CSV Import Specifications

### Required Fields
1. **name** (string): Budget name
2. **period** (enum): "weekly", "monthly", or "annual"
3. **limit** (number): Positive number for budget limit

### Validation Rules
- Name cannot be empty
- Period must be valid enum value
- Limit must be positive number
- Duplicate names trigger warnings

### Error Handling
- Row-level validation
- Partial imports allowed
- Detailed error reporting
- Success/failure statistics

## Print View

### Features
- **Optimized Layout**: 1000px max width
- **Print Styles**: @media print optimization
- **Page Margins**: 1cm all sides
- **Color Scheme**: Print-friendly colors
- **Tables**: Zebra-striped rows
- **Footer**: Page numbers and branding

### Styling
```css
@media print {
  @page { margin: 1cm; }
  body { font-family: Arial, sans-serif; }
}
```

### Usage
Opens in new window with automatic print dialog:
```typescript
const printWindow = window.open('', '_blank');
printWindow.document.write(html);
printWindow.print();
```

## Integration Examples

### Basic Export
```tsx
import { ExportService } from '@/lib/export-service';

// Export budgets to CSV
const handleExport = () => {
  ExportService.exportBudgetsToCSV(budgets, spending);
};
```

### PDF Report Generation
```tsx
// Generate comprehensive PDF report
const handlePDFExport = () => {
  ExportService.generatePDFReport({
    budgets,
    transactions,
    spending,
    categories,
  });
};
```

### CSV Import
```tsx
// Import budgets from CSV
const handleImport = async (file: File) => {
  try {
    const data = await ExportService.parseCSV(file);
    // Process imported data
    await saveBudgets(data);
  } catch (error) {
    console.error('Import failed:', error);
  }
};
```

### Full Backup
```tsx
// Create complete backup
const handleBackup = () => {
  ExportService.exportFullBackup({
    budgets,
    transactions,
    categories,
    goals,
    pots,
    profile,
  });
};
```

## Security Considerations

1. **Data Privacy**
   - All exports happen client-side
   - No server transmission of sensitive data
   - Files stay on user's device

2. **File Validation**
   - CSV parsing with error handling
   - Type checking for imported data
   - Sanitization of user input

3. **Access Control**
   - User authentication required
   - Only user's own data exported
   - RLS policies enforced on imports

## Performance

### Optimizations
1. **Large Datasets**
   - Streaming for large CSV files
   - Chunk processing for imports
   - Memory-efficient PDF generation

2. **Client-Side Processing**
   - No server load
   - Instant downloads
   - Offline capability

3. **File Size Management**
   - Compressed JSON backups
   - Optimized PDF generation
   - Efficient CSV formatting

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| CSV Export | ✅ | ✅ | ✅ | ✅ |
| PDF Generation | ✅ | ✅ | ✅ | ✅ |
| Print View | ✅ | ✅ | ✅ | ✅ |
| File Upload | ✅ | ✅ | ✅ | ✅ |
| Drag & Drop | ✅ | ✅ | ✅ | ✅ |

## Testing

### Test Cases
1. **CSV Export**
   - Empty budget list
   - Single budget
   - Multiple budgets
   - Special characters in names

2. **PDF Generation**
   - Various data sizes
   - Long budget names
   - Many categories
   - Page breaks

3. **CSV Import**
   - Valid format
   - Invalid format
   - Missing fields
   - Duplicate entries

4. **Backup/Restore**
   - Complete data backup
   - Partial data backup
   - Large datasets
   - Restore validation

## Future Enhancements

1. **Export Scheduling**
   - Automatic weekly/monthly exports
   - Email delivery of reports
   - Cloud backup integration

2. **Advanced Formats**
   - Excel (XLSX) support
   - Google Sheets integration
   - iCal for budget periods

3. **Data Analysis**
   - Trend analysis in PDF reports
   - Predictive insights
   - Comparison charts

4. **Collaboration**
   - Shared export templates
   - Multi-user backups
   - Team data exports

## Troubleshooting

### Common Issues

**Issue: CSV Export Not Downloading**
- Check pop-up blocker settings
- Verify browser permissions
- Try different browser

**Issue: PDF Generation Fails**
- Reduce data size
- Check browser console for errors
- Update jsPDF library

**Issue: CSV Import Validation Errors**
- Verify CSV format matches template
- Check for special characters
- Ensure proper encoding (UTF-8)

**Issue: Print View Not Opening**
- Allow pop-ups for the site
- Check browser settings
- Try "Open in New Tab" option

## API Reference

See [ExportService API Documentation](./api/export-service.md) for complete API reference.

## Support

For issues or questions:
- GitHub Issues: [repository]/issues
- Documentation: [docs]/export-data-management
- Email: support@saveplus.app
