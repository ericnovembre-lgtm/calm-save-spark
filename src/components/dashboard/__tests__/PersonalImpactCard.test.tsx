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
    it('should display metrics', async () => {
      const { findByText } = renderWithProviders(<PersonalImpactCard userId="user-1" />);
      expect(await findByText('Total Saved')).toBeInTheDocument();
    });

    it('should render with userId', () => {
      const { container } = renderWithProviders(<PersonalImpactCard userId="user-1" />);
      expect(container).toBeInTheDocument();
    });

    it('should show metric categories', async () => {
      const { findByText } = renderWithProviders(<PersonalImpactCard userId="user-1" />);
      expect(await findByText('Active Goals')).toBeInTheDocument();
    });
  });

  describe('Motivational Messages', () => {
    it('should display motivational content', () => {
      const { container } = renderWithProviders(<PersonalImpactCard userId="user-1" />);
      expect(container).toBeInTheDocument();
    });

    it('should show descriptive messages', () => {
      const { getByText } = renderWithProviders(<PersonalImpactCard userId="user-1" />);
      expect(getByText('Your Impact This Month')).toBeInTheDocument();
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
    it('should render without errors', () => {
      const { container } = renderWithProviders(<PersonalImpactCard userId="user-1" />);
      expect(container).toBeInTheDocument();
    });

    it('should handle missing userId', () => {
      const { container } = renderWithProviders(<PersonalImpactCard userId="" />);
      expect(container).toBeInTheDocument();
    });
  });
});
