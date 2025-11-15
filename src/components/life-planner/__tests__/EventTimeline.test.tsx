import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
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
    }
  ];

  const mockOnEventSelect = vi.fn();

  it('renders all events in timeline', () => {
    const { getByText } = renderWithProviders(<EventTimeline events={mockEvents} onEventSelect={mockOnEventSelect} />);

    expect(getByText('Dream Wedding')).toBeInTheDocument();
    expect(getByText('Home Purchase')).toBeInTheDocument();
  });

  it('displays formatted costs', () => {
    const { getByText } = renderWithProviders(<EventTimeline events={mockEvents} onEventSelect={mockOnEventSelect} />);

    expect(getByText('$25,000')).toBeInTheDocument();
    expect(getByText('$350,000')).toBeInTheDocument();
  });

  it('renders event types correctly', () => {
    const { getByText } = renderWithProviders(<EventTimeline events={mockEvents} onEventSelect={mockOnEventSelect} />);

    expect(getByText('home purchase')).toBeInTheDocument();
  });
});
