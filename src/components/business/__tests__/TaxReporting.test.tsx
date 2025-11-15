import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen } from '@/test/utils';
import { TaxReporting } from '../TaxReporting';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('TaxReporting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders generate tax report title', () => {
    renderWithProviders(<TaxReporting />);

    expect(screen.getByText('Generate Tax Report')).toBeInTheDocument();
  });

  it('displays year selector', () => {
    renderWithProviders(<TaxReporting />);

    expect(screen.getByText('Tax Year')).toBeInTheDocument();
  });

  it('displays quarter selector', () => {
    renderWithProviders(<TaxReporting />);

    expect(screen.getByText(/Quarter \(Optional\)/i)).toBeInTheDocument();
  });

  it('has generate report button', () => {
    renderWithProviders(<TaxReporting />);

    const button = screen.getByRole('button', { name: /Generate Report/i });
    expect(button).toBeInTheDocument();
  });

  it('renders trending up icon', () => {
    const { container } = renderWithProviders(<TaxReporting />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('current year is selected by default', () => {
    renderWithProviders(<TaxReporting />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(currentYear.toString())).toBeInTheDocument();
  });
});
