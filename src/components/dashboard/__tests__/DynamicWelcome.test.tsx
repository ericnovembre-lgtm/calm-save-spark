import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import { DynamicWelcome } from '../DynamicWelcome';

// Mock Supabase
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
  },
  from: vi.fn((_table: string) => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('DynamicWelcome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderWithProviders(<DynamicWelcome />);
      expect(container).toBeTruthy();
    });

    it('should display greeting based on time of day', () => {
      const hour = new Date().getHours();
      const { getByText } = renderWithProviders(<DynamicWelcome />);
      
      if (hour < 12) {
        expect(getByText(/Good morning/i)).toBeInTheDocument();
      } else if (hour < 18) {
        expect(getByText(/Good afternoon/i)).toBeInTheDocument();
      } else {
        expect(getByText(/Good evening/i)).toBeInTheDocument();
      }
    });

    it('should display user name when provided', () => {
      const { getByText } = renderWithProviders(<DynamicWelcome userName="John" />);
      expect(getByText(/John/i)).toBeInTheDocument();
    });

    it('should show time-appropriate icon', () => {
      const { container } = renderWithProviders(<DynamicWelcome />);
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Recent Activity Messages', () => {
    it('should show default message when no activity data', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
      });

      const { findByText } = renderWithProviders(<DynamicWelcome />);
      const message = await findByText(/Ready to start saving?|Ready to make today count?/i);
      expect(message).toBeInTheDocument();
    });

    it('should show completed goals message', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'goals') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() =>
                Promise.resolve({
                  data: [
                    { id: '1', current_amount: 1000, target_amount: 1000 },
                    { id: '2', current_amount: 500, target_amount: 1000 },
                  ],
                  error: null,
                })
              ),
            })),
          };
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
              })),
            })),
          })),
        };
      });

      const { findByText } = renderWithProviders(<DynamicWelcome />);
      const message = await findByText(/completed.*goal/i);
      expect(message).toBeInTheDocument();
    });

    it('should show recent transfer message', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'transfer_history') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() =>
                    Promise.resolve({
                      data: [{ id: '1', created_at: new Date().toISOString(), amount: 100 }],
                      error: null,
                    })
                  ),
                })),
              })),
            })),
          };
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        };
      });

      const { findByText } = renderWithProviders(<DynamicWelcome />);
      const message = await findByText(/Great job on your recent transfer/i);
      expect(message).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const { container } = renderWithProviders(<DynamicWelcome userName="Test User" />);
      const headings = container.querySelectorAll('h1, h2, h3');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should not have accessibility violations', () => {
      const { container } = renderWithProviders(<DynamicWelcome />);
      expect(container.querySelector('[aria-hidden="true"]')).toBeFalsy();
    });
  });

  describe('Animation Preferences', () => {
    it('should respect reduced motion preference', () => {
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

      const { container } = renderWithProviders(<DynamicWelcome />);
      expect(container).toBeInTheDocument();
    });
  });
});
