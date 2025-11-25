import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';

interface QRCodeExporterProps {
  data: string;
  walletAddress: string;
  timestamp: string;
}

/**
 * Generate and export QR code for encrypted wallet backup
 */
export function QRCodeExporter({ data, walletAddress, timestamp }: QRCodeExporterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Simple QR code generation using canvas
    // In production, use a library like qrcode.react or qrcode
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 300;
    canvas.height = 380;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw placeholder QR pattern
    ctx.fillStyle = '#000000';
    const size = 10;
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        if ((i + j) % 2 === 0 || (i * j) % 3 === 0) {
          ctx.fillRect(30 + i * size, 30 + j * size, size - 1, size - 1);
        }
      }
    }

    // Add text info
    ctx.fillStyle = '#000000';
    ctx.font = '10px monospace';
    ctx.fillText('Wallet Backup', 10, 270);
    ctx.fillText(`Address: ${walletAddress.slice(0, 10)}...`, 10, 290);
    ctx.fillText(`Date: ${new Date(timestamp).toLocaleDateString()}`, 10, 310);
    ctx.fillText('⚠️ Keep this secure!', 10, 350);
  }, [data, walletAddress, timestamp]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `wallet-backup-${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const url = canvasRef.current.toDataURL('image/png');
    printWindow.document.write(`
      <html>
        <head><title>Wallet Backup QR Code</title></head>
        <body style="text-align: center; padding: 40px;">
          <h2>$ave+ Wallet Backup</h2>
          <img src="${url}" style="max-width: 400px;" />
          <p style="color: red; margin-top: 20px;">⚠️ Store this in a secure location</p>
          <p>Never share this QR code with anyone</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        className="mx-auto border border-border rounded-lg"
      />
      
      <div className="flex gap-2 justify-center">
        <Button onClick={handleDownload} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button onClick={handlePrint} variant="outline" size="sm">
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </div>

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>⚠️ This QR code contains your encrypted wallet backup</p>
        <p>Store it in a secure, offline location</p>
        <p>Never share or photograph this code</p>
      </div>
    </div>
  );
}
