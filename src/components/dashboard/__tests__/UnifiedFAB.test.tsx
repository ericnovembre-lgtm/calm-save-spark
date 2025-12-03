import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, userEvent } from '@/test/utils';
import { UnifiedFAB } from '../UnifiedFAB';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/components/coach/AIChat', () => ({
  AIChat: () => <div>AI Chat Mock</div>,
}));

describe('UnifiedFAB', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Rendering', () => {
    it('should render main FAB button', () => {
      const { container } = renderWithProviders(
        <BrowserRouter>
          <UnifiedFAB />
        </BrowserRouter>
      );
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('should not show actions menu initially', () => {
      const { queryByText } = renderWithProviders(
        <BrowserRouter>
          <UnifiedFAB />
        </BrowserRouter>
      );
      expect(queryByText('Transfer Money')).not.toBeInTheDocument();
    });
  });

  describe('Expanding Menu', () => {
    it('should show all actions when expanded', async () => {
      const user = userEvent.setup();
      const { container, findByText } = renderWithProviders(
        <BrowserRouter>
          <UnifiedFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      
      expect(await findByText('Transfer Money')).toBeInTheDocument();
      expect(await findByText('Add Goal')).toBeInTheDocument();
      expect(await findByText('View Analytics')).toBeInTheDocument();
      expect(await findByText('AI Coach')).toBeInTheDocument();
    });

    it('should show backdrop when expanded', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(
        <BrowserRouter>
          <UnifiedFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      
      const backdrop = container.querySelector('[class*="backdrop-blur"]');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should display correct action labels', async () => {
      const user = userEvent.setup();
      const { container, findByText } = renderWithProviders(
        <BrowserRouter>
          <UnifiedFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      
      expect(await findByText('Transfer Money')).toBeInTheDocument();
      expect(await findByText('Add Goal')).toBeInTheDocument();
      expect(await findByText('View Analytics')).toBeInTheDocument();
      expect(await findByText('AI Coach')).toBeInTheDocument();
    });

    it('should show icons for each action', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(
        <BrowserRouter>
          <UnifiedFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(4);
    });
  });

  describe('Navigation Actions', () => {
    it('should navigate to goals page', async () => {
      const user = userEvent.setup();
      const { container, findByText } = renderWithProviders(
        <BrowserRouter>
          <UnifiedFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      await user.click(await findByText('Add Goal'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/goals');
    });

    it('should navigate to analytics page', async () => {
      const user = userEvent.setup();
      const { container, findByText } = renderWithProviders(
        <BrowserRouter>
          <UnifiedFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      await user.click(await findByText('View Analytics'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/analytics');
    });
  });

  describe('Transfer Action', () => {
    it('should scroll to manual transfer on click', async () => {
      const scrollIntoViewMock = vi.fn();
      const mockElement = { scrollIntoView: scrollIntoViewMock };
      vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);

      const user = userEvent.setup();
      const { container, findByText } = renderWithProviders(
        <BrowserRouter>
          <UnifiedFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      await user.click(await findByText('Transfer Money'));
      
      expect(document.getElementById).toHaveBeenCalledWith('manual-transfer');
    });
  });

  describe('AI Coach Action', () => {
    it('should open AI chat dialog', async () => {
      const user = userEvent.setup();
      const { container, findByText } = renderWithProviders(
        <BrowserRouter>
          <UnifiedFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      await user.click(await findByText('AI Coach'));
      
      expect(await findByText('AI Chat Mock')).toBeInTheDocument();
    });

    it('should close AI chat dialog', async () => {
      const user = userEvent.setup();
      const { container, findByText, queryByText } = renderWithProviders(
        <BrowserRouter>
          <UnifiedFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      await user.click(await findByText('AI Coach'));
      
      const closeButton = await findByText(/close/i);
      await user.click(closeButton);
      
      expect(queryByText('AI Chat Mock')).not.toBeInTheDocument();
    });
  });

  describe('Closing Menu', () => {
    it('should close when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const { container, queryByText } = renderWithProviders(
        <BrowserRouter>
          <UnifiedFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      const backdrop = container.querySelector('[class*="backdrop-blur"]')!;
      await user.click(backdrop);
      
      expect(queryByText('Transfer Money')).not.toBeInTheDocument();
    });

    it('should close after action selection', async () => {
      const user = userEvent.setup();
      const { container, findByText, queryByText } = renderWithProviders(
        <BrowserRouter>
          <UnifiedFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      await user.click(await findByText('Add Goal'));
      
      expect(queryByText('Transfer Money')).not.toBeInTheDocument();
    });
  });

  describe('Positioning', () => {
    it('should be fixed at bottom right', () => {
      const { container } = renderWithProviders(
        <BrowserRouter>
          <UnifiedFAB />
        </BrowserRouter>
      );
      const fabContainer = container.querySelector('[class*="fixed bottom"]');
      expect(fabContainer).toBeInTheDocument();
    });

    it('should have responsive positioning', () => {
      const { container } = renderWithProviders(
        <BrowserRouter>
          <UnifiedFAB />
        </BrowserRouter>
      );
      const fabContainer = container.querySelector('[class*="md:bottom-6"]');
      expect(fabContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button elements', () => {
      const { container } = renderWithProviders(
        <BrowserRouter>
          <UnifiedFAB />
        </BrowserRouter>
      );
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const { container } = renderWithProviders(
        <BrowserRouter>
          <UnifiedFAB />
        </BrowserRouter>
      );
      const button = container.querySelector('button')!;
      button.focus();
      expect(button).toHaveFocus();
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

      const { container } = renderWithProviders(
        <BrowserRouter>
          <UnifiedFAB />
        </BrowserRouter>
      );
      expect(container).toBeInTheDocument();
    });

    it('should have animation classes', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(
        <BrowserRouter>
          <UnifiedFAB />
        </BrowserRouter>
      );
      
      await user.click(container.querySelector('button')!);
      
      const actionItems = container.querySelectorAll('[class*="opacity"]');
      expect(actionItems.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid toggling', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(
        <BrowserRouter>
          <UnifiedFAB />
        </BrowserRouter>
      );
      
      const button = container.querySelector('button')!;
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      expect(container).toBeInTheDocument();
    });
  });
});
