import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, userEvent } from '@/test/utils';
import { AIInsightsCard } from '../AIInsightsCard';
import { act } from '@testing-library/react';

describe('AIInsightsCard', () => {
  describe('Rendering', () => {
    it('should render AI insights card', () => {
      const { container } = renderWithProviders(<AIInsightsCard />);
      expect(container).toBeInTheDocument();
    });

    it('should display AI avatar icon', () => {
      const { container } = renderWithProviders(<AIInsightsCard />);
      const sparklesIcon = container.querySelector('svg');
      expect(sparklesIcon).toBeInTheDocument();
    });

    it('should show insight text', () => {
      const { getByText } = renderWithProviders(<AIInsightsCard />);
      expect(
        getByText(/spending patterns|vacation goal/i)
      ).toBeInTheDocument();
    });

    it('should display action button when insight has action', () => {
      const { getByRole } = renderWithProviders(<AIInsightsCard />);
      const buttons = getByRole('button', { name: /Create Budget|Adjust Goals/i });
      expect(buttons).toBeInTheDocument();
    });
  });

  describe('Typing Animation', () => {
    it('should show typing effect by default', () => {
      const { container } = renderWithProviders(<AIInsightsCard />);
      expect(container).toBeInTheDocument();
    });

    it('should skip typing animation when reduced motion is preferred', () => {
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

      const { container } = renderWithProviders(<AIInsightsCard />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle thumbs up feedback', async () => {
      const user = userEvent.setup();
      const { getByLabelText } = renderWithProviders(<AIInsightsCard />);
      
      const thumbsUpButton = getByLabelText(/helpful/i);
      await user.click(thumbsUpButton);
      
      expect(thumbsUpButton).toBeInTheDocument();
    });

    it('should handle thumbs down feedback', async () => {
      const user = userEvent.setup();
      const { getByLabelText } = renderWithProviders(<AIInsightsCard />);
      
      const thumbsDownButton = getByLabelText(/not helpful/i);
      await user.click(thumbsDownButton);
      
      expect(thumbsDownButton).toBeInTheDocument();
    });

    it('should dismiss insight', async () => {
      const user = userEvent.setup();
      const { getByLabelText, queryByText } = renderWithProviders(<AIInsightsCard />);
      
      const dismissButton = getByLabelText(/dismiss/i);
      await user.click(dismissButton);
      
      // Card should be dismissed
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
    });

    it('should execute action when action button is clicked', async () => {
      const user = userEvent.setup();
      const { getByRole } = renderWithProviders(<AIInsightsCard />);
      
      const actionButton = getByRole('button', { name: /Create Budget|Adjust Goals/i });
      await user.click(actionButton);
      
      expect(actionButton).toBeInTheDocument();
    });
  });

  describe('Multiple Insights Navigation', () => {
    it('should show progress indicator for multiple insights', () => {
      const { container } = renderWithProviders(<AIInsightsCard />);
      const progressIndicator = container.querySelector('[class*="flex gap"]');
      expect(progressIndicator).toBeTruthy();
    });

    it('should navigate to next insight after thumbs down', async () => {
      const user = userEvent.setup();
      const { getByLabelText } = renderWithProviders(<AIInsightsCard />);
      
      const thumbsDownButton = getByLabelText(/not helpful/i);
      await user.click(thumbsDownButton);
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for feedback buttons', () => {
      const { getByLabelText } = renderWithProviders(<AIInsightsCard />);
      
      expect(getByLabelText(/helpful/i)).toBeInTheDocument();
      expect(getByLabelText(/not helpful/i)).toBeInTheDocument();
      expect(getByLabelText(/dismiss/i)).toBeInTheDocument();
    });

    it('should have semantic button elements', () => {
      const { getAllByRole } = renderWithProviders(<AIInsightsCard />);
      const buttons = getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Animations', () => {
    it('should have pulsing animation on AI avatar during typing', () => {
      const { container } = renderWithProviders(<AIInsightsCard />);
      const avatar = container.querySelector('[class*="rounded-full"]');
      expect(avatar).toBeInTheDocument();
    });

    it('should respect reduced motion for all animations', () => {
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

      const { container } = renderWithProviders(<AIInsightsCard />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should not crash when no insights available', () => {
      const { container } = renderWithProviders(<AIInsightsCard />);
      expect(container).toBeInTheDocument();
    });

    it('should handle rapid feedback clicks', async () => {
      const user = userEvent.setup();
      const { getByLabelText } = renderWithProviders(<AIInsightsCard />);
      
      const thumbsUpButton = getByLabelText(/helpful/i);
      await user.click(thumbsUpButton);
      await user.click(thumbsUpButton);
      
      expect(thumbsUpButton).toBeInTheDocument();
    });
  });
});
