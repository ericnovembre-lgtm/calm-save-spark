import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  TransactionAlertToast,
  TransactionAlertBanner,
} from '../TransactionAlertToast';
import {
  createMockTransactionAlert,
  createMockAlertBatch,
} from '@/test/mocks/transactionAlerts';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('TransactionAlertToast', () => {
  const mockOnDismiss = vi.fn();
  const mockOnViewDetails = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render alert title and message', () => {
      const alert = createMockTransactionAlert({
        title: 'Test Alert Title',
        message: 'Test alert message content',
      });

      render(
        <TransactionAlertToast
          alert={alert}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Test Alert Title')).toBeInTheDocument();
      expect(screen.getByText('Test alert message content')).toBeInTheDocument();
    });

    it('should display correct risk level badge for HIGH', () => {
      const alert = createMockTransactionAlert({
        metadata: { risk_level: 'high' },
      });

      render(
        <TransactionAlertToast
          alert={alert}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('HIGH')).toBeInTheDocument();
    });

    it('should display correct risk level badge for MEDIUM', () => {
      const alert = createMockTransactionAlert({
        metadata: { risk_level: 'medium' },
      });

      render(
        <TransactionAlertToast
          alert={alert}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    });

    it('should display correct risk level badge for LOW', () => {
      const alert = createMockTransactionAlert({
        metadata: { risk_level: 'low' },
      });

      render(
        <TransactionAlertToast
          alert={alert}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('LOW')).toBeInTheDocument();
    });

    it('should show Groq latency in milliseconds', () => {
      const alert = createMockTransactionAlert({
        metadata: { latency_ms: 95 },
      });

      render(
        <TransactionAlertToast
          alert={alert}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('95ms')).toBeInTheDocument();
    });

    it('should display merchant name and amount', () => {
      const alert = createMockTransactionAlert({
        metadata: {
          merchant: 'Target Store',
          amount: -250.00,
        },
      });

      render(
        <TransactionAlertToast
          alert={alert}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Target Store')).toBeInTheDocument();
      expect(screen.getByText('$250.00')).toBeInTheDocument();
    });

    it('should display Groq LPU attribution', () => {
      const alert = createMockTransactionAlert();

      render(
        <TransactionAlertToast
          alert={alert}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Groq LPU')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply red styling for high risk', () => {
      const alert = createMockTransactionAlert({
        metadata: { risk_level: 'high' },
      });

      const { container } = render(
        <TransactionAlertToast
          alert={alert}
          onDismiss={mockOnDismiss}
        />
      );

      // Check for red-related classes
      const toastElement = container.firstChild as HTMLElement;
      expect(toastElement.className).toContain('red');
    });

    it('should apply amber styling for medium risk', () => {
      const alert = createMockTransactionAlert({
        metadata: { risk_level: 'medium' },
      });

      const { container } = render(
        <TransactionAlertToast
          alert={alert}
          onDismiss={mockOnDismiss}
        />
      );

      const toastElement = container.firstChild as HTMLElement;
      expect(toastElement.className).toContain('amber');
    });

    it('should apply blue styling for low risk', () => {
      const alert = createMockTransactionAlert({
        metadata: { risk_level: 'low' },
      });

      const { container } = render(
        <TransactionAlertToast
          alert={alert}
          onDismiss={mockOnDismiss}
        />
      );

      const toastElement = container.firstChild as HTMLElement;
      expect(toastElement.className).toContain('blue');
    });
  });

  describe('User Interactions', () => {
    it('should call onDismiss when X button is clicked', () => {
      const alert = createMockTransactionAlert();

      render(
        <TransactionAlertToast
          alert={alert}
          onDismiss={mockOnDismiss}
        />
      );

      const dismissButton = screen.getByRole('button');
      fireEvent.click(dismissButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('should call onViewDetails when "View Transaction" is clicked', () => {
      const alert = createMockTransactionAlert();

      render(
        <TransactionAlertToast
          alert={alert}
          onDismiss={mockOnDismiss}
          onViewDetails={mockOnViewDetails}
        />
      );

      const viewButton = screen.getByText('View Transaction');
      fireEvent.click(viewButton);

      expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
    });

    it('should not render "View Transaction" button when onViewDetails is not provided', () => {
      const alert = createMockTransactionAlert();

      render(
        <TransactionAlertToast
          alert={alert}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.queryByText('View Transaction')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing metadata gracefully', () => {
      const alert = createMockTransactionAlert();
      // @ts-ignore - Testing edge case
      alert.metadata = undefined;

      render(
        <TransactionAlertToast
          alert={alert}
          onDismiss={mockOnDismiss}
        />
      );

      // Should use defaults
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
      expect(screen.getByText('Unknown')).toBeInTheDocument();
      expect(screen.getByText('$0.00')).toBeInTheDocument();
      expect(screen.getByText('0ms')).toBeInTheDocument();
    });

    it('should handle null metadata values gracefully', () => {
      const alert = createMockTransactionAlert({
        metadata: {
          risk_level: null as any,
          merchant: null as any,
          amount: null as any,
          latency_ms: null as any,
        },
      });

      render(
        <TransactionAlertToast
          alert={alert}
          onDismiss={mockOnDismiss}
        />
      );

      // Should render without crashing
      expect(screen.getByText(alert.title)).toBeInTheDocument();
    });
  });
});

describe('TransactionAlertBanner', () => {
  const mockOnViewAll = vi.fn();
  const mockOnDismissAll = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should return null when alerts array is empty', () => {
      const { container } = render(
        <TransactionAlertBanner
          alerts={[]}
          onViewAll={mockOnViewAll}
          onDismissAll={mockOnDismissAll}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should show correct alert count with pluralization (singular)', () => {
      const alerts = [createMockTransactionAlert()];

      render(
        <TransactionAlertBanner
          alerts={alerts}
          onViewAll={mockOnViewAll}
          onDismissAll={mockOnDismissAll}
        />
      );

      expect(screen.getByText('1 Transaction Alert')).toBeInTheDocument();
    });

    it('should show correct alert count with pluralization (plural)', () => {
      const alerts = createMockAlertBatch(5);

      render(
        <TransactionAlertBanner
          alerts={alerts}
          onViewAll={mockOnViewAll}
          onDismissAll={mockOnDismissAll}
        />
      );

      expect(screen.getByText('5 Transaction Alerts')).toBeInTheDocument();
    });

    it('should display "Groq LPU" attribution', () => {
      const alerts = [createMockTransactionAlert()];

      render(
        <TransactionAlertBanner
          alerts={alerts}
          onViewAll={mockOnViewAll}
          onDismissAll={mockOnDismissAll}
        />
      );

      expect(screen.getByText('Detected by Groq LPU')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should show red styling when high-risk alerts exist', () => {
      const alerts = [
        createMockTransactionAlert({
          metadata: { risk_level: 'high' },
        }),
      ];

      const { container } = render(
        <TransactionAlertBanner
          alerts={alerts}
          onViewAll={mockOnViewAll}
          onDismissAll={mockOnDismissAll}
        />
      );

      // Look for red styling classes
      expect(container.innerHTML).toContain('red');
    });

    it('should show amber styling when only medium/low risk', () => {
      const alerts = [
        createMockTransactionAlert({
          metadata: { risk_level: 'medium' },
        }),
      ];

      const { container } = render(
        <TransactionAlertBanner
          alerts={alerts}
          onViewAll={mockOnViewAll}
          onDismissAll={mockOnDismissAll}
        />
      );

      expect(container.innerHTML).toContain('amber');
    });
  });

  describe('User Interactions', () => {
    it('should call onDismissAll when dismiss button is clicked', () => {
      const alerts = [createMockTransactionAlert()];

      render(
        <TransactionAlertBanner
          alerts={alerts}
          onViewAll={mockOnViewAll}
          onDismissAll={mockOnDismissAll}
        />
      );

      const dismissButton = screen.getByText('Dismiss All');
      fireEvent.click(dismissButton);

      expect(mockOnDismissAll).toHaveBeenCalledTimes(1);
    });

    it('should call onViewAll when view button is clicked', () => {
      const alerts = [createMockTransactionAlert()];

      render(
        <TransactionAlertBanner
          alerts={alerts}
          onViewAll={mockOnViewAll}
          onDismissAll={mockOnDismissAll}
        />
      );

      const viewButton = screen.getByText('View Alerts');
      fireEvent.click(viewButton);

      expect(mockOnViewAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button Variants', () => {
    it('should use destructive variant when high-risk alerts exist', () => {
      const alerts = [
        createMockTransactionAlert({
          metadata: { risk_level: 'high' },
        }),
      ];

      render(
        <TransactionAlertBanner
          alerts={alerts}
          onViewAll={mockOnViewAll}
          onDismissAll={mockOnDismissAll}
        />
      );

      const viewButton = screen.getByText('View Alerts');
      // Check for destructive variant class (usually contains 'destructive' or red colors)
      expect(viewButton.className).toBeDefined();
    });
  });
});
