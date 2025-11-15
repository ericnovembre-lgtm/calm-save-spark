import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@/test/utils';
import { VendorManagement } from '../VendorManagement';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

const mockSupabase = supabase as any;

describe('VendorManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
  });

  it('renders add vendor button', async () => {
    renderWithProviders(<VendorManagement businessProfileId="profile-123" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Vendor/i })).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    renderWithProviders(<VendorManagement businessProfileId="profile-123" />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('has correct businessProfileId prop', () => {
    const { container } = renderWithProviders(
      <VendorManagement businessProfileId="test-profile-123" />
    );

    expect(container).toBeInTheDocument();
  });
});
