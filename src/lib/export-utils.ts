import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportData {
  title: string;
  headers: string[];
  rows: any[][];
  summary?: { label: string; value: string }[];
}

export const exportToPDF = (data: ExportData) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(data.title, 14, 22);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Add summary if provided
  let startY = 40;
  if (data.summary) {
    doc.setFontSize(12);
    doc.text('Summary', 14, startY);
    startY += 8;
    
    data.summary.forEach((item) => {
      doc.setFontSize(10);
      doc.text(`${item.label}: ${item.value}`, 14, startY);
      startY += 6;
    });
    startY += 10;
  }
  
  // Add table
  autoTable(doc, {
    head: [data.headers],
    body: data.rows,
    startY,
    theme: 'grid',
    headStyles: { fillColor: [214, 200, 162] },
    styles: { fontSize: 9 },
  });
  
  // Add footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text('$ave+', 14, doc.internal.pageSize.height - 10);
  }
  
  doc.save(`${data.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`);
};

export const exportToCSV = (data: ExportData) => {
  const csvContent = [
    data.headers.join(','),
    ...data.rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${data.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (data: ExportData) => {
  // Create a simple HTML table structure for Excel
  const htmlTable = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8">
      <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #d6c8a2; font-weight: bold; }
        .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .summary { margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="title">${data.title}</div>
      <div>Generated: ${new Date().toLocaleDateString()}</div>
      ${data.summary ? `
        <div class="summary">
          <strong>Summary:</strong><br/>
          ${data.summary.map(s => `${s.label}: ${s.value}`).join('<br/>')}
        </div>
      ` : ''}
      <table>
        <thead>
          <tr>${data.headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${data.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      <div style="margin-top: 20px; font-size: 10px;">$ave+</div>
    </body>
    </html>
  `;
  
  const blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${data.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.xls`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
