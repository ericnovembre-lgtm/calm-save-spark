import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Table2, FileSpreadsheet } from "lucide-react";
import { exportToPDF, exportToCSV, exportToExcel } from "@/lib/export-utils";
import { toast } from "sonner";

interface ExportButtonProps {
  data: {
    title: string;
    headers: string[];
    rows: any[][];
    summary?: { label: string; value: string }[];
  };
}

export function ExportButton({ data }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    setIsExporting(true);
    try {
      switch (format) {
        case 'pdf':
          exportToPDF(data);
          toast.success('Report exported as PDF');
          break;
        case 'csv':
          exportToCSV(data);
          toast.success('Report exported as CSV');
          break;
        case 'excel':
          exportToExcel(data);
          toast.success('Report exported as Excel');
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="w-4 h-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <Table2 className="w-4 h-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
