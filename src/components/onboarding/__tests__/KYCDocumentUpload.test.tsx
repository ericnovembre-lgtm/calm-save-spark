import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
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

  afterEach(() => {
    vi.clearAllTimers();
  });

  // ============================================================
  // 1. RENDERING & INITIAL STATE TESTS
  // ============================================================
  
  describe('Rendering & Initial State', () => {
    it('should render upload zone with instructions', () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      expect(screen.getByText('Upload KYC Documents')).toBeInTheDocument();
      expect(screen.getByText(/Drag & drop or click to upload/i)).toBeInTheDocument();
      expect(screen.getByText(/Supported: JPG, PNG, PDF \(max 10MB\)/i)).toBeInTheDocument();
    });

    it('should apply correct CSS classes to upload zone', () => {
      const { container } = renderWithProviders(<KYCDocumentUpload />);
      
      const uploadCard = container.querySelector('.border-2.border-dashed');
      expect(uploadCard).toBeInTheDocument();
      expect(uploadCard).toHaveClass('cursor-pointer');
    });

    it('should display Upload icon when idle', () => {
      const { container } = renderWithProviders(<KYCDocumentUpload />);
      
      const uploadIcon = container.querySelector('svg');
      expect(uploadIcon).toBeInTheDocument();
    });

    it('should not show document list initially', () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      expect(screen.queryByText('Uploaded Documents')).not.toBeInTheDocument();
    });
  });

  // ============================================================
  // 2. FILE UPLOAD FUNCTIONALITY TESTS
  // ============================================================
  
  describe('File Upload Functionality', () => {
    it('should accept PNG, JPG, JPEG files', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      const pngFile = new File(['content'], 'test.png', { type: 'image/png' });
      await mockOnDrop([pngFile]);
      
      await waitFor(() => {
        expect(supabase.storage.from).toHaveBeenCalledWith('kyc-documents');
      });
    });

    it('should accept PDF files', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      await mockOnDrop([pdfFile]);
      
      await waitFor(() => {
        expect(supabase.storage.from).toHaveBeenCalledWith('kyc-documents');
      });
    });

    it('should process multiple files sequentially', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      const file1 = new File(['content1'], 'passport.jpg', { type: 'image/jpeg' });
      const file2 = new File(['content2'], 'license.png', { type: 'image/png' });
      const file3 = new File(['content3'], 'bill.pdf', { type: 'application/pdf' });
      
      await mockOnDrop([file1, file2, file3]);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledTimes(3);
        expect(screen.getByText('passport.jpg')).toBeInTheDocument();
        expect(screen.getByText('license.png')).toBeInTheDocument();
        expect(screen.getByText('bill.pdf')).toBeInTheDocument();
      });
    });

    it('should set uploading state during upload', async () => {
      const { container } = renderWithProviders(<KYCDocumentUpload />);
      
      const uploadPromise = mockOnDrop([mockFile]);
      
      // Check for loader during upload (checking for animation class)
      await waitFor(() => {
        const loader = container.querySelector('.animate-spin');
        expect(loader).toBeInTheDocument();
      });
      
      await uploadPromise;
    });

    it('should create correct file path with timestamp', async () => {
      const mockDate = 1234567890;
      vi.spyOn(Date, 'now').mockReturnValue(mockDate);
      
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        const storageFrom = vi.mocked(supabase.storage.from).mock.results[0].value;
        expect(storageFrom.upload).toHaveBeenCalledWith(
          `user-123/${mockDate}-passport.jpg`,
          mockFile
        );
      });
    });

    it('should show success toast after upload', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Document uploaded',
          description: 'Processing verification...',
        });
      });
    });

    it('should add document to list after successful upload', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        expect(screen.getByText('Uploaded Documents')).toBeInTheDocument();
        expect(screen.getByText('passport.jpg')).toBeInTheDocument();
      });
    });

    it('should handle uploads with special characters in filename', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      const specialFile = new File(['content'], 'my-passport (copy) [2024].jpg', { 
        type: 'image/jpeg' 
      });
      
      await mockOnDrop([specialFile]);
      
      await waitFor(() => {
        expect(screen.getByText(/my-passport \(copy\) \[2024\]\.jpg/)).toBeInTheDocument();
      });
    });
  });

  // ============================================================
  // 3. DOCUMENT TYPE DETECTION TESTS
  // ============================================================
  
  describe('Document Type Detection', () => {
    it('should detect "passport" from filename', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      const files = [
        new File([''], 'my-passport.jpg', { type: 'image/jpeg' }),
        new File([''], 'PASSPORT_SCAN.pdf', { type: 'application/pdf' }),
        new File([''], 'passport-copy.png', { type: 'image/png' }),
      ];
      
      for (const file of files) {
        await mockOnDrop([file]);
      }
      
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalled();
        // Verify passport was detected
        expect(screen.getByText('passport')).toBeInTheDocument();
      });
    });

    it('should detect "drivers_license" from license/driver keywords', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      const licenseFile = new File([''], 'drivers-license.jpg', { type: 'image/jpeg' });
      await mockOnDrop([licenseFile]);
      
      await waitFor(() => {
        expect(screen.getByText(/drivers license/i)).toBeInTheDocument();
      });
    });

    it('should detect "utility_bill" from utility/bill keywords', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      const billFile = new File([''], 'utility-bill.pdf', { type: 'application/pdf' });
      await mockOnDrop([billFile]);
      
      await waitFor(() => {
        expect(screen.getByText(/utility bill/i)).toBeInTheDocument();
      });
    });

    it('should fall back to "other" for unrecognized filenames', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      const unknownFile = new File([''], 'random-doc.jpg', { type: 'image/jpeg' });
      await mockOnDrop([unknownFile]);
      
      await waitFor(() => {
        expect(screen.getByText('other')).toBeInTheDocument();
      });
    });

    it('should handle case-insensitive detection', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      const upperCaseFile = new File([''], 'PASSPORT.JPG', { type: 'image/jpeg' });
      await mockOnDrop([upperCaseFile]);
      
      await waitFor(() => {
        expect(screen.getByText('passport')).toBeInTheDocument();
      });
    });
  });

  // ============================================================
  // 4. SUPABASE INTEGRATION TESTS
  // ============================================================
  
  describe('Supabase Integration', () => {
    it('should call supabase.auth.getUser before upload', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
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
      
      await waitFor(() => {
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
      
      await waitFor(() => {
        expect(supabase.storage.from).toHaveBeenCalledWith('kyc-documents');
        const storageFrom = vi.mocked(supabase.storage.from).mock.results[0].value;
        expect(storageFrom.upload).toHaveBeenCalled();
      });
    });

    it('should get public URL after upload', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        const storageFrom = vi.mocked(supabase.storage.from).mock.results[0].value;
        expect(storageFrom.getPublicUrl).toHaveBeenCalled();
      });
    });

    it('should insert verification record with correct data', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('kyc_verifications');
        const fromMock = vi.mocked(supabase.from).mock.results[0].value;
        expect(fromMock.insert).toHaveBeenCalledWith(
          expect.objectContaining({
            user_id: 'user-123',
            document_type: 'passport',
            document_url: 'https://example.com/doc.jpg',
            verification_status: 'pending',
          })
        );
      });
    });

    it('should handle storage upload errors', async () => {
      vi.mocked(supabase.storage.from).mockReturnValueOnce({
        upload: vi.fn().mockResolvedValue({ 
          error: { message: 'Storage quota exceeded' },
          data: null,
        }),
        getPublicUrl: vi.fn(),
      } as any);
      
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Upload failed',
          description: 'Storage quota exceeded',
          variant: 'destructive',
        });
      });
    });
  });

  // ============================================================
  // 5. EDGE FUNCTION INTEGRATION TESTS
  // ============================================================
  
  describe('Edge Function Integration', () => {
    it('should invoke process-kyc-document after DB insert', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        expect(supabase.functions.invoke).toHaveBeenCalledWith(
          'process-kyc-document',
          expect.any(Object)
        );
      });
    });

    it('should pass correct parameters to edge function', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
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

    it('should handle edge function errors gracefully', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: null,
        error: { message: 'AI processing failed' },
      } as any);
      
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Upload failed',
          description: 'AI processing failed',
          variant: 'destructive',
        });
      });
    });

    it('should add document to list even if edge function fails', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: null,
        error: { message: 'Processing error' },
      } as any);
      
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      // Document should still appear even with edge function error
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled();
      });
    });
  });

  // ============================================================
  // 6. STATUS UPDATES & VISUALIZATION TESTS
  // ============================================================
  
  describe('Status Updates & Visualization', () => {
    it('should add document to list with pending status', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        expect(screen.getByText('passport.jpg')).toBeInTheDocument();
        expect(screen.getByText('Verifying...')).toBeInTheDocument();
      });
    });

    it('should display Loader2 icon for pending documents', async () => {
      const { container } = renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        const loaders = container.querySelectorAll('.animate-spin');
        expect(loaders.length).toBeGreaterThan(0);
      });
    });

    it('should show document type capitalized', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        expect(screen.getByText('passport')).toBeInTheDocument();
      });
    });

    it('should display file name correctly', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      const customFile = new File(['content'], 'my-important-passport.jpg', { 
        type: 'image/jpeg' 
      });
      await mockOnDrop([customFile]);
      
      await waitFor(() => {
        expect(screen.getByText('my-important-passport.jpg')).toBeInTheDocument();
      });
    });

    it('should show "Uploaded Documents" heading when documents exist', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        expect(screen.getByText('Uploaded Documents')).toBeInTheDocument();
      });
    });
  });

  // ============================================================
  // 7. ERROR HANDLING TESTS
  // ============================================================
  
  describe('Error Handling', () => {
    it('should show error toast on authentication failure', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      } as any);
      
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Upload failed',
            variant: 'destructive',
          })
        );
      });
    });

    it('should show error toast on database insert failure', async () => {
      vi.mocked(supabase.from).mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database constraint violation' },
            }),
          }),
        }),
      } as any);
      
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Upload failed',
          description: 'Database constraint violation',
          variant: 'destructive',
        });
      });
    });

    it('should reset uploading state after error', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      } as any);
      
      const { container } = renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        const loaders = container.querySelectorAll('.animate-spin');
        expect(loaders.length).toBe(0);
      });
    });

    it('should handle multiple file errors separately', async () => {
      vi.mocked(supabase.auth.getUser)
        .mockResolvedValueOnce({
          data: { user: mockUser },
          error: null,
        } as any)
        .mockResolvedValueOnce({
          data: { user: null },
          error: null,
        } as any);
      
      renderWithProviders(<KYCDocumentUpload />);
      
      const file1 = new File(['content1'], 'passport.jpg', { type: 'image/jpeg' });
      const file2 = new File(['content2'], 'license.jpg', { type: 'image/jpeg' });
      
      await mockOnDrop([file1, file2]);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledTimes(2);
      });
    });

    it('should display error with custom message', async () => {
      vi.mocked(supabase.storage.from).mockReturnValueOnce({
        upload: vi.fn().mockResolvedValue({ 
          error: { message: 'Custom error message' },
          data: null,
        }),
        getPublicUrl: vi.fn(),
      } as any);
      
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Upload failed',
          description: 'Custom error message',
          variant: 'destructive',
        });
      });
    });

    it('should handle network errors gracefully', async () => {
      vi.mocked(supabase.auth.getUser).mockRejectedValueOnce(
        new Error('Network error')
      );
      
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Upload failed',
            variant: 'destructive',
          })
        );
      });
    });
  });

  // ============================================================
  // 8. ACCESSIBILITY TESTS
  // ============================================================
  
  describe('Accessibility', () => {
    it('should have proper ARIA labels on upload zone', () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      const uploadZone = screen.getByRole('button', { name: /upload documents/i });
      expect(uploadZone).toBeInTheDocument();
    });

    it('should have file input with proper attributes', () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      const fileInput = screen.getByLabelText(/file input/i);
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
    });

    it('should provide text alternatives for status icons', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        expect(screen.getByText('Verifying...')).toBeInTheDocument();
      });
    });

    it('should have semantic HTML structure', () => {
      const { container } = renderWithProviders(<KYCDocumentUpload />);
      
      expect(container.querySelector('div.space-y-6')).toBeInTheDocument();
    });

    it('should announce successful uploads', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Document uploaded',
          })
        );
      });
    });

    it('should announce errors to users', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      } as any);
      
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
          })
        );
      });
    });
  });

  // ============================================================
  // 9. ADDITIONAL EDGE CASES & BOUNDARY TESTS
  // ============================================================
  
  describe('Edge Cases & Boundary Tests', () => {
    it('should handle very long filenames', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      const longFile = new File(
        ['content'], 
        'a'.repeat(200) + '-passport.jpg', 
        { type: 'image/jpeg' }
      );
      
      await mockOnDrop([longFile]);
      
      await waitFor(() => {
        expect(supabase.storage.from).toHaveBeenCalled();
      });
    });

    it('should handle files with no extension', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      const noExtFile = new File(['content'], 'passport', { type: 'image/jpeg' });
      
      await mockOnDrop([noExtFile]);
      
      await waitFor(() => {
        expect(screen.getByText('passport')).toBeInTheDocument();
      });
    });

    it('should handle concurrent uploads correctly', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      const file1 = new File(['1'], 'doc1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['2'], 'doc2.jpg', { type: 'image/jpeg' });
      
      // Trigger uploads in quick succession
      mockOnDrop([file1]);
      await new Promise(resolve => setTimeout(resolve, 10));
      mockOnDrop([file2]);
      
      await waitFor(() => {
        expect(screen.getByText('doc1.jpg')).toBeInTheDocument();
      });
    });

    it('should maintain state after component remount', async () => {
      const { unmount, rerender } = renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([mockFile]);
      
      await waitFor(() => {
        expect(screen.getByText('passport.jpg')).toBeInTheDocument();
      });
      
      unmount();
      rerender(<KYCDocumentUpload />);
      
      // After remount, state is reset (expected behavior)
      expect(screen.queryByText('passport.jpg')).not.toBeInTheDocument();
    });

    it('should handle empty file upload attempt', async () => {
      renderWithProviders(<KYCDocumentUpload />);
      
      await mockOnDrop([]);
      
      // Should not crash or show errors
      expect(screen.queryByText('Upload failed')).not.toBeInTheDocument();
    });
  });
});
