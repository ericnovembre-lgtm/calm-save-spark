import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
      ],
      thresholds: {
        // Global thresholds
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
      // Per-file thresholds for critical transaction alert code
      perFile: true,
      '100': {
        // Stricter thresholds for transaction alert system
        'src/hooks/useTransactionAlerts.ts': {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/components/alerts/TransactionAlertToast.tsx': {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/components/alerts/TransactionAlertBanner.tsx': {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
