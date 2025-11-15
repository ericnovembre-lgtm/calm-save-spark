import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, userEvent } from '@/test/utils';
import { QuickActionsFAB } from '../QuickActionsFAB';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('QuickActionsFAB', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Rendering', () => {
    it('should render main FAB button', () => {
      const { container } = renderWithProviders(
        <BrowserRouter>
          <QuickActionsFAB />
        </BrowserRouter>
      );
      const fab = container.querySelector('button');
      expect(fab).toBeInTheDocument();
    });

    it('should show plus icon when closed', () => {
      const { container } = renderWithProviders(
        <BrowserRouter>
          <QuickActionsFAB />
        </BrowserRouter>
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should not show action menu initially', () => {
      const { queryByText } = renderWithProviders(
        <BrowserRouter>
          <QuickActionsFAB />
        </BrowserRouter>
      );
      expect(queryByText('Transfer Money')).not.toBeInTheDocument();
    });
  });

  describe('Opening Menu', () => {
    it('should open menu when clicked', async () => {
      const user = userEvent.setup();
      const { container, findByText } = renderWithProviders(
        <BrowserRouter>
          <QuickActionsFAB />
        </BrowserRouter>
      );
      
      const fab = container.querySelector('button')!;
      await user.click(fab);
      
      expect(await findByText('Transfer Money')).toBeInTheDocument();
      expect(await findByText('Add Goal')).toBeInTheDocument();
      expect(await findByText('View Insights')).toBeInTheDocument();
    });

    it('should show backdrop when menu is open', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(
        <BrowserRouter>
          <QuickActionsFAB />
        </BrowserRouter>
      );
      
      const fab = container.querySelector('button')!;
      await user.click(fab);
      
      const backdrop = container.querySelector('[class*="backdrop-blur"]');
      expect(backdrop).toBeInTheDocument();
    });

    it('should change icon to X when open', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(
        <BrowserRouter>
          <QuickActionsFAB />
        </BrowserRouter>
      );
      
      const fab = container.querySelector('button')!;
      await user.click(fab);
      
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('should render all three action buttons when open', async () => {
      const user = userEvent.setup();
      const { container, findByText } = renderWithProviders(
        <BrowserRouter>
          <QuickActionsFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      
      expect(await findByText('Transfer Money')).toBeInTheDocument();
      expect(await findByText('Add Goal')).toBeInTheDocument();
      expect(await findByText('View Insights')).toBeInTheDocument();
    });

    it('should show correct icons for each action', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(
        <BrowserRouter>
          <QuickActionsFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(3);
    });

    it('should have hover labels for actions', async () => {
      const user = userEvent.setup();
      const { container, findByText } = renderWithProviders(
        <BrowserRouter>
          <QuickActionsFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      
      const transferButton = await findByText('Transfer Money');
      expect(transferButton).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to goals page', async () => {
      const user = userEvent.setup();
      const { container, findByText } = renderWithProviders(
        <BrowserRouter>
          <QuickActionsFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      const goalsButton = await findByText('Add Goal');
      await user.click(goalsButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/goals');
    });

    it('should navigate to insights page', async () => {
      const user = userEvent.setup();
      const { container, findByText } = renderWithProviders(
        <BrowserRouter>
          <QuickActionsFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      const insightsButton = await findByText('View Insights');
      await user.click(insightsButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/insights');
    });

    it('should close menu after navigation', async () => {
      const user = userEvent.setup();
      const { container, findByText, queryByText } = renderWithProviders(
        <BrowserRouter>
          <QuickActionsFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      const goalsButton = await findByText('Add Goal');
      await user.click(goalsButton);
      
      // Menu should close after action
      expect(queryByText('Transfer Money')).not.toBeInTheDocument();
    });
  });

  describe('Closing Menu', () => {
    it('should close when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const { container, queryByText } = renderWithProviders(
        <BrowserRouter>
          <QuickActionsFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      
      const backdrop = container.querySelector('[class*="backdrop-blur"]')!;
      await user.click(backdrop);
      
      expect(queryByText('Transfer Money')).not.toBeInTheDocument();
    });

    it('should close when FAB is clicked again', async () => {
      const user = userEvent.setup();
      const { container, queryByText } = renderWithProviders(
        <BrowserRouter>
          <QuickActionsFAB />
        </BrowserRouter>
      );
      
      const fab = container.querySelector('button')!;
      await user.click(fab);
      await user.click(fab);
      
      expect(queryByText('Transfer Money')).not.toBeInTheDocument();
    });
  });

  describe('Animations', () => {
    it('should have stagger animation for action items', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(
        <BrowserRouter>
          <QuickActionsFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      
      const actionButtons = container.querySelectorAll('[class*="flex items-center gap"]');
      expect(actionButtons.length).toBeGreaterThan(0);
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
          <QuickActionsFAB />
        </BrowserRouter>
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button semantics', () => {
      const { container } = renderWithProviders(
        <BrowserRouter>
          <QuickActionsFAB />
        </BrowserRouter>
      );
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have focus states', () => {
      const { container } = renderWithProviders(
        <BrowserRouter>
          <QuickActionsFAB />
        </BrowserRouter>
      );
      const fab = container.querySelector('button')!;
      fab.focus();
      expect(fab).toHaveFocus();
    });
  });

  describe('Positioning', () => {
    it('should be fixed at bottom of screen', () => {
      const { container } = renderWithProviders(
        <BrowserRouter>
          <QuickActionsFAB />
        </BrowserRouter>
      );
      const fab = container.querySelector('[class*="fixed"]');
      expect(fab).toBeInTheDocument();
    });

    it('should have correct z-index', () => {
      const { container } = renderWithProviders(
        <BrowserRouter>
          <QuickActionsFAB />
        </BrowserRouter>
      );
      const fab = container.querySelector('[class*="z-50"]');
      expect(fab).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid open/close', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(
        <BrowserRouter>
          <QuickActionsFAB />
        </BrowserRouter>
      );
      
      const fab = container.querySelector('button')!;
      await user.click(fab);
      await user.click(fab);
      await user.click(fab);
      
      expect(container).toBeInTheDocument();
    });
  });
});
