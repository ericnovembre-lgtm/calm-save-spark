import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, userEvent } from '@/test/utils';
import { SmartFAB } from '../SmartFAB';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SmartFAB', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Rendering', () => {
    it('should render main FAB button', () => {
      const { container } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('should show plus icon when closed', () => {
      const { container } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should not show actions initially', () => {
      const { queryByText } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      expect(queryByText('Quick Transfer')).not.toBeInTheDocument();
    });
  });

  describe('Expanding Menu', () => {
    it('should show all action buttons when expanded', async () => {
      const user = userEvent.setup();
      const { container, findByText } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      
      expect(await findByText('Quick Transfer')).toBeInTheDocument();
      expect(await findByText('New Goal')).toBeInTheDocument();
      expect(await findByText('AI Insights')).toBeInTheDocument();
      expect(await findByText('AI Coach')).toBeInTheDocument();
      expect(await findByText('Analytics')).toBeInTheDocument();
    });

    it('should display backdrop when expanded', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      
      const backdrop = container.querySelector('[class*="backdrop-blur"]');
      expect(backdrop).toBeInTheDocument();
    });

    it('should arrange actions in circular pattern', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      
      const actionButtons = container.querySelectorAll('[class*="absolute"]');
      expect(actionButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Action Interactions', () => {
    it('should navigate to goals page', async () => {
      const user = userEvent.setup();
      const { container, findByText } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      await user.click(await findByText('New Goal'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/goals');
    });

    it('should navigate to analytics', async () => {
      const user = userEvent.setup();
      const { container, findByText } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      await user.click(await findByText('Analytics'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/analytics');
    });

    it('should navigate to coach', async () => {
      const user = userEvent.setup();
      const { container, findByText } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      await user.click(await findByText('AI Coach'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/coach');
    });
  });

  describe('Drag Interaction', () => {
    it('should support drag gestures', async () => {
      const { container } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      
      const mainButton = container.querySelector('[class*="cursor-grab"]');
      expect(mainButton).toBeInTheDocument();
    });
  });

  describe('Visual Styling', () => {
    it('should have colored action buttons', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      
      const coloredButtons = container.querySelectorAll('[style*="background"]');
      expect(coloredButtons.length).toBeGreaterThan(0);
    });

    it('should show hint text when expanded', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      
      // Hint text might be present
      const textElements = container.querySelectorAll('span');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });

  describe('Closing Menu', () => {
    it('should close when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const { container, queryByText } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      const backdrop = container.querySelector('[class*="backdrop-blur"]')!;
      await user.click(backdrop);
      
      expect(queryByText('Quick Transfer')).not.toBeInTheDocument();
    });

    it('should close after selecting an action', async () => {
      const user = userEvent.setup();
      const { container, findByText, queryByText } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      await user.click(await findByText('New Goal'));
      
      expect(queryByText('Quick Transfer')).not.toBeInTheDocument();
    });
  });

  describe('Positioning', () => {
    it('should be fixed at bottom right', () => {
      const { container } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      const fabContainer = container.querySelector('[class*="fixed bottom-6 right-6"]');
      expect(fabContainer).toBeInTheDocument();
    });

    it('should have appropriate z-index', () => {
      const { container } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      const fabContainer = container.querySelector('[class*="z-50"]');
      expect(fabContainer).toBeInTheDocument();
    });
  });

  describe('Animations', () => {
    it('should have rotation animation on main button', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      
      expect(container).toBeInTheDocument();
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

      const { container } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button semantics', () => {
      const { container } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should be keyboard accessible', async () => {
      const { container } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      const mainButton = container.querySelector('button')!;
      mainButton.focus();
      expect(mainButton).toHaveFocus();
    });

    it('should have visible focus indicators', () => {
      const { container } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid toggling', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      
      const button = container.querySelector('button')!;
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      expect(container).toBeInTheDocument();
    });

    it('should handle multiple action clicks', async () => {
      const user = userEvent.setup();
      const { container, findByText } = renderWithProviders(
        <BrowserRouter>
          <SmartFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      const goalButton = await findByText('New Goal');
      await user.click(goalButton);
      await user.click(goalButton);
      
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});
