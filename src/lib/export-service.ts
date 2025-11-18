import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportData {
  budgets: any[];
  transactions?: any[];
  spending?: Record<string, any>;
  categories?: any[];
  analytics?: any;
}

export class ExportService {
  /**
   * Export budgets to CSV
   */
  static exportBudgetsToCSV(budgets: any[], spending: Record<string, any>) {
    const csvData = budgets.map(budget => {
      const spend = spending[budget.id];
      return {
        name: budget.name,
        period: budget.period,
        limit: budget.total_limit.toFixed(2),
        spent: (spend?.spent_amount || 0).toFixed(2),
        remaining: (budget.total_limit - (spend?.spent_amount || 0)).toFixed(2),
        percentage: ((spend?.spent_amount || 0) / budget.total_limit * 100).toFixed(1),
        created: format(new Date(budget.created_at), 'yyyy-MM-dd'),
      };
    });

    const csv = [
      ['Name', 'Period', 'Limit', 'Spent', 'Remaining', 'Usage %', 'Created'],
      ...csvData.map(row => [
        row.name,
        row.period,
        row.limit,
        row.spent,
        row.remaining,
        row.percentage,
        row.created,
      ])
    ].map(row => row.join(',')).join('\n');

    this.downloadFile(csv, `budgets-${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');
  }

  /**
   * Export transactions to CSV
   */
  static exportTransactionsToCSV(transactions: any[]) {
    const csvData = transactions.map(tx => ({
      date: format(new Date(tx.date), 'yyyy-MM-dd'),
      description: `"${tx.description?.replace(/"/g, '""') || ''}"`,
      category: tx.category || 'Uncategorized',
      amount: tx.amount.toFixed(2),
      type: tx.amount < 0 ? 'Expense' : 'Income',
      account: tx.account_name || '',
    }));

    const csv = [
      ['Date', 'Description', 'Category', 'Amount', 'Type', 'Account'],
      ...csvData.map(row => [
        row.date,
        row.description,
        row.category,
        row.amount,
        row.type,
        row.account,
      ])
    ].map(row => row.join(',')).join('\n');

    this.downloadFile(
      csv,
      `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`,
      'text/csv'
    );
  }

  /**
   * Export analytics data to CSV
   */
  static exportAnalyticsToCSV(budgets: any[], spending: Record<string, any>, categories: any[]) {
    const analytics = budgets.map(budget => {
      const spend = spending[budget.id];
      const categoryBreakdown = budget.category_limits || {};
      
      return {
        budget: budget.name,
        period: budget.period,
        total_limit: budget.total_limit,
        total_spent: spend?.spent_amount || 0,
        remaining: budget.total_limit - (spend?.spent_amount || 0),
        categories: Object.keys(categoryBreakdown).length,
        transaction_count: spend?.transaction_count || 0,
      };
    });

    const csv = [
      ['Budget', 'Period', 'Total Limit', 'Total Spent', 'Remaining', 'Categories', 'Transactions'],
      ...analytics.map(row => [
        row.budget,
        row.period,
        row.total_limit.toFixed(2),
        row.total_spent.toFixed(2),
        row.remaining.toFixed(2),
        row.categories,
        row.transaction_count,
      ])
    ].map(row => row.join(',')).join('\n');

    this.downloadFile(
      csv,
      `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`,
      'text/csv'
    );
  }

  /**
   * Generate PDF budget report with charts
   */
  static generatePDFReport(data: ExportData) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(10, 10, 10);
    doc.text('Budget Report', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(format(new Date(), 'MMMM dd, yyyy'), pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;

    // Summary section
    doc.setFontSize(16);
    doc.setTextColor(10, 10, 10);
    doc.text('Budget Summary', 14, yPosition);
    yPosition += 10;

    const totalLimit = data.budgets.reduce((sum, b) => sum + b.total_limit, 0);
    const totalSpent = data.budgets.reduce((sum, b) => {
      const spend = data.spending?.[b.id];
      return sum + (spend?.spent_amount || 0);
    }, 0);
    const totalRemaining = totalLimit - totalSpent;

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Total Budget: $${totalLimit.toFixed(2)}`, 14, yPosition);
    yPosition += 7;
    doc.text(`Total Spent: $${totalSpent.toFixed(2)}`, 14, yPosition);
    yPosition += 7;
    doc.text(`Remaining: $${totalRemaining.toFixed(2)}`, 14, yPosition);
    yPosition += 7;
    doc.text(`Overall Usage: ${((totalSpent / totalLimit) * 100).toFixed(1)}%`, 14, yPosition);
    yPosition += 15;

    // Budget details table
    doc.setFontSize(16);
    doc.setTextColor(10, 10, 10);
    doc.text('Budget Details', 14, yPosition);
    yPosition += 5;

    const tableData = data.budgets.map(budget => {
      const spend = data.spending?.[budget.id];
      const spent = spend?.spent_amount || 0;
      const remaining = budget.total_limit - spent;
      const percentage = (spent / budget.total_limit) * 100;

      return [
        budget.name,
        budget.period,
        `$${budget.total_limit.toFixed(2)}`,
        `$${spent.toFixed(2)}`,
        `$${remaining.toFixed(2)}`,
        `${percentage.toFixed(1)}%`,
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['Budget', 'Period', 'Limit', 'Spent', 'Remaining', 'Usage']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [40, 40, 40],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Category breakdown (if space allows)
    if (yPosition < pageHeight - 60) {
      doc.setFontSize(16);
      doc.setTextColor(10, 10, 10);
      doc.text('Category Breakdown', 14, yPosition);
      yPosition += 5;

      const categoryData: any[] = [];
      data.budgets.forEach(budget => {
        const categoryLimits = budget.category_limits || {};
        Object.entries(categoryLimits).forEach(([categoryId, limit]) => {
          const category = data.categories?.find(c => c.id === categoryId);
          categoryData.push([
            budget.name,
            category?.name || 'Unknown',
            `$${(limit as number).toFixed(2)}`,
          ]);
        });
      });

      if (categoryData.length > 0) {
        autoTable(doc, {
          startY: yPosition,
          head: [['Budget', 'Category', 'Allocated']],
          body: categoryData,
          theme: 'striped',
          headStyles: {
            fillColor: [52, 152, 219],
            textColor: 255,
            fontSize: 10,
          },
          bodyStyles: {
            fontSize: 9,
          },
          margin: { left: 14, right: 14 },
        });
      }
    }

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        '© $ave+ Budget Report',
        pageWidth - 14,
        pageHeight - 10,
        { align: 'right' }
      );
    }

    // Save PDF
    doc.save(`budget-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  }

  /**
   * Export complete account backup (JSON)
   */
  static exportFullBackup(data: {
    budgets: any[];
    transactions: any[];
    categories: any[];
    goals?: any[];
    pots?: any[];
    profile?: any;
  }) {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data,
    };

    const json = JSON.stringify(backup, null, 2);
    this.downloadFile(
      json,
      `saveplus-backup-${format(new Date(), 'yyyy-MM-dd')}.json`,
      'application/json'
    );
  }

  /**
   * Parse imported CSV file
   */
  static async parseCSV(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            reject(new Error('CSV file is empty or invalid'));
            return;
          }

          const headers = lines[0].split(',').map(h => h.trim());
          const data = lines.slice(1).map(line => {
            const values = this.parseCSVLine(line);
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header.toLowerCase().replace(/\s+/g, '_')] = values[index];
            });
            return obj;
          });

          resolve(data);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Parse CSV line handling quoted values
   */
  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * Download file helper
   */
  private static downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  /**
   * Generate print-friendly HTML
   */
  static generatePrintView(data: ExportData): string {
    const totalLimit = data.budgets.reduce((sum, b) => sum + b.total_limit, 0);
    const totalSpent = data.budgets.reduce((sum, b) => {
      const spend = data.spending?.[b.id];
      return sum + (spend?.spent_amount || 0);
    }, 0);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Budget Report - ${format(new Date(), 'yyyy-MM-dd')}</title>
        <style>
          @media print {
            @page { margin: 1cm; }
            body { font-family: Arial, sans-serif; }
          }
          body {
            font-family: Arial, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
          }
          h1 { 
            text-align: center; 
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .date {
            text-align: center;
            color: #7f8c8d;
            margin-bottom: 30px;
          }
          .summary {
            background: #ecf0f1;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            font-size: 16px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background: #3498db;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background: #f9f9f9;
          }
          .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            color: #7f8c8d;
            font-size: 14px;
          }
          .over-budget { color: #e74c3c; font-weight: bold; }
          .under-budget { color: #27ae60; }
        </style>
      </head>
      <body>
        <h1>Budget Report</h1>
        <div class="date">${format(new Date(), 'MMMM dd, yyyy')}</div>
        
        <div class="summary">
          <h2>Summary</h2>
          <div class="summary-item">
            <span>Total Budget:</span>
            <strong>$${totalLimit.toFixed(2)}</strong>
          </div>
          <div class="summary-item">
            <span>Total Spent:</span>
            <strong>$${totalSpent.toFixed(2)}</strong>
          </div>
          <div class="summary-item">
            <span>Remaining:</span>
            <strong class="${totalSpent > totalLimit ? 'over-budget' : 'under-budget'}">
              $${(totalLimit - totalSpent).toFixed(2)}
            </strong>
          </div>
          <div class="summary-item">
            <span>Overall Usage:</span>
            <strong>${((totalSpent / totalLimit) * 100).toFixed(1)}%</strong>
          </div>
        </div>

        <h2>Budget Details</h2>
        <table>
          <thead>
            <tr>
              <th>Budget Name</th>
              <th>Period</th>
              <th>Limit</th>
              <th>Spent</th>
              <th>Remaining</th>
              <th>Usage</th>
            </tr>
          </thead>
          <tbody>
            ${data.budgets.map(budget => {
              const spend = data.spending?.[budget.id];
              const spent = spend?.spent_amount || 0;
              const remaining = budget.total_limit - spent;
              const percentage = (spent / budget.total_limit) * 100;
              
              return `
                <tr>
                  <td>${budget.name}</td>
                  <td>${budget.period}</td>
                  <td>$${budget.total_limit.toFixed(2)}</td>
                  <td>$${spent.toFixed(2)}</td>
                  <td class="${spent > budget.total_limit ? 'over-budget' : 'under-budget'}">
                    $${remaining.toFixed(2)}
                  </td>
                  <td>${percentage.toFixed(1)}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>© ${new Date().getFullYear()} $ave+ | Budget Management System</p>
          <p>Generated on ${format(new Date(), 'PPpp')}</p>
        </div>
      </body>
      </html>
    `;
  }
}
