import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@/test/utils';
import { BusinessProfile } from '../BusinessProfile';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

const mockSupabase = supabase as any;

describe('BusinessProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
  });

  it('renders create business profile title', () => {
    renderWithProviders(<BusinessProfile />);

    expect(screen.getByText('Create Business Profile')).toBeInTheDocument();
  });

  it('displays business name input', () => {
    renderWithProviders(<BusinessProfile />);

    const input = screen.getByLabelText(/Business Name/i);
    expect(input).toBeInTheDocument();
    expect(input).toBeRequired();
  });

  it('displays business type input', () => {
    renderWithProviders(<BusinessProfile />);

    const input = screen.getByLabelText(/Business Type/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'e.g., LLC, Corporation');
  });

  it('displays tax ID input', () => {
    renderWithProviders(<BusinessProfile />);

    const input = screen.getByLabelText(/Tax ID/i);
    expect(input).toBeInTheDocument();
  });

  it('displays email input', () => {
    renderWithProviders(<BusinessProfile />);

    const input = screen.getByLabelText(/Email/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
  });

  it('displays phone input', () => {
    renderWithProviders(<BusinessProfile />);

    const input = screen.getByLabelText(/Phone/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'tel');
  });

  it('displays address input', () => {
    renderWithProviders(<BusinessProfile />);

    const input = screen.getByLabelText(/Address/i);
    expect(input).toBeInTheDocument();
  });

  it('has submit button', () => {
    renderWithProviders(<BusinessProfile />);

    const button = screen.getByRole('button', { name: /Create Business Profile/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('renders building icon', () => {
    const { container } = renderWithProviders(<BusinessProfile />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('uses grid layout for form fields', () => {
    const { container } = renderWithProviders(<BusinessProfile />);

    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2');
  });

  it('address field spans full width on medium screens', () => {
    const { container } = renderWithProviders(<BusinessProfile />);

    const addressWrapper = screen.getByLabelText(/Address/i).closest('div');
    expect(addressWrapper).toHaveClass('md:col-span-2');
  });
});
