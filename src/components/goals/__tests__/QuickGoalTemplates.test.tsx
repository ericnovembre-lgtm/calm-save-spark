import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@/test/utils';
import { QuickGoalTemplates } from '../QuickGoalTemplates';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            then: vi.fn(),
          })),
        })),
      })),
    })),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

const mockSupabase = supabase as any;

describe('QuickGoalTemplates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
  });

  it('renders section title', () => {
    renderWithProviders(<QuickGoalTemplates />);

    expect(screen.getByText('Quick Start Templates')).toBeInTheDocument();
  });

  it('displays description text', () => {
    renderWithProviders(<QuickGoalTemplates />);

    expect(screen.getByText(/Proven goal templates used by thousands/i)).toBeInTheDocument();
  });

  it('shows loading state', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    });

    renderWithProviders(<QuickGoalTemplates />);

    await waitFor(() => {
      expect(screen.getByText(/Loading templates/i)).toBeInTheDocument();
    });
  });

  it('renders grid layout', () => {
    const { container } = renderWithProviders(<QuickGoalTemplates />);

    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });
});
