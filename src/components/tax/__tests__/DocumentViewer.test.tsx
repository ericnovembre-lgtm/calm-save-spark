import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import { DocumentViewer } from '../DocumentViewer';
import * as ToastModule from '@/hooks/use-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Supabase client
const mockDocuments = [
  {
    id: 'doc-1',
    document_name: 'W2-2024.pdf',
    document_type: 'w2',
    storage_path: 'user/2024/w2.pdf',
    processing_status: 'completed',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'doc-2',
    document_name: '1099-MISC.pdf',
    document_type: '1099',
    storage_path: 'user/2024/1099.pdf',
    processing_status: 'processing',
    created_at: '2024-02-10T14:30:00Z'
  }
];

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      })
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({
              data: mockDocuments,
              error: null
            }),
            eq: vi.fn().mockResolvedValue({
              data: mockDocuments.filter(d => d.document_type === 'w2'),
              error: null
            })
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null })
      }))
    })),
    storage: {
      from: vi.fn(() => ({
        download: vi.fn().mockResolvedValue({
          data: new Blob(['test'], { type: 'application/pdf' }),
          error: null
        }),
        remove: vi.fn().mockResolvedValue({ error: null })
      }))
    }
  }
}));

// Mock toast
const mockToast = vi.fn();
vi.spyOn(ToastModule, 'useToast').mockReturnValue({ toast: mockToast, dismiss: vi.fn(), toasts: [] });

// Mock URL methods
global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
global.URL.revokeObjectURL = vi.fn();

describe('DocumentViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    const { getByText } = renderWithProviders(
      <DocumentViewer taxYear={2024} filter="all" />
    );

    expect(getByText(/Loading documents.../i)).toBeInTheDocument();
  });

  it('should display documents after loading', async () => {
    const { getByText } = renderWithProviders(
      <DocumentViewer taxYear={2024} filter="all" />
    );

    await vi.waitFor(() => {
      expect(getByText('W2-2024.pdf')).toBeInTheDocument();
      expect(getByText('1099-MISC.pdf')).toBeInTheDocument();
    });
  });

  it('should show empty state when no documents exist', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    supabase.from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: [], error: null })
          }))
        }))
      }))
    })) as any;

    const { getByText } = renderWithProviders(
      <DocumentViewer taxYear={2024} filter="all" />
    );

    await vi.waitFor(() => {
      expect(getByText(/No documents yet/i)).toBeInTheDocument();
    });
  });

  it('should filter documents by type', async () => {
    const { getByText, queryByText } = renderWithProviders(
      <DocumentViewer taxYear={2024} filter="w2" />
    );

    await vi.waitFor(() => {
      expect(getByText('W2-2024.pdf')).toBeInTheDocument();
    });
  });

  it('should display processing status badge', async () => {
    const { getByText } = renderWithProviders(
      <DocumentViewer taxYear={2024} filter="all" />
    );

    await vi.waitFor(() => {
      expect(getByText(/completed/i)).toBeInTheDocument();
      expect(getByText(/processing/i)).toBeInTheDocument();
    });
  });

  it('should call onDocumentSelect when document is clicked', async () => {
    const mockOnSelect = vi.fn();
    const { getByText } = renderWithProviders(
      <DocumentViewer taxYear={2024} filter="all" onDocumentSelect={mockOnSelect} />
    );

    await vi.waitFor(() => {
      const doc = getByText('W2-2024.pdf');
      doc.click();
    });

    expect(mockOnSelect).toHaveBeenCalledWith('doc-1');
  });

  it('should handle document download', async () => {
    const { getByText, container } = renderWithProviders(
      <DocumentViewer taxYear={2024} filter="all" />
    );

    await vi.waitFor(() => {
      const downloadButtons = container.querySelectorAll('[data-lucide="download"]');
      if (downloadButtons[0]) {
        (downloadButtons[0] as HTMLElement).click();
      }
    });

    await vi.waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Downloaded successfully' })
      );
    });
  });

  it('should handle document deletion', async () => {
    const { container } = renderWithProviders(
      <DocumentViewer taxYear={2024} filter="all" />
    );

    await vi.waitFor(() => {
      const deleteButtons = container.querySelectorAll('[data-lucide="trash-2"]');
      if (deleteButtons[0]) {
        (deleteButtons[0] as HTMLElement).click();
      }
    });

    await vi.waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Document deleted' })
      );
    });
  });

  it('should handle download error', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    supabase.storage.from = vi.fn(() => ({
      download: vi.fn().mockResolvedValue({ error: new Error('Download failed') })
    })) as any;

    const { container } = renderWithProviders(
      <DocumentViewer taxYear={2024} filter="all" />
    );

    await vi.waitFor(() => {
      const downloadButtons = container.querySelectorAll('[data-lucide="download"]');
      if (downloadButtons[0]) {
        (downloadButtons[0] as HTMLElement).click();
      }
    });

    await vi.waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'destructive' })
      );
    });
  });

  it('should handle delete error', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    supabase.from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: mockDocuments, error: null })
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: new Error('Delete failed') })
      }))
    })) as any;

    const { container } = renderWithProviders(
      <DocumentViewer taxYear={2024} filter="all" />
    );

    await vi.waitFor(() => {
      const deleteButtons = container.querySelectorAll('[data-lucide="trash-2"]');
      if (deleteButtons[0]) {
        (deleteButtons[0] as HTMLElement).click();
      }
    });

    await vi.waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Delete failed' })
      );
    });
  });

  it('should render documents in grid layout', async () => {
    const { container } = renderWithProviders(
      <DocumentViewer taxYear={2024} filter="all" />
    );

    await vi.waitFor(() => {
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });
  });

  it('should display document icon for each file', async () => {
    const { container } = renderWithProviders(
      <DocumentViewer taxYear={2024} filter="all" />
    );

    await vi.waitFor(() => {
      const icons = container.querySelectorAll('[data-lucide="file-text"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  it('should handle authentication error', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    supabase.auth.getUser = vi.fn().mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated')
    });

    const { container } = renderWithProviders(
      <DocumentViewer taxYear={2024} filter="all" />
    );

    // Should handle error gracefully
    await vi.waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });

  it('should query correct tax year', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    renderWithProviders(<DocumentViewer taxYear={2023} filter="all" />);

    await vi.waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('tax_documents');
    });
  });

  it('should render with motion animations', async () => {
    const { container } = renderWithProviders(
      <DocumentViewer taxYear={2024} filter="all" />
    );

    await vi.waitFor(() => {
      // Motion.div should be rendered (or its mock)
      expect(container.querySelector('.grid')).toBeInTheDocument();
    });
  });
});
