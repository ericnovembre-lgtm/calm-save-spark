import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Debts from '../Debts';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock components that might cause issues in tests
vi.mock('@/components/debt/DebtPayoffChart', () => ({
  DebtPayoffChart: () => <div data-testid="debt-payoff-chart">Chart</div>,
}));

const mockDebts = [
  {
    id: '1',
    user_id: 'test-user',
    debt_name: 'Credit Card',
    debt_type: 'credit_card',
    current_balance: 5000,
    original_balance: 10000,
    interest_rate: 18.99,
    minimum_payment: 100,
    actual_payment: 150,
    payoff_strategy: 'avalanche',
    principal_amount: 10000,
    status: 'active',
    created_at: new Date().toISOString(),
    target_payoff_date: null,
  },
  {
    id: '2',
    user_id: 'test-user',
    debt_name: 'Student Loan',
    debt_type: 'student_loan',
    current_balance: 15000,
    original_balance: 20000,
    interest_rate: 5.5,
    minimum_payment: 200,
    actual_payment: 200,
    payoff_strategy: 'snowball',
    principal_amount: 20000,
    status: 'active',
    created_at: new Date().toISOString(),
    target_payoff_date: null,
  },
];

const mockPayments = [
  {
    id: '1',
    user_id: 'test-user',
    debt_id: '1',
    amount: 150,
    payment_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    payment_method: 'bank_transfer',
    notes: null,
  },
];

function renderWithProviders(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe('Debts Page - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock authenticated user
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'test-user' } },
      error: null,
    });

    // Mock Supabase queries
    const mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: mockDebts,
              error: null,
            })),
          })),
          order: vi.fn(() => ({
            data: mockDebts,
            error: null,
          })),
          data: mockPayments,
          error: null,
        })),
        order: vi.fn(() => ({
          data: mockDebts,
          error: null,
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: mockDebts[0],
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: mockDebts[0],
              error: null,
            })),
          })),
          error: null,
        })),
      })),
    }));

    (supabase.from as any).mockImplementation(mockFrom);
  });

  describe('Page Rendering', () => {
    it('should render the page with header and summary cards', async () => {
      renderWithProviders(<Debts />);

      await waitFor(() => {
        expect(screen.getByText('Debt Management')).toBeInTheDocument();
      });

      expect(screen.getByText('Total Debt')).toBeInTheDocument();
      expect(screen.getByText('Monthly Payment')).toBeInTheDocument();
      expect(screen.getByText('Avg Interest Rate')).toBeInTheDocument();
      expect(screen.getByText('Extra Payment')).toBeInTheDocument();
    });

    it('should display empty state when no debts exist', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                data: [],
                error: null,
              })),
            })),
          })),
        })),
      });

      renderWithProviders(<Debts />);

      await waitFor(() => {
        expect(screen.getByText('Debt-free!')).toBeInTheDocument();
      });

      expect(screen.getByText('You have no active debts. Great job!')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Debts />);

      await waitFor(() => {
        expect(screen.getByText('Credit Card')).toBeInTheDocument();
      });

      // Click Simulator tab
      await user.click(screen.getByRole('button', { name: /payoff simulator/i }));
      await waitFor(() => {
        expect(screen.getByText(/extra monthly payment/i)).toBeInTheDocument();
      });

      // Click Analytics tab
      await user.click(screen.getByRole('button', { name: /analytics/i }));
      await waitFor(() => {
        expect(screen.getByText(/debt by type/i)).toBeInTheDocument();
      });

      // Click Timeline tab
      await user.click(screen.getByRole('button', { name: /timeline/i }));
      await waitFor(() => {
        expect(screen.getByText(/your debt-free journey/i)).toBeInTheDocument();
      });
    });
  });

  describe('Debt CRUD Operations', () => {
    it('should open create modal when clicking Add Debt button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Debts />);

      await waitFor(() => {
        expect(screen.getByText('Credit Card')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add debt/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Add New Debt')).toBeInTheDocument();
      });
    });

    it('should display debt cards with correct information', async () => {
      renderWithProviders(<Debts />);

      await waitFor(() => {
        expect(screen.getByText('Credit Card')).toBeInTheDocument();
      });

      expect(screen.getByText('Student Loan')).toBeInTheDocument();
      expect(screen.getByText(/\$5,000/)).toBeInTheDocument();
      expect(screen.getByText(/\$15,000/)).toBeInTheDocument();
    });
  });

  describe('Summary Calculations', () => {
    it('should calculate and display correct totals', async () => {
      renderWithProviders(<Debts />);

      await waitFor(() => {
        expect(screen.getByText('Credit Card')).toBeInTheDocument();
      });

      // Total debt: 5000 + 15000 = 20000
      const totalDebtCard = screen.getByText('Total Debt').closest('[class*="p-6"]') as HTMLElement;
      expect(within(totalDebtCard).getByText(/\$20,000/)).toBeInTheDocument();

      // Monthly payment: 150 + 200 = 350
      const monthlyPaymentCard = screen.getByText('Monthly Payment').closest('[class*="p-6"]') as HTMLElement;
      expect(within(monthlyPaymentCard).getByText(/\$350/)).toBeInTheDocument();

      // Extra payment: (150 - 100) + (200 - 200) = 50
      const extraPaymentCard = screen.getByText('Extra Payment').closest('[class*="p-6"]') as HTMLElement;
      expect(within(extraPaymentCard).getByText(/\$50/)).toBeInTheDocument();
    });
  });

  describe('Help Panel', () => {
    it('should toggle help panel when clicking info icon', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Debts />);

      await waitFor(() => {
        expect(screen.getByText('Debt Management')).toBeInTheDocument();
      });

      // Help panel should not be visible initially
      expect(screen.queryByText('About Debt Management')).not.toBeInTheDocument();

      // Click info button to show help
      const infoButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('[class*="lucide-info"]')
      );
      await user.click(infoButton!);

      await waitFor(() => {
        expect(screen.getByText('About Debt Management')).toBeInTheDocument();
      });

      // Click again to hide
      await user.click(infoButton!);

      await waitFor(() => {
        expect(screen.queryByText('About Debt Management')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on icon buttons', async () => {
      renderWithProviders(<Debts />);

      await waitFor(() => {
        expect(screen.getByText('Credit Card')).toBeInTheDocument();
      });

      // Check for edit and delete buttons with aria-labels
      const editButtons = screen.getAllByLabelText(/edit debt/i);
      const deleteButtons = screen.getAllByLabelText(/delete debt/i);

      expect(editButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Debts />);

      await waitFor(() => {
        expect(screen.getByText('Debt Management')).toBeInTheDocument();
      });

      // Tab through interactive elements
      await user.tab();
      expect(document.activeElement?.tagName).toBe('BUTTON');
    });
  });
});
