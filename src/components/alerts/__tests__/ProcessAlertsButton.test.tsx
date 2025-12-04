import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProcessAlertsButton } from '../ProcessAlertsButton';
import { toast } from 'sonner';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Supabase client
const mockFunctionsInvoke = vi.fn();
const mockFrom = vi.fn();
const mockChannel = vi.fn();
const mockRemoveChannel = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: any[]) => mockFunctionsInvoke(...args),
    },
    from: (...args: any[]) => mockFrom(...args),
    channel: (...args: any[]) => mockChannel(...args),
    removeChannel: (...args: any[]) => mockRemoveChannel(...args),
  },
}));

describe('ProcessAlertsButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
    });

    mockChannel.mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    });

    mockFunctionsInvoke.mockResolvedValue({
      data: { processed: 0 },
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render the button with correct text', () => {
      render(<ProcessAlertsButton />);

      expect(screen.getByText('Process Now')).toBeInTheDocument();
    });

    it('should render with Zap icon', () => {
      render(<ProcessAlertsButton />);

      const button = screen.getByRole('button');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should have correct aria-label for accessibility', () => {
      render(<ProcessAlertsButton />);

      expect(
        screen.getByLabelText('Process transaction alerts now')
      ).toBeInTheDocument();
    });
  });

  describe('Pending Count Badge', () => {
    it('should show pending count badge when there are pending alerts', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
      });

      render(<ProcessAlertsButton showPendingCount={true} />);

      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument();
      });
    });

    it('should not show badge when pending count is 0', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
      });

      render(<ProcessAlertsButton showPendingCount={true} />);

      await waitFor(() => {
        expect(screen.queryByText('0')).not.toBeInTheDocument();
      });
    });

    it('should not show badge when showPendingCount is false', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
      });

      render(<ProcessAlertsButton showPendingCount={false} />);

      // Wait for component to settle
      await waitFor(() => {
        expect(screen.queryByText('5')).not.toBeInTheDocument();
      });
    });
  });

  describe('Processing', () => {
    it('should show loading state when processing', async () => {
      mockFunctionsInvoke.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: { processed: 0 }, error: null }), 100))
      );

      render(<ProcessAlertsButton />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Button should be disabled during processing
      expect(button).toBeDisabled();
    });

    it('should invoke edge function when clicked', async () => {
      render(<ProcessAlertsButton />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockFunctionsInvoke).toHaveBeenCalledWith('process-transaction-alerts');
      });
    });

    it('should show success toast when alerts are processed', async () => {
      mockFunctionsInvoke.mockResolvedValue({
        data: { processed: 3 },
        error: null,
      });

      render(<ProcessAlertsButton showStats={true} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Processed 3 alerts',
          expect.objectContaining({
            description: expect.stringContaining('Groq analysis completed'),
          })
        );
      });
    });

    it('should show info toast when no alerts to process', async () => {
      mockFunctionsInvoke.mockResolvedValue({
        data: { processed: 0 },
        error: null,
      });

      render(<ProcessAlertsButton showStats={true} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith(
          'No pending alerts',
          expect.any(Object)
        );
      });
    });

    it('should not show toast when showStats is false', async () => {
      mockFunctionsInvoke.mockResolvedValue({
        data: { processed: 3 },
        error: null,
      });

      render(<ProcessAlertsButton showStats={false} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockFunctionsInvoke).toHaveBeenCalled();
      });

      expect(toast.success).not.toHaveBeenCalled();
      expect(toast.info).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should show error toast on function invocation error', async () => {
      mockFunctionsInvoke.mockResolvedValue({
        data: null,
        error: { message: 'Edge function error' },
      });

      render(<ProcessAlertsButton />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Processing failed',
          expect.objectContaining({
            description: 'Edge function error',
          })
        );
      });
    });

    it('should show error toast on exception', async () => {
      mockFunctionsInvoke.mockRejectedValue(new Error('Network error'));

      render(<ProcessAlertsButton />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Processing failed',
          expect.objectContaining({
            description: 'Network error',
          })
        );
      });
    });

    it('should re-enable button after error', async () => {
      mockFunctionsInvoke.mockRejectedValue(new Error('Error'));

      render(<ProcessAlertsButton />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Variants and Sizes', () => {
    it('should apply default variant', () => {
      render(<ProcessAlertsButton variant="default" />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should apply outline variant', () => {
      render(<ProcessAlertsButton variant="outline" />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should apply ghost variant', () => {
      render(<ProcessAlertsButton variant="ghost" />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<ProcessAlertsButton className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
    });
  });
});
