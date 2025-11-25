import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
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
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!qrContainerRef.current) return;
    
    const svg = qrContainerRef.current.querySelector('svg');
    if (!svg) return;

    // Convert SVG to canvas for download
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 480;
      
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw QR code
      ctx.drawImage(img, 50, 40, 300, 300);
      
      // Add text info
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 16px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('$ave+ Wallet Backup', canvas.width / 2, 370);
      
      ctx.font = '12px monospace';
      ctx.fillText(`${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`, canvas.width / 2, 395);
      ctx.fillText(new Date(timestamp).toLocaleDateString(), canvas.width / 2, 415);
      
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 14px Inter, system-ui, sans-serif';
      ctx.fillText('⚠️ Keep This Secure!', canvas.width / 2, 450);
      
      // Download
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `save-plus-wallet-backup-${Date.now()}.png`;
      link.href = url;
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handlePrint = () => {
    if (!qrContainerRef.current) return;
    
    const svg = qrContainerRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>$ave+ Wallet Backup</title>
          <style>
            body {
              text-align: center;
              padding: 40px;
              font-family: system-ui, -apple-system, sans-serif;
            }
            h1 { margin-bottom: 30px; }
            .qr-container { margin: 30px auto; }
            .warning { color: #ef4444; font-weight: bold; margin-top: 30px; font-size: 18px; }
            .info { margin-top: 20px; color: #666; }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>$ave+ Wallet Backup</h1>
          <div class="qr-container">
            ${svgData}
          </div>
          <div class="info">
            <p><strong>Wallet Address:</strong> ${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}</p>
            <p><strong>Backup Date:</strong> ${new Date(timestamp).toLocaleString()}</p>
          </div>
          <p class="warning">⚠️ Store this in a secure, offline location</p>
          <p>Never share this QR code with anyone</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
    <div className="space-y-6">
      {/* QR Code Display */}
      <div 
        ref={qrContainerRef}
        className="bg-white p-8 rounded-2xl border-2 border-border mx-auto w-fit"
      >
        <QRCodeSVG
          value={data}
          size={300}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: "/favicon.ico",
            x: undefined,
            y: undefined,
            height: 40,
            width: 40,
            excavate: true,
          }}
        />
        
        <div className="mt-4 text-center space-y-1">
          <p className="text-xs font-semibold text-gray-900">$ave+ Wallet Backup</p>
          <p className="text-[10px] font-mono text-gray-600">
            {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
          </p>
          <p className="text-[10px] text-gray-500">
            {new Date(timestamp).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <Button onClick={handleDownload} variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Download PNG
        </Button>
        <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
          <Printer className="w-4 h-4" />
          Print
        </Button>
      </div>

      {/* Security Warning */}
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 space-y-2">
        <p className="text-sm font-semibold text-destructive flex items-center gap-2">
          ⚠️ Critical Security Information
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>This QR code contains your encrypted wallet backup</li>
          <li>Store it in a secure, offline location (safe, lockbox)</li>
          <li>Never share, photograph, or post this code online</li>
          <li>Anyone with this code AND your password can access your wallet</li>
        </ul>
      </div>
    </div>
  );
}
