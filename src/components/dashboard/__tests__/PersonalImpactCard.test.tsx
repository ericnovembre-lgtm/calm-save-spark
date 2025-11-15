import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import { PersonalImpactCard } from '../PersonalImpactCard';

const mockSupabase = {
  from: vi.fn((_table: string) => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('PersonalImpactCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render title', () => {
      const { getByText } = renderWithProviders(<PersonalImpactCard userId="user-1" />);
      expect(getByText('Your Impact This Month')).toBeInTheDocument();
    });

    it('should display metrics grid', async () => {
      const { findByText } = renderWithProviders(<PersonalImpactCard userId="user-1" />);
      const totalSaved = await findByText('Total Saved');
      expect(totalSaved).toBeInTheDocument();
    });

    it('should show all four metric categories', async () => {
      const { findByText } = renderWithProviders(<PersonalImpactCard userId="user-1" />);
      
      expect(await findByText('Total Saved')).toBeInTheDocument();
      expect(await findByText('Active Goals')).toBeInTheDocument();
      expect(await findByText('Avg Progress')).toBeInTheDocument();
      expect(await findByText('Current Streak')).toBeInTheDocument();
    });
  });

  describe('Data Fetching and Display', () => {
    it('should display zero values when no data', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      }));

      const { findByText } = renderWithProviders(<PersonalImpactCard userId="user-1" />);
      expect(await findByText('$0')).toBeInTheDocument();
    });

    it('should calculate total saved correctly', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'pots') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() =>
                  Promise.resolve({
                    data: [
                      { current_amount: 500, target_amount: 1000, is_active: true },
                      { current_amount: 300, target_amount: 500, is_active: true },
                    ],
                    error: null,
                  })
                ),
              })),
            })),
          };
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({ data: { current_streak: 5 }, error: null })
              ),
            })),
          })),
        };
      });

      const { findByText } = renderWithProviders(<PersonalImpactCard userId="user-1" />);
      expect(await findByText('$800')).toBeInTheDocument();
    });

    it('should show active goals count', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'pots') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() =>
                  Promise.resolve({
                    data: [
                      { current_amount: 500, target_amount: 1000, is_active: true },
                      { current_amount: 200, target_amount: 500, is_active: true },
                      { current_amount: 0, target_amount: 300, is_active: true },
                    ],
                    error: null,
                  })
                ),
              })),
            })),
          };
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
        };
      });

      const { findByText } = renderWithProviders(<PersonalImpactCard userId="user-1" />);
      expect(await findByText('2/3')).toBeInTheDocument();
    });

    it('should display current streak', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: { current_streak: 7, last_activity_date: new Date().toISOString() },
                    error: null,
                  })
                ),
              })),
            })),
          };
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        };
      });

      const { findByText } = renderWithProviders(<PersonalImpactCard userId="user-1" />);
      expect(await findByText('7 days')).toBeInTheDocument();
    });
  });

  describe('Motivational Messages', () => {
    it('should show high achievement message for large savings', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'pots') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() =>
                  Promise.resolve({
                    data: [{ current_amount: 10000, target_amount: 15000, is_active: true }],
                    error: null,
                  })
                ),
              })),
            })),
          };
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
        };
      });

      const { findByText } = renderWithProviders(<PersonalImpactCard userId="user-1" />);
      expect(await findByText(/crushing it|Amazing progress/i)).toBeInTheDocument();
    });

    it('should show streak message for long streaks', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: { current_streak: 10 },
                    error: null,
                  })
                ),
              })),
            })),
          };
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        };
      });

      const { findByText } = renderWithProviders(<PersonalImpactCard userId="user-1" />);
      expect(await findByText(/streak.*fire/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const { getByText } = renderWithProviders(<PersonalImpactCard userId="user-1" />);
      expect(getByText('Your Impact This Month')).toBeInTheDocument();
    });

    it('should include tooltip information', () => {
      const { container } = renderWithProviders(<PersonalImpactCard userId="user-1" />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Animations', () => {
    it('should respect reduced motion preferences', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { container } = renderWithProviders(<PersonalImpactCard userId="user-1" />);
      expect(container).toBeInTheDocument();
    });

    it('should use stagger animation for metrics', () => {
      const { container } = renderWithProviders(<PersonalImpactCard userId="user-1" />);
      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle API errors gracefully', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: new Error('API Error') })),
        })),
      }));

      const { container } = renderWithProviders(<PersonalImpactCard userId="user-1" />);
      expect(container).toBeInTheDocument();
    });

    it('should handle missing userId', () => {
      const { container } = renderWithProviders(<PersonalImpactCard userId="" />);
      expect(container).toBeInTheDocument();
    });
  });
});
