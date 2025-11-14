/**
 * Lazy-loaded PDF export utilities
 * Only loads jsPDF when user initiates export
 */

interface ExportData {
  title: string;
  headers: string[];
  rows: any[][];
  summary?: { label: string; value: string }[];
}

let exportModule: typeof import('./export-utils') | null = null;

async function loadExportUtils() {
  if (!exportModule) {
    exportModule = await import('./export-utils');
  }
  return exportModule;
}

export async function exportToPDF(data: ExportData) {
  const utils = await loadExportUtils();
  return utils.exportToPDF(data);
}

export async function exportToCSV(data: ExportData) {
  const utils = await loadExportUtils();
  return utils.exportToCSV(data);
}

export async function exportToExcel(data: ExportData) {
  const utils = await loadExportUtils();
  return utils.exportToExcel(data);
}
