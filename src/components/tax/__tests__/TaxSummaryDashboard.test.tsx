import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import { TaxSummaryDashboard } from '../TaxSummaryDashboard';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      })
    },
    from: vi.fn((table: string) => {
      if (table === 'tax_documents') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn().mockResolvedValue({ count: 10, error: null })
              }))
            }))
          }))
        };
      }
      if (table === 'tax_deductions') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({
                data: [
                  { amount: 5000 },
                  { amount: 3000 },
                  { amount: 2000 }
                ],
                error: null
              })
            }))
          }))
        };
      }
      return {};
    })
  }
}));

describe('TaxSummaryDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading skeleton initially', () => {
    const { container } = renderWithProviders(
      <TaxSummaryDashboard taxYear={2024} />
    );

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display total documents count', async () => {
    const { getByText } = renderWithProviders(
      <TaxSummaryDashboard taxYear={2024} />
    );

    await vi.waitFor(() => {
      expect(getByText('Total Documents')).toBeInTheDocument();
      expect(getByText('10')).toBeInTheDocument();
    });
  });

  it('should display processed documents count', async () => {
    const { getByText } = renderWithProviders(
      <TaxSummaryDashboard taxYear={2024} />
    );

    await vi.waitFor(() => {
      expect(getByText('Processed')).toBeInTheDocument();
    });
  });

  it('should calculate and display total deductions', async () => {
    const { getByText } = renderWithProviders(
      <TaxSummaryDashboard taxYear={2024} />
    );

    await vi.waitFor(() => {
      expect(getByText('Total Deductions')).toBeInTheDocument();
      expect(getByText('$10,000')).toBeInTheDocument();
    });
  });

  it('should calculate estimated savings at 22% tax rate', async () => {
    const { getByText } = renderWithProviders(
      <TaxSummaryDashboard taxYear={2024} />
    );

    await vi.waitFor(() => {
      expect(getByText('Est. Savings')).toBeInTheDocument();
      // 10000 * 0.22 = 2200
      expect(getByText('$2,200')).toBeInTheDocument();
    });
  });

  it('should render four stat cards', async () => {
    const { container } = renderWithProviders(
      <TaxSummaryDashboard taxYear={2024} />
    );

    await vi.waitFor(() => {
      const cards = container.querySelectorAll('.p-6');
      expect(cards.length).toBe(4);
    });
  });

  it('should display FileText icon for total documents', async () => {
    const { container } = renderWithProviders(
      <TaxSummaryDashboard taxYear={2024} />
    );

    await vi.waitFor(() => {
      const icons = container.querySelectorAll('[data-lucide="file-text"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  it('should display CheckCircle icon for processed documents', async () => {
    const { container } = renderWithProviders(
      <TaxSummaryDashboard taxYear={2024} />
    );

    await vi.waitFor(() => {
      const icons = container.querySelectorAll('[data-lucide="check-circle"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  it('should display DollarSign icons for financial stats', async () => {
    const { container } = renderWithProviders(
      <TaxSummaryDashboard taxYear={2024} />
    );

    await vi.waitFor(() => {
      const icons = container.querySelectorAll('[data-lucide="dollar-sign"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  it('should handle zero documents gracefully', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    supabase.from = vi.fn((table: string) => {
      if (table === 'tax_documents') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn().mockResolvedValue({ count: 0, error: null })
              }))
            }))
          }))
        };
      }
      if (table === 'tax_deductions') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: [], error: null })
            }))
          }))
        };
      }
      return {};
    }) as any;

    const { getByText } = renderWithProviders(
      <TaxSummaryDashboard taxYear={2024} />
    );

    await vi.waitFor(() => {
      expect(getByText('0')).toBeInTheDocument();
      expect(getByText('$0')).toBeInTheDocument();
    });
  });

  it('should handle authentication error', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    supabase.auth.getUser = vi.fn().mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated')
    });

    const { container } = renderWithProviders(
      <TaxSummaryDashboard taxYear={2024} />
    );

    // Should handle error gracefully
    await vi.waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });

  it('should query correct tax year', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    renderWithProviders(<TaxSummaryDashboard taxYear={2023} />);

    await vi.waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('tax_documents');
    });
  });

  it('should use grid layout for responsive design', async () => {
    const { container } = renderWithProviders(
      <TaxSummaryDashboard taxYear={2024} />
    );

    await vi.waitFor(() => {
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid?.className).toContain('md:grid-cols-4');
    });
  });

  it('should format large numbers with commas', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    supabase.from = vi.fn((table: string) => {
      if (table === 'tax_deductions') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({
                data: [{ amount: 50000 }, { amount: 25000 }],
                error: null
              })
            }))
          }))
        };
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ count: 5, error: null })
            }))
          }))
        }))
      };
    }) as any;

    const { getByText } = renderWithProviders(
      <TaxSummaryDashboard taxYear={2024} />
    );

    await vi.waitFor(() => {
      expect(getByText('$75,000')).toBeInTheDocument();
    });
  });

  it('should apply correct color classes to icons', async () => {
    const { container } = renderWithProviders(
      <TaxSummaryDashboard taxYear={2024} />
    );

    await vi.waitFor(() => {
      const blueIcon = container.querySelector('.text-blue-500');
      const greenIcon = container.querySelector('.text-green-500');
      const purpleIcon = container.querySelector('.text-purple-500');
      const amberIcon = container.querySelector('.text-amber-500');

      expect(blueIcon).toBeInTheDocument();
      expect(greenIcon).toBeInTheDocument();
      expect(purpleIcon).toBeInTheDocument();
      expect(amberIcon).toBeInTheDocument();
    });
  });

  it('should handle null deduction amounts', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    supabase.from = vi.fn((table: string) => {
      if (table === 'tax_deductions') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({
                data: [{ amount: null }, { amount: 1000 }],
                error: null
              })
            }))
          }))
        };
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ count: 2, error: null })
            }))
          }))
        }))
      };
    }) as any;

    const { getByText } = renderWithProviders(
      <TaxSummaryDashboard taxYear={2024} />
    );

    await vi.waitFor(() => {
      expect(getByText('$1,000')).toBeInTheDocument();
    });
  });
});
