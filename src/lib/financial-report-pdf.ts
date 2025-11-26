import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportSection {
  title: string;
  data: any;
  type: 'netWorth' | 'health' | 'accounts' | 'debts' | 'goals';
}

interface FinancialReportData {
  reportMonth: string;
  generatedDate: string;
  sections: ReportSection[];
}

export async function generateFinancialReportPDF(reportData: FinancialReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 20;

  // Header with branding
  doc.setFillColor(250, 248, 242); // --orbital-bg
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setFontSize(24);
  doc.setTextColor(10, 10, 10); // --orbital-text
  doc.text('$ave+ Monthly Financial Report', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(reportData.reportMonth, pageWidth / 2, 30, { align: 'center' });
  
  currentY = 50;

  // Generated date
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated: ${reportData.generatedDate}`, 14, currentY);
  currentY += 15;

  // Render each section
  for (const section of reportData.sections) {
    // Check if we need a new page
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = 20;
    }

    switch (section.type) {
      case 'netWorth':
        currentY = renderNetWorthSection(doc, section.data, currentY, pageWidth);
        break;
      case 'health':
        currentY = renderHealthSection(doc, section.data, currentY, pageWidth);
        break;
      case 'accounts':
        currentY = renderAccountsSection(doc, section.data, currentY, pageWidth);
        break;
      case 'debts':
        currentY = renderDebtsSection(doc, section.data, currentY, pageWidth);
        break;
      case 'goals':
        currentY = renderGoalsSection(doc, section.data, currentY, pageWidth);
        break;
    }

    currentY += 10; // Space between sections
  }

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `$ave+ Financial Report - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  doc.save(`save-plus-financial-report-${reportData.reportMonth.replace(' ', '-')}.pdf`);
}

function renderNetWorthSection(doc: jsPDF, data: any, startY: number, pageWidth: number): number {
  doc.setFontSize(16);
  doc.setTextColor(10, 10, 10);
  doc.text('Net Worth Summary', 14, startY);
  startY += 10;

  autoTable(doc, {
    startY,
    head: [['Metric', 'Value']],
    body: [
      ['Current Net Worth', `$${data.currentNetWorth?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`],
      ['Total Assets', `$${data.totalAssets?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`],
      ['Total Liabilities', `$${data.totalDebts?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`],
      ['Monthly Change', `${data.monthlyChange >= 0 ? '+' : ''}$${data.monthlyChange?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`],
      ['YTD Change', `${data.ytdChange >= 0 ? '+' : ''}$${data.ytdChange?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [214, 200, 162], textColor: [10, 10, 10] },
    margin: { left: 14, right: 14 },
  });

  return (doc as any).lastAutoTable.finalY + 5;
}

function renderHealthSection(doc: jsPDF, data: any, startY: number, pageWidth: number): number {
  doc.setFontSize(16);
  doc.setTextColor(10, 10, 10);
  doc.text('Financial Health Metrics', 14, startY);
  startY += 10;

  autoTable(doc, {
    startY,
    head: [['Metric', 'Score']],
    body: [
      ['Composite Score', `${data.compositeScore || 0}/100`],
      ['Credit Score', `${data.creditScore || 0}`],
      ['Savings Rate', `${data.savingsRate || 0}%`],
      ['Debt-to-Income Ratio', `${data.debtToIncomeRatio || 0}%`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [214, 200, 162], textColor: [10, 10, 10] },
    margin: { left: 14, right: 14 },
  });

  return (doc as any).lastAutoTable.finalY + 5;
}

function renderAccountsSection(doc: jsPDF, data: any[], startY: number, pageWidth: number): number {
  doc.setFontSize(16);
  doc.setTextColor(10, 10, 10);
  doc.text('Connected Accounts', 14, startY);
  startY += 10;

  if (data.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('No accounts connected', 14, startY);
    return startY + 10;
  }

  autoTable(doc, {
    startY,
    head: [['Institution', 'Type', 'Balance']],
    body: data.map(acc => [
      acc.institution_name || 'Unknown',
      acc.account_type || 'N/A',
      `$${acc.current_balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`,
    ]),
    theme: 'grid',
    headStyles: { fillColor: [214, 200, 162], textColor: [10, 10, 10] },
    margin: { left: 14, right: 14 },
  });

  return (doc as any).lastAutoTable.finalY + 5;
}

function renderDebtsSection(doc: jsPDF, data: any[], startY: number, pageWidth: number): number {
  doc.setFontSize(16);
  doc.setTextColor(10, 10, 10);
  doc.text('Debts & Liabilities', 14, startY);
  startY += 10;

  if (data.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('No debts recorded', 14, startY);
    return startY + 10;
  }

  autoTable(doc, {
    startY,
    head: [['Name', 'Type', 'Balance', 'Min Payment']],
    body: data.map(debt => [
      debt.debt_name || 'Unknown',
      debt.debt_type || 'N/A',
      `$${debt.current_balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`,
      `$${debt.minimum_payment?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`,
    ]),
    theme: 'grid',
    headStyles: { fillColor: [214, 200, 162], textColor: [10, 10, 10] },
    margin: { left: 14, right: 14 },
  });

  return (doc as any).lastAutoTable.finalY + 5;
}

function renderGoalsSection(doc: jsPDF, data: any[], startY: number, pageWidth: number): number {
  doc.setFontSize(16);
  doc.setTextColor(10, 10, 10);
  doc.text('Financial Goals', 14, startY);
  startY += 10;

  if (data.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('No goals set', 14, startY);
    return startY + 10;
  }

  autoTable(doc, {
    startY,
    head: [['Goal', 'Target', 'Current', 'Progress']],
    body: data.map(goal => {
      const progress = goal.target_amount > 0 
        ? Math.round((goal.current_amount / goal.target_amount) * 100)
        : 0;
      return [
        goal.goal_name || 'Unknown',
        `$${goal.target_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`,
        `$${goal.current_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`,
        `${progress}%`,
      ];
    }),
    theme: 'grid',
    headStyles: { fillColor: [214, 200, 162], textColor: [10, 10, 10] },
    margin: { left: 14, right: 14 },
  });

  return (doc as any).lastAutoTable.finalY + 5;
}
