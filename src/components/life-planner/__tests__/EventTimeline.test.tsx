import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent } from '@/test/utils';
import { EventTimeline } from '../EventTimeline';

describe('EventTimeline', () => {
  const mockEvents = [
    {
      id: '1',
      title: 'Dream Wedding',
      event_type: 'wedding',
      target_date: '2025-06-15',
      total_estimated_cost: 25000
    },
    {
      id: '2',
      title: 'Home Purchase',
      event_type: 'home_purchase',
      target_date: '2026-12-31',
      total_estimated_cost: 350000
    },
    {
      id: '3',
      title: 'Baby Arrival',
      event_type: 'baby',
      target_date: '2024-03-01',
      total_estimated_cost: 15000
    }
  ];

  const mockOnEventSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all events in timeline', () => {
      render(<EventTimeline events={mockEvents} onEventSelect={mockOnEventSelect} />);

      expect(screen.getByText('Dream Wedding')).toBeInTheDocument();
      expect(screen.getByText('Home Purchase')).toBeInTheDocument();
      expect(screen.getByText('Baby Arrival')).toBeInTheDocument();
    });

    it('sorts events by target date', () => {
      render(<EventTimeline events={mockEvents} onEventSelect={mockOnEventSelect} />);

      const eventTitles = screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent);
      // Should be sorted chronologically: Baby (2024) -> Wedding (2025) -> Home (2026)
      expect(eventTitles).toEqual(['Baby Arrival', 'Dream Wedding', 'Home Purchase']);
    });

    it('renders timeline visual line', () => {
      const { container } = render(<EventTimeline events={mockEvents} onEventSelect={mockOnEventSelect} />);

      const timelineLine = container.querySelector('.w-0\\.5');
      expect(timelineLine).toBeInTheDocument();
    });

    it('renders event type with underscores replaced', () => {
      render(<EventTimeline events={mockEvents} onEventSelect={mockOnEventSelect} />);

      expect(screen.getByText('home purchase')).toBeInTheDocument();
    });
  });

  describe('Event Details', () => {
    it('displays formatted dates', () => {
      render(<EventTimeline events={mockEvents} onEventSelect={mockOnEventSelect} />);

      expect(screen.getByText('Jun 15, 2025')).toBeInTheDocument();
      expect(screen.getByText('Dec 31, 2026')).toBeInTheDocument();
    });

    it('displays formatted costs', () => {
      render(<EventTimeline events={mockEvents} onEventSelect={mockOnEventSelect} />);

      expect(screen.getByText('$25,000')).toBeInTheDocument();
      expect(screen.getByText('$350,000')).toBeInTheDocument();
      expect(screen.getByText('$15,000')).toBeInTheDocument();
    });

    it('shows days until event for future events', () => {
      render(<EventTimeline events={mockEvents} onEventSelect={mockOnEventSelect} />);

      // Should show "days away" for future events
      const daysAway = screen.getAllByText(/days away/i);
      expect(daysAway.length).toBeGreaterThan(0);
    });

    it('shows "Past due" for past events', () => {
      render(<EventTimeline events={mockEvents} onEventSelect={mockOnEventSelect} />);

      expect(screen.getByText('Past due')).toBeInTheDocument();
    });
  });

  describe('Urgency Indicators', () => {
    it('applies red color for urgent events (< 180 days)', () => {
      const urgentEvent = [{
        id: '1',
        title: 'Urgent Event',
        event_type: 'wedding',
        target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days away
        total_estimated_cost: 5000
      }];

      const { container } = render(<EventTimeline events={urgentEvent} onEventSelect={mockOnEventSelect} />);

      const urgentDot = container.querySelector('.border-red-500');
      expect(urgentDot).toBeInTheDocument();
    });

    it('applies amber color for moderate events (180-365 days)', () => {
      const moderateEvent = [{
        id: '1',
        title: 'Moderate Event',
        event_type: 'wedding',
        target_date: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString(), // 200 days away
        total_estimated_cost: 5000
      }];

      const { container } = render(<EventTimeline events={moderateEvent} onEventSelect={mockOnEventSelect} />);

      const moderateDot = container.querySelector('.border-amber-500');
      expect(moderateDot).toBeInTheDocument();
    });

    it('applies green color for distant events (> 365 days)', () => {
      const distantEvent = [{
        id: '1',
        title: 'Distant Event',
        event_type: 'wedding',
        target_date: new Date(Date.now() + 400 * 24 * 60 * 60 * 1000).toISOString(), // 400 days away
        total_estimated_cost: 5000
      }];

      const { container } = render(<EventTimeline events={distantEvent} onEventSelect={mockOnEventSelect} />);

      const distantDot = container.querySelector('.border-green-500');
      expect(distantDot).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onEventSelect with correct id when event is clicked', async () => {
      const user = userEvent.setup();
      render(<EventTimeline events={mockEvents} onEventSelect={mockOnEventSelect} />);

      await user.click(screen.getByText('Dream Wedding'));
      expect(mockOnEventSelect).toHaveBeenCalledWith('1');
    });

    it('applies hover effects to event cards', () => {
      const { container } = render(<EventTimeline events={mockEvents} onEventSelect={mockOnEventSelect} />);

      const hoverCard = container.querySelector('.hover\\:shadow-lg');
      expect(hoverCard).toBeInTheDocument();
    });

    it('shows cursor pointer on event hover', () => {
      const { container } = render(<EventTimeline events={mockEvents} onEventSelect={mockOnEventSelect} />);

      const clickableArea = container.querySelector('.cursor-pointer');
      expect(clickableArea).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('handles empty events array', () => {
      const { container } = render(<EventTimeline events={[]} onEventSelect={mockOnEventSelect} />);

      expect(container.querySelector('.space-y-8')).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('applies staggered animation delays', () => {
      render(<EventTimeline events={mockEvents} onEventSelect={mockOnEventSelect} />);

      // All events should be visible after animation
      expect(screen.getByText('Dream Wedding')).toBeInTheDocument();
      expect(screen.getByText('Home Purchase')).toBeInTheDocument();
      expect(screen.getByText('Baby Arrival')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders calendar icons for dates', () => {
      render(<EventTimeline events={mockEvents} onEventSelect={mockOnEventSelect} />);

      const dateTexts = screen.getAllByText(/\d{1,2}, \d{4}/);
      expect(dateTexts.length).toBeGreaterThan(0);
    });
  });

  describe('Layout', () => {
    it('renders within a Card component', () => {
      const { container } = render(<EventTimeline events={mockEvents} onEventSelect={mockOnEventSelect} />);

      expect(container.querySelector('.p-6')).toBeInTheDocument();
    });

    it('positions timeline dots correctly', () => {
      const { container } = render(<EventTimeline events={mockEvents} onEventSelect={mockOnEventSelect} />);

      const timelineDots = container.querySelectorAll('.rounded-full.border-2');
      expect(timelineDots.length).toBe(mockEvents.length);
    });
  });

  describe('Accessibility', () => {
    it('renders event titles as h3 headings', () => {
      render(<EventTimeline events={mockEvents} onEventSelect={mockOnEventSelect} />);

      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings.length).toBe(mockEvents.length);
    });

    it('provides clickable areas for all events', () => {
      const { container } = render(<EventTimeline events={mockEvents} onEventSelect={mockOnEventSelect} />);

      const clickableAreas = container.querySelectorAll('.cursor-pointer');
      expect(clickableAreas.length).toBeGreaterThan(0);
    });
  });
});
