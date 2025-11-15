import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@/test/utils';
import { AIGoalSuggestions } from '../AIGoalSuggestions';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

const mockSupabase = supabase as any;

describe('AIGoalSuggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
  });

  it('renders initial state with generate button', () => {
    renderWithProviders(<AIGoalSuggestions />);

    expect(screen.getByText('AI Goal Suggestions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Get AI Suggestions/i })).toBeInTheDocument();
  });

  it('displays description text', () => {
    renderWithProviders(<AIGoalSuggestions />);

    expect(screen.getByText(/Get personalized savings goal recommendations/i)).toBeInTheDocument();
  });

  it('shows loading state when generating', async () => {
    mockSupabase.functions.invoke.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithProviders(<AIGoalSuggestions />);

    const button = screen.getByRole('button', { name: /Get AI Suggestions/i });
    button.click();

    await waitFor(() => {
      expect(screen.getByText(/Analyzing Your Finances/i)).toBeInTheDocument();
    });
  });

  it('displays AI icon', () => {
    const { container } = renderWithProviders(<AIGoalSuggestions />);

    const sparklesIcon = container.querySelector('svg');
    expect(sparklesIcon).toBeInTheDocument();
  });

  it('has correct card styling', () => {
    const { container } = renderWithProviders(<AIGoalSuggestions />);

    const card = container.querySelector('.border-primary\\/20');
    expect(card).toBeInTheDocument();
  });
});
