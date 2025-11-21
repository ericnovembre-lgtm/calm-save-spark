import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

export function HubTheaterMode({ children }: Props) {
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsTheaterMode(true)}
        variant="outline"
        size="sm"
        className="fixed top-20 right-6 z-40"
      >
        <Maximize2 className="w-4 h-4 mr-2" />
        Theater Mode
      </Button>

      <AnimatePresence>
        {isTheaterMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <Button
              onClick={() => setIsTheaterMode(false)}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10"
            >
              <X className="w-6 h-6" />
            </Button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="h-full overflow-auto p-8"
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
