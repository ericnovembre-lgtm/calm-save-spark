import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import { CreateEventModal } from '../CreateEventModal';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(),
    functions: {
      invoke: vi.fn()
    }
  }
}));

vi.mock('@/hooks/useLifePlans', () => ({
  useLifePlans: () => ({
    createPlan: vi.fn()
  })
}));

describe('CreateEventModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'test-user-id' } }
    });
  });

  it('renders modal when open', () => {
    const { getByText } = renderWithProviders(<CreateEventModal open={true} onClose={mockOnClose} />);

    expect(getByText('Create Life Plan')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { queryByText } = renderWithProviders(<CreateEventModal open={false} onClose={mockOnClose} />);

    expect(queryByText('Create Life Plan')).not.toBeInTheDocument();
  });

  it('renders action buttons', () => {
    const { getByText } = renderWithProviders(<CreateEventModal open={true} onClose={mockOnClose} />);

    expect(getByText('Cancel')).toBeInTheDocument();
    expect(getByText('Create Plan')).toBeInTheDocument();
  });
});
