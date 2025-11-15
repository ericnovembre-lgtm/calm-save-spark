import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import { KYCDocumentUpload } from '../KYCDocumentUpload';
import { supabase } from '@/integrations/supabase/client';

// Mock modules
vi.mock('@/integrations/supabase/client');

const mockToast = vi.fn();
const mockDismiss = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ 
    toast: mockToast,
    dismiss: mockDismiss,
    toasts: [],
  }),
}));

// Mock react-dropzone
let mockOnDrop: (files: File[]) => void;
vi.mock('react-dropzone', () => ({
  useDropzone: vi.fn(({ onDrop }) => {
    mockOnDrop = onDrop;
    return {
      getRootProps: () => ({
        onClick: vi.fn(),
        role: 'button',
        'aria-label': 'Upload documents',
      }),
      getInputProps: () => ({
        type: 'file',
        'aria-label': 'File input',
      }),
      isDragActive: false,
    };
  }),
}));

describe('KYCDocumentUpload', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockFile = new File(['content'], 'passport.jpg', { type: 'image/jpeg' });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default Supabase mocks
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null, data: { path: 'test-path' } }),
      getPublicUrl: vi.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/doc.jpg' },
      }),
    } as any);

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'doc-123', document_type: 'passport' },
            error: null,
          }),
        }),
      }),
    } as any);

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: null,
    } as any);
  });

  describe('Rendering & Initial State', () => {
    it('should render upload zone with instructions', () => {
      const { getByText } = renderWithProviders(<KYCDocumentUpload />);
      
      expect(getByText('Upload KYC Documents')).toBeInTheDocument();
      expect(getByText(/Drag & drop or click to upload/i)).toBeInTheDocument();
      expect(getByText(/Supported: JPG, PNG, PDF \(max 10MB\)/i)).toBeInTheDocument();
    });

    it('should not show document list initially', () => {
      const { queryByText } = renderWithProviders(<KYCDocumentUpload />);
      
      expect(queryByText('Uploaded Documents')).not.toBeInTheDocument();
    });
  });

  describe('File Upload Functionality', () => {
    it('should accept valid image files', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      const pngFile = new File(['content'], 'test.png', { type: 'image/png' });
      await mockOnDrop([pngFile]);
      
      expect(supabase.storage.from).toHaveBeenCalledWith('kyc-documents');
    });

    it('should show success toast after upload', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await vi.waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Document uploaded',
          description: 'Processing verification...',
        });
      });
    });
  });

  describe('Document Type Detection', () => {
    it('should detect passport from filename', async () => {
      const { getByText } = renderWithProviders(<KYCDocumentUpload />);
      
      const passportFile = new File([''], 'my-passport.jpg', { type: 'image/jpeg' });
      await mockOnDrop([passportFile]);
      
      await vi.waitFor(() => {
        expect(getByText('passport')).toBeInTheDocument();
      });
    });

    it('should detect drivers_license from filename', async () => {
      const { getByText } = renderWithProviders(<KYCDocumentUpload />);
      
      const licenseFile = new File([''], 'drivers-license.jpg', { type: 'image/jpeg' });
      await mockOnDrop([licenseFile]);
      
      await vi.waitFor(() => {
        expect(getByText(/drivers license/i)).toBeInTheDocument();
      });
    });
  });

  describe('Supabase Integration', () => {
    it('should call supabase.auth.getUser before upload', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await vi.waitFor(() => {
        expect(supabase.auth.getUser).toHaveBeenCalled();
      });
    });

    it('should throw error when user is not authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      } as any);
      
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await vi.waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Upload failed',
          description: 'Not authenticated',
          variant: 'destructive',
        });
      });
    });

    it('should upload file to kyc-documents bucket', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await vi.waitFor(() => {
        expect(supabase.storage.from).toHaveBeenCalledWith('kyc-documents');
      });
    });
  });

  describe('Edge Function Integration', () => {
    it('should invoke process-kyc-document after DB insert', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await vi.waitFor(() => {
        expect(supabase.functions.invoke).toHaveBeenCalledWith(
          'process-kyc-document',
          expect.any(Object)
        );
      });
    });

    it('should pass correct parameters to edge function', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await vi.waitFor(() => {
        expect(supabase.functions.invoke).toHaveBeenCalledWith(
          'process-kyc-document',
          {
            body: {
              documentId: 'doc-123',
              documentUrl: 'https://example.com/doc.jpg',
            },
          }
        );
      });
    });
  });

  describe('Status Updates & Visualization', () => {
    it('should add document to list with pending status', async () => {
      const { getByText } = renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await vi.waitFor(() => {
        expect(getByText('passport.jpg')).toBeInTheDocument();
        expect(getByText('Verifying...')).toBeInTheDocument();
      });
    });

    it('should show document type', async () => {
      const { getByText } = renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await vi.waitFor(() => {
        expect(getByText('passport')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error toast on storage failure', async () => {
      vi.mocked(supabase.storage.from).mockReturnValueOnce({
        upload: vi.fn().mockResolvedValue({ 
          error: { message: 'Storage quota exceeded' },
          data: null,
        }),
        getPublicUrl: vi.fn(),
      } as any);
      
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await vi.waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Upload failed',
          description: 'Storage quota exceeded',
          variant: 'destructive',
        });
      });
    });

    it('should handle edge function errors gracefully', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: null,
        error: { message: 'AI processing failed' },
      } as any);
      
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await vi.waitFor(() => {
        expect(mockToast).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on upload zone', () => {
      const { getByRole } = renderWithProviders(<KYCDocumentUpload />);
      
      const uploadZone = getByRole('button', { name: /upload documents/i });
      expect(uploadZone).toBeInTheDocument();
    });

    it('should have file input with proper attributes', () => {
      const { getByLabelText } = renderWithProviders(<KYCDocumentUpload />);
      
      const fileInput = getByLabelText(/file input/i);
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
    });
  });
});
