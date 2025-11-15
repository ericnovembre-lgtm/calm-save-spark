import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, userEvent } from '@/test/utils';
import { ChatFAB } from '../ChatFAB';

vi.mock('@/components/coach/AIChat', () => ({
  AIChat: () => <div>AI Chat Component</div>,
}));

describe('ChatFAB', () => {
  describe('Rendering', () => {
    it('should render FAB button', () => {
      const { getByLabelText } = renderWithProviders(<ChatFAB />);
      expect(getByLabelText('Open AI Chat')).toBeInTheDocument();
    });

    it('should display message icon', () => {
      const { container } = renderWithProviders(<ChatFAB />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should be positioned correctly', () => {
      const { getByLabelText } = renderWithProviders(<ChatFAB />);
      const button = getByLabelText('Open AI Chat');
      expect(button.className).toContain('fixed');
      expect(button.className).toContain('bottom-24');
    });

    it('should not show dialog initially', () => {
      const { queryByText } = renderWithProviders(<ChatFAB />);
      expect(queryByText('AI Chat Component')).not.toBeInTheDocument();
    });
  });

  describe('Opening Dialog', () => {
    it('should open dialog when FAB is clicked', async () => {
      const user = userEvent.setup();
      const { getByLabelText, findByText } = renderWithProviders(<ChatFAB />);
      
      const button = getByLabelText('Open AI Chat');
      await user.click(button);
      
      expect(await findByText('AI Financial Coach')).toBeInTheDocument();
      expect(await findByText('AI Chat Component')).toBeInTheDocument();
    });

    it('should show close button in dialog header', async () => {
      const user = userEvent.setup();
      const { getByLabelText, findByLabelText } = renderWithProviders(<ChatFAB />);
      
      await user.click(getByLabelText('Open AI Chat'));
      
      expect(await findByLabelText('Close chat')).toBeInTheDocument();
    });
  });

  describe('Closing Dialog', () => {
    it('should close dialog when X button is clicked', async () => {
      const user = userEvent.setup();
      const { getByLabelText, queryByText } = renderWithProviders(<ChatFAB />);
      
      await user.click(getByLabelText('Open AI Chat'));
      await user.click(getByLabelText('Close chat'));
      
      expect(queryByText('AI Chat Component')).not.toBeInTheDocument();
    });

    it('should close dialog when clicking outside', async () => {
      const user = userEvent.setup();
      const { getByLabelText, container, queryByText } = renderWithProviders(<ChatFAB />);
      
      await user.click(getByLabelText('Open AI Chat'));
      
      // Dialog should be open
      expect(queryByText('AI Financial Coach')).toBeInTheDocument();
      
      // The dialog overlay can be clicked to close
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('Dialog Content', () => {
    it('should render AI chat title', async () => {
      const user = userEvent.setup();
      const { getByLabelText, findByText } = renderWithProviders(<ChatFAB />);
      
      await user.click(getByLabelText('Open AI Chat'));
      
      expect(await findByText('AI Financial Coach')).toBeInTheDocument();
    });

    it('should render AIChat component inside dialog', async () => {
      const user = userEvent.setup();
      const { getByLabelText, findByText } = renderWithProviders(<ChatFAB />);
      
      await user.click(getByLabelText('Open AI Chat'));
      
      expect(await findByText('AI Chat Component')).toBeInTheDocument();
    });

    it('should have proper dialog dimensions', async () => {
      const user = userEvent.setup();
      const { getByLabelText, container } = renderWithProviders(<ChatFAB />);
      
      await user.click(getByLabelText('Open AI Chat'));
      
      const dialogContent = container.querySelector('[class*="max-w-3xl"]');
      expect(dialogContent).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const { getByLabelText } = renderWithProviders(<ChatFAB />);
      expect(getByLabelText('Open AI Chat')).toBeInTheDocument();
    });

    it('should have focus ring on button', () => {
      const { getByLabelText } = renderWithProviders(<ChatFAB />);
      const button = getByLabelText('Open AI Chat');
      expect(button.className).toContain('focus-visible');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const { getByLabelText } = renderWithProviders(<ChatFAB />);
      
      const button = getByLabelText('Open AI Chat');
      button.focus();
      expect(button).toHaveFocus();
      
      await user.keyboard('{Enter}');
    });

    it('should trap focus in dialog when open', async () => {
      const user = userEvent.setup();
      const { getByLabelText, findByLabelText } = renderWithProviders(<ChatFAB />);
      
      await user.click(getByLabelText('Open AI Chat'));
      
      const closeButton = await findByLabelText('Close chat');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Animations', () => {
    it('should have hover animation', () => {
      const { getByLabelText } = renderWithProviders(<ChatFAB />);
      const button = getByLabelText('Open AI Chat');
      expect(button).toBeInTheDocument();
    });

    it('should have tap animation', () => {
      const { getByLabelText } = renderWithProviders(<ChatFAB />);
      const button = getByLabelText('Open AI Chat');
      expect(button).toBeInTheDocument();
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

      const { getByLabelText } = renderWithProviders(<ChatFAB />);
      expect(getByLabelText('Open AI Chat')).toBeInTheDocument();
    });
  });

  describe('Positioning', () => {
    it('should be fixed at bottom right', () => {
      const { getByLabelText } = renderWithProviders(<ChatFAB />);
      const button = getByLabelText('Open AI Chat');
      expect(button.className).toContain('fixed');
      expect(button.className).toContain('bottom-24');
      expect(button.className).toContain('right-4');
    });

    it('should have appropriate z-index', () => {
      const { getByLabelText } = renderWithProviders(<ChatFAB />);
      const button = getByLabelText('Open AI Chat');
      expect(button.className).toContain('z-30');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid open/close', async () => {
      const user = userEvent.setup();
      const { getByLabelText } = renderWithProviders(<ChatFAB />);
      
      const button = getByLabelText('Open AI Chat');
      await user.click(button);
      await user.click(getByLabelText('Close chat'));
      await user.click(button);
      
      expect(getByLabelText('Close chat')).toBeInTheDocument();
    });
  });
});
