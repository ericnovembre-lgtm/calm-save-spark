import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface ScenarioExportData {
  name: string;
  currentAge: number;
  retirementAge: number;
  initialNetWorth: number;
  events: Array<{
    id: string;
    year: number;
    event: {
      icon: string;
      label: string;
      impact: number;
      description: string;
    };
  }>;
  timeline: Array<{ year: number; netWorth: number }>;
  monteCarloData?: Array<{
    year: number;
    age: number;
    median: number;
    p10: number;
    p90: number;
  }>;
  comparison?: {
    pathA: { name: string; timeline: any[] };
    pathB: { name: string; timeline: any[] };
  };
}

interface ChartOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function generateScenarioPDF(data: ScenarioExportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;

  // Page 1 - Executive Summary
  drawHeader(doc, data.name, margin);
  drawKeyMetrics(doc, data, margin, 40);
  drawLifeEventsTable(doc, data.events, margin, 110);
  addFooter(doc, 1);

  // Page 2 - Timeline Chart
  doc.addPage();
  drawHeader(doc, `${data.name} - Timeline Projection`, margin);
  drawTimelineChart(doc, data.timeline, data.events, {
    x: margin,
    y: 50,
    width: pageWidth - 2 * margin,
    height: 100,
  });
  addFooter(doc, 2);

  // Page 3 - Monte Carlo (if available)
  if (data.monteCarloData && data.monteCarloData.length > 0) {
    doc.addPage();
    drawHeader(doc, `${data.name} - Monte Carlo Projections`, margin);
    drawMonteCarloChart(doc, data.monteCarloData, {
      x: margin,
      y: 50,
      width: pageWidth - 2 * margin,
      height: 100,
    });
    addFooter(doc, 3);
  }

  // Page 4 - Comparison (if available)
  if (data.comparison) {
    doc.addPage();
    drawHeader(doc, 'Scenario Comparison', margin);
    drawComparisonChart(doc, data.comparison, {
      x: margin,
      y: 50,
      width: pageWidth - 2 * margin,
      height: 100,
    });
    addFooter(doc, 4);
  }

  // Save the PDF
  const fileName = `${data.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

function drawHeader(doc: jsPDF, title: string, margin: number): void {
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text('◢◤ $AVE+ DIGITAL TWIN REPORT ◥◣', margin, 20);
  
  doc.setFontSize(14);
  doc.text(title, margin, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 35);
  
  // Separator line
  doc.setDrawColor(0, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, 37, doc.internal.pageSize.width - margin, 37);
}

function drawKeyMetrics(doc: jsPDF, data: ScenarioExportData, x: number, y: number): void {
  const finalNetWorth = data.timeline[data.timeline.length - 1]?.netWorth || 0;
  const totalImpact = data.events.reduce((sum, e) => sum + (e.event.impact || 0), 0);
  const yearsToRetirement = data.retirementAge - data.currentAge;
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('KEY METRICS', x, y);
  
  // Draw metric boxes
  doc.setFontSize(10);
  const boxY = y + 5;
  const boxHeight = 20;
  const boxWidth = 50;
  
  // Current Net Worth
  doc.setDrawColor(200, 200, 200);
  doc.rect(x, boxY, boxWidth, boxHeight);
  doc.text('Current Net Worth', x + 2, boxY + 5);
  doc.setFontSize(12);
  doc.text(formatCurrency(data.initialNetWorth), x + 2, boxY + 12);
  
  // Projected Net Worth
  doc.setFontSize(10);
  doc.rect(x + boxWidth + 5, boxY, boxWidth, boxHeight);
  doc.text('Projected (Retire)', x + boxWidth + 7, boxY + 5);
  doc.setFontSize(12);
  doc.text(formatCurrency(finalNetWorth), x + boxWidth + 7, boxY + 12);
  
  // Years to Retirement
  doc.setFontSize(10);
  doc.rect(x + (boxWidth + 5) * 2, boxY, boxWidth, boxHeight);
  doc.text('Years to Retire', x + (boxWidth + 5) * 2 + 2, boxY + 5);
  doc.setFontSize(12);
  doc.text(yearsToRetirement.toString(), x + (boxWidth + 5) * 2 + 2, boxY + 12);
  
  // Events impact
  doc.setFontSize(10);
  doc.text(`Life Events: ${data.events.length}`, x, boxY + boxHeight + 10);
  doc.text(`Total Impact: ${formatCurrency(totalImpact)}`, x, boxY + boxHeight + 15);
  
  const impactColor: [number, number, number] = totalImpact >= 0 ? [34, 197, 94] : [239, 68, 68];
  doc.setTextColor(impactColor[0], impactColor[1], impactColor[2]);
  doc.text(totalImpact >= 0 ? '↑ Positive' : '↓ Negative', x + 50, boxY + boxHeight + 15);
  doc.setTextColor(0, 0, 0);
}

function drawLifeEventsTable(doc: jsPDF, events: ScenarioExportData['events'], x: number, y: number): void {
  doc.setFontSize(12);
  doc.text('LIFE EVENTS', x, y);
  
  const tableData = events.map(e => [
    `Age ${e.year}`,
    `${e.event.icon} ${e.event.label}`,
    formatCurrency(e.event.impact || 0),
    e.event.description || '',
  ]);
  
  (doc as any).autoTable({
    startY: y + 5,
    head: [['Age', 'Event', 'Impact', 'Description']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [0, 200, 200], textColor: [255, 255, 255] },
    styles: { fontSize: 9 },
    columnStyles: {
      2: { 
        cellWidth: 30,
        halign: 'right',
      }
    },
  });
}

function drawTimelineChart(
  doc: jsPDF,
  timeline: Array<{ year: number; netWorth: number }>,
  events: ScenarioExportData['events'],
  options: ChartOptions
): void {
  const { x, y, width, height } = options;
  
  doc.setFontSize(12);
  doc.text('NET WORTH PROJECTION', x, y - 5);
  
  // Draw axes
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);
  doc.line(x, y, x, y + height); // Y-axis
  doc.line(x, y + height, x + width, y + height); // X-axis
  
  // Calculate scales
  const maxNetWorth = Math.max(...timeline.map(t => t.netWorth));
  const minNetWorth = Math.min(...timeline.map(t => t.netWorth), 0);
  const netWorthRange = maxNetWorth - minNetWorth;
  const scaleY = height / netWorthRange;
  const scaleX = width / (timeline.length - 1);
  
  // Draw grid lines
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.2);
  for (let i = 0; i <= 4; i++) {
    const gridY = y + (height / 4) * i;
    doc.line(x, gridY, x + width, gridY);
    const value = maxNetWorth - (netWorthRange / 4) * i;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(formatCurrency(value), x - 15, gridY + 2);
  }
  
  // Draw timeline line
  doc.setDrawColor(0, 200, 200);
  doc.setLineWidth(1);
  
  for (let i = 0; i < timeline.length - 1; i++) {
    const x1 = x + i * scaleX;
    const y1 = y + height - ((timeline[i].netWorth - minNetWorth) * scaleY);
    const x2 = x + (i + 1) * scaleX;
    const y2 = y + height - ((timeline[i + 1].netWorth - minNetWorth) * scaleY);
    doc.line(x1, y1, x2, y2);
  }
  
  // Draw event markers
  events.forEach(event => {
    const eventIndex = timeline.findIndex(t => t.year === event.year);
    if (eventIndex !== -1) {
      const eventX = x + eventIndex * scaleX;
      const eventY = y + height - ((timeline[eventIndex].netWorth - minNetWorth) * scaleY);
      
      // Draw marker
      const color: [number, number, number] = (event.event.impact || 0) >= 0 ? [34, 197, 94] : [239, 68, 68];
      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(eventX, eventY, 2, 'F');
      
      // Draw label
      doc.setFontSize(7);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(event.event.icon, eventX - 2, eventY - 5);
    }
  });
  
  // X-axis labels
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const labelStep = Math.ceil(timeline.length / 6);
  for (let i = 0; i < timeline.length; i += labelStep) {
    const labelX = x + i * scaleX;
    doc.text(timeline[i].year.toString(), labelX - 5, y + height + 5);
  }
  
  // Legend
  drawLegend(doc, x, y + height + 15);
}

function drawMonteCarloChart(
  doc: jsPDF,
  data: Array<{ year: number; age: number; median: number; p10: number; p90: number }>,
  options: ChartOptions
): void {
  const { x, y, width, height } = options;
  
  doc.setFontSize(12);
  doc.text('MONTE CARLO PROBABILITY CONE', x, y - 5);
  
  // Draw axes
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);
  doc.line(x, y, x, y + height);
  doc.line(x, y + height, x + width, y + height);
  
  // Calculate scales
  const maxValue = Math.max(...data.map(d => d.p90));
  const minValue = Math.min(...data.map(d => d.p10), 0);
  const range = maxValue - minValue;
  const scaleY = height / range;
  const scaleX = width / (data.length - 1);
  
  // Draw P90 area (optimistic)
  doc.setFillColor(34, 197, 94, 0.2);
  const p90Points: number[][] = [];
  data.forEach((d, i) => {
    const pointX = x + i * scaleX;
    const pointY = y + height - ((d.p90 - minValue) * scaleY);
    p90Points.push([pointX, pointY]);
  });
  
  // Draw P10 area (pessimistic)
  doc.setFillColor(239, 68, 68, 0.2);
  const p10Points: number[][] = [];
  data.forEach((d, i) => {
    const pointX = x + i * scaleX;
    const pointY = y + height - ((d.p10 - minValue) * scaleY);
    p10Points.push([pointX, pointY]);
  });
  
  // Draw shaded area between P10 and P90
  doc.setFillColor(200, 200, 200, 0.3);
  doc.setDrawColor(200, 200, 200);
  for (let i = 0; i < data.length - 1; i++) {
    const x1 = x + i * scaleX;
    const y1_p90 = y + height - ((data[i].p90 - minValue) * scaleY);
    const y1_p10 = y + height - ((data[i].p10 - minValue) * scaleY);
    const x2 = x + (i + 1) * scaleX;
    const y2_p90 = y + height - ((data[i + 1].p90 - minValue) * scaleY);
    const y2_p10 = y + height - ((data[i + 1].p10 - minValue) * scaleY);
    
    // Draw polygon
    doc.setFillColor(150, 150, 150, 0.2);
    doc.triangle(x1, y1_p90, x2, y2_p90, x1, y1_p10, 'F');
    doc.triangle(x2, y2_p90, x2, y2_p10, x1, y1_p10, 'F');
  }
  
  // Draw median line (P50)
  doc.setDrawColor(0, 200, 200);
  doc.setLineWidth(1.5);
  for (let i = 0; i < data.length - 1; i++) {
    const x1 = x + i * scaleX;
    const y1 = y + height - ((data[i].median - minValue) * scaleY);
    const x2 = x + (i + 1) * scaleX;
    const y2 = y + height - ((data[i + 1].median - minValue) * scaleY);
    doc.line(x1, y1, x2, y2);
  }
  
  // Y-axis labels
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  for (let i = 0; i <= 4; i++) {
    const gridY = y + (height / 4) * i;
    const value = maxValue - (range / 4) * i;
    doc.text(formatCurrency(value), x - 15, gridY + 2);
  }
  
  // Labels
  doc.setFontSize(9);
  doc.setTextColor(34, 197, 94);
  doc.text('P90 (Optimistic)', x + width - 35, y + 10);
  doc.setTextColor(0, 200, 200);
  doc.text('P50 (Median)', x + width - 35, y + 15);
  doc.setTextColor(239, 68, 68);
  doc.text('P10 (Pessimistic)', x + width - 35, y + 20);
}

function drawComparisonChart(
  doc: jsPDF,
  comparison: NonNullable<ScenarioExportData['comparison']>,
  options: ChartOptions
): void {
  const { x, y, width, height } = options;
  
  doc.setFontSize(12);
  doc.text('SCENARIO COMPARISON', x, y - 5);
  
  // Draw axes
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);
  doc.line(x, y, x, y + height);
  doc.line(x, y + height, x + width, y + height);
  
  // Draw both paths
  const pathAColor: [number, number, number] = [0, 200, 200];
  const pathBColor: [number, number, number] = [139, 92, 246];
  
  // Legend
  doc.setFontSize(9);
  doc.setTextColor(pathAColor[0], pathAColor[1], pathAColor[2]);
  doc.text(`Path A: ${comparison.pathA.name}`, x + width - 50, y + 10);
  doc.setTextColor(pathBColor[0], pathBColor[1], pathBColor[2]);
  doc.text(`Path B: ${comparison.pathB.name}`, x + width - 50, y + 15);
}

function drawLegend(doc: jsPDF, x: number, y: number): void {
  doc.setFontSize(8);
  doc.setTextColor(0, 200, 200);
  doc.text('━ Projected Net Worth', x, y);
  
  doc.setTextColor(34, 197, 94);
  doc.text('● Positive Event', x + 45, y);
  
  doc.setTextColor(239, 68, 68);
  doc.text('● Negative Event', x + 80, y);
}

function addFooter(doc: jsPDF, pageNum: number): void {
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Page ${pageNum}`, 105, pageHeight - 10, { align: 'center' });
  doc.text('$ave+ Digital Twin Report', 20, pageHeight - 10);
  doc.text('Projections are estimates', doc.internal.pageSize.width - 20, pageHeight - 10, { align: 'right' });
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return `$${value.toFixed(0)}`;
}
