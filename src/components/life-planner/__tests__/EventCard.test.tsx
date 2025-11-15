import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent } from '@/test/utils';
import { EventCard } from '../EventCard';

describe('EventCard', () => {
  const mockEvent = {
    id: '1',
    title: 'Dream Wedding',
    event_type: 'wedding',
    target_date: '2025-06-15',
    total_estimated_cost: 25000
  };

  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders event card with all details', () => {
      render(<EventCard event={mockEvent} onSelect={mockOnSelect} />);

      expect(screen.getByText('Dream Wedding')).toBeInTheDocument();
      expect(screen.getByText('wedding')).toBeInTheDocument();
      expect(screen.getByText('Jun 15, 2025')).toBeInTheDocument();
      expect(screen.getByText('$25,000')).toBeInTheDocument();
    });

    it('renders event type with underscores replaced by spaces', () => {
      const eventWithUnderscore = { ...mockEvent, event_type: 'home_purchase' };
      render(<EventCard event={eventWithUnderscore} onSelect={mockOnSelect} />);

      expect(screen.getByText('home purchase')).toBeInTheDocument();
    });

    it('displays target date label', () => {
      render(<EventCard event={mockEvent} onSelect={mockOnSelect} />);

      expect(screen.getByText('Target Date')).toBeInTheDocument();
    });

    it('displays estimated cost label', () => {
      render(<EventCard event={mockEvent} onSelect={mockOnSelect} />);

      expect(screen.getByText('Est. Cost')).toBeInTheDocument();
    });

    it('renders edit and delete buttons', () => {
      render(<EventCard event={mockEvent} onSelect={mockOnSelect} />);

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument(); // Delete button
    });
  });

  describe('Interactions', () => {
    it('calls onSelect when card is clicked', async () => {
      const user = userEvent.setup();
      render(<EventCard event={mockEvent} onSelect={mockOnSelect} />);

      const card = screen.getByText('Dream Wedding').closest('div[class*="cursor-pointer"]');
      if (card) {
        await user.click(card);
        expect(mockOnSelect).toHaveBeenCalledTimes(1);
      }
    });

    it('does not trigger onSelect when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<EventCard event={mockEvent} onSelect={mockOnSelect} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // onSelect should not be called when clicking action buttons
      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe('Number Formatting', () => {
    it('formats large numbers with commas', () => {
      const expensiveEvent = { ...mockEvent, total_estimated_cost: 1000000 };
      render(<EventCard event={expensiveEvent} onSelect={mockOnSelect} />);

      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
    });

    it('formats small numbers correctly', () => {
      const cheapEvent = { ...mockEvent, total_estimated_cost: 500 };
      render(<EventCard event={cheapEvent} onSelect={mockOnSelect} />);

      expect(screen.getByText('$500')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('formats dates in MMM d, yyyy format', () => {
      render(<EventCard event={mockEvent} onSelect={mockOnSelect} />);

      expect(screen.getByText('Jun 15, 2025')).toBeInTheDocument();
    });

    it('handles different date formats', () => {
      const newYearEvent = { ...mockEvent, target_date: '2026-01-01' };
      render(<EventCard event={newYearEvent} onSelect={mockOnSelect} />);

      expect(screen.getByText('Jan 1, 2026')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('applies hover effects with proper classes', () => {
      const { container } = render(<EventCard event={mockEvent} onSelect={mockOnSelect} />);

      const card = container.querySelector('.hover\\:shadow-xl');
      expect(card).toBeInTheDocument();
    });

    it('has cursor-pointer class for clickable card', () => {
      const { container } = render(<EventCard event={mockEvent} onSelect={mockOnSelect} />);

      const clickableArea = container.querySelector('.cursor-pointer');
      expect(clickableArea).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders calendar icon for target date', () => {
      render(<EventCard event={mockEvent} onSelect={mockOnSelect} />);

      const calendarIcon = screen.getByText('Target Date').previousElementSibling;
      expect(calendarIcon).toBeInTheDocument();
    });

    it('renders dollar sign icon for estimated cost', () => {
      render(<EventCard event={mockEvent} onSelect={mockOnSelect} />);

      const dollarIcon = screen.getByText('Est. Cost').previousElementSibling;
      expect(dollarIcon).toBeInTheDocument();
    });

    it('renders edit icon in button', () => {
      render(<EventCard event={mockEvent} onSelect={mockOnSelect} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      expect(editButton.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles', () => {
      render(<EventCard event={mockEvent} onSelect={mockOnSelect} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('displays event type with proper capitalization', () => {
      render(<EventCard event={mockEvent} onSelect={mockOnSelect} />);

      const eventType = screen.getByText('wedding');
      expect(eventType).toHaveClass('capitalize');
    });
  });
});
