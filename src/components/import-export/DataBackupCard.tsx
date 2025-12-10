import { motion } from 'framer-motion';
import { HardDrive, Download, Upload, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDataPortability } from '@/hooks/useDataPortability';
import { useRef } from 'react';

export function DataBackupCard() {
  const { createFullBackup, restoreFromBackup, isBackingUp, isRestoring } = useDataPortability();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      restoreFromBackup.mutate(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="w-5 h-5" />
          Data Backup & Restore
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Your data, your control</p>
              <p className="text-sm text-muted-foreground">
                Create a complete backup of all your financial data including transactions, 
                goals, budgets, and settings. Restore anytime.
              </p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className="w-full h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => createFullBackup.mutate()}
              disabled={isBackingUp}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <span className="font-medium">
                {isBackingUp ? 'Creating Backup...' : 'Create Backup'}
              </span>
              <span className="text-xs text-muted-foreground">
                Download JSON file
              </span>
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleRestore}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isRestoring}
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-amber-500" />
              </div>
              <span className="font-medium">
                {isRestoring ? 'Restoring...' : 'Restore from Backup'}
              </span>
              <span className="text-xs text-muted-foreground">
                Upload JSON file
              </span>
            </Button>
          </motion.div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Backups are encrypted and include all your personal financial data.
          Keep your backup file in a secure location.
        </p>
      </CardContent>
    </Card>
  );
}
