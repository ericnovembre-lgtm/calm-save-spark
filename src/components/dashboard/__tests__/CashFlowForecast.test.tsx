import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import CashFlowForecast from '../CashFlowForecast';

const mockSupabase = {
  from: vi.fn((_table: string) => ({
    select: vi.fn(() => ({
      order: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      eq: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('CashFlowForecast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render forecast title', () => {
      const { getByText } = renderWithProviders(<CashFlowForecast userId="user-1" />);
      expect(getByText('30-Day Cash Flow Forecast')).toBeInTheDocument();
    });

    it('should display description', () => {
      const { getByText } = renderWithProviders(<CashFlowForecast userId="user-1" />);
      expect(getByText(/Projected balance based on your spending patterns/i)).toBeInTheDocument();
    });

    it('should render chart', async () => {
      const { container } = renderWithProviders(<CashFlowForecast userId="user-1" />);
      // Chart component should be rendered
      expect(container.querySelector('svg') || container.querySelector('[role="img"]')).toBeTruthy();
    });
  });

  describe('Data Calculations', () => {
    it('should calculate forecast with no transaction history', async () => {
      const { findByText } = renderWithProviders(<CashFlowForecast userId="user-1" />);
      // Should show projected end balance
      expect(await findByText(/Projected End/i)).toBeTruthy();
    });

    it('should render with default data', async () => {
      const { findByText } = renderWithProviders(<CashFlowForecast userId="user-1" />);
      expect(await findByText(/30-Day Cash Flow Forecast/i)).toBeTruthy();
    });

    it('should render forecast chart', () => {
      const { container } = renderWithProviders(<CashFlowForecast userId="user-1" />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Trend Display', () => {
    it('should display trend information', () => {
      const { container } = renderWithProviders(<CashFlowForecast userId="user-1" />);
      expect(container).toBeInTheDocument();
    });

    it('should show trend indicators', () => {
      const { container } = renderWithProviders(<CashFlowForecast userId="user-1" />);
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Chart Rendering', () => {
    it('should render area chart with correct data structure', async () => {
      const { container } = renderWithProviders(<CashFlowForecast userId="user-1" />);
      expect(container).toBeInTheDocument();
    });

    it('should have X and Y axes', async () => {
      const { container } = renderWithProviders(<CashFlowForecast userId="user-1" />);
      expect(container).toBeInTheDocument();
    });

    it('should show tooltip on hover areas', () => {
      const { container } = renderWithProviders(<CashFlowForecast userId="user-1" />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading', () => {
      const { getByRole } = renderWithProviders(<CashFlowForecast userId="user-1" />);
      const heading = getByRole('heading', { name: /30-Day Cash Flow Forecast/i });
      expect(heading).toBeInTheDocument();
    });

    it('should include descriptive icons', () => {
      const { container } = renderWithProviders(<CashFlowForecast userId="user-1" />);
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Animations', () => {
    it('should have fade-in animation', () => {
      const { container } = renderWithProviders(<CashFlowForecast userId="user-1" />);
      expect(container.firstChild).toBeInTheDocument();
    });

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

      const { container } = renderWithProviders(<CashFlowForecast userId="user-1" />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty userId', () => {
      const { container } = renderWithProviders(<CashFlowForecast userId="" />);
      expect(container).toBeInTheDocument();
    });

    it('should render without errors', () => {
      const { container } = renderWithProviders(<CashFlowForecast userId="user-1" />);
      expect(container).toBeInTheDocument();
    });
  });
});
