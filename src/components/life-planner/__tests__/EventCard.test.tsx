import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
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

  it('renders event card with all details', () => {
    const { getByText } = renderWithProviders(<EventCard event={mockEvent} onSelect={mockOnSelect} />);

    expect(getByText('Dream Wedding')).toBeInTheDocument();
    expect(getByText('wedding')).toBeInTheDocument();
    expect(getByText('Jun 15, 2025')).toBeInTheDocument();
    expect(getByText('$25,000')).toBeInTheDocument();
  });

  it('formats large numbers with commas', () => {
    const expensiveEvent = { ...mockEvent, total_estimated_cost: 1000000 };
    const { getByText } = renderWithProviders(<EventCard event={expensiveEvent} onSelect={mockOnSelect} />);

    expect(getByText('$1,000,000')).toBeInTheDocument();
  });

  it('handles different event types', () => {
    const eventWithUnderscore = { ...mockEvent, event_type: 'home_purchase' };
    const { getByText } = renderWithProviders(<EventCard event={eventWithUnderscore} onSelect={mockOnSelect} />);

    expect(getByText('home purchase')).toBeInTheDocument();
  });
});
