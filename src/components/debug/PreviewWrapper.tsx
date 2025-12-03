/**
 * PreviewWrapper - Provides mock context for preview routes
 * Enables visual debugging of protected pages without authentication
 */

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Eye, AlertTriangle } from 'lucide-react';

interface PreviewWrapperProps {
  children: ReactNode;
  pageName: string;
}

export function PreviewWrapper({ children, pageName }: PreviewWrapperProps) {
  const isProduction = import.meta.env.PROD;

  // In production, show warning and don't render content
  if (isProduction) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Preview Mode Disabled</h1>
          <p className="text-white/60">Preview routes are only available in development mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Preview Mode Banner */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white py-2 px-4 flex items-center justify-center gap-3 shadow-lg"
      >
        <Eye className="w-4 h-4" />
        <span className="text-sm font-mono uppercase tracking-wider">
          PREVIEW MODE: {pageName}
        </span>
        <span className="text-xs opacity-70">• Mock Data • No Auth Required</span>
      </motion.div>
      
      {/* Content with top padding to account for banner */}
      <div className="pt-10">
        {children}
      </div>
    </div>
  );
}
