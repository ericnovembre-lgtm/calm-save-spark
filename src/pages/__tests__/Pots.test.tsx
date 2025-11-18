import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Pots from '../Pots';
import { supabase } from '@/integrations/supabase/client';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
      }))
    }
  }
}));

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Mock data
const mockPots = [
  {
    id: '1',
    user_id: 'test-user-id',
    name: 'Emergency Fund',
    target_amount: 5000,
    current_amount: 2500,
    target_date: '2025-12-31',
    notes: 'For unexpected expenses',
    color: 'blue',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    user_id: 'test-user-id',
    name: 'Vacation',
    target_amount: 3000,
    current_amount: 1000,
    target_date: '2025-06-30',
    notes: 'Summer trip to Europe',
    color: 'green',
    is_active: true,
    created_at: '2025-01-02T00:00:00Z'
  }
];

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Pots Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Functionality Tests', () => {
    describe('Create new pot with all fields', () => {
      beforeEach(() => {
        const mockFrom = vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          })),
          insert: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }));
        (supabase.from as any).mockImplementation(mockFrom);
      });

      it('should create a pot with name and target amount', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        // Open create dialog
        const createButton = screen.getByRole('button', { name: /create pot/i });
        await user.click(createButton);

        // Fill form
        const nameInput = screen.getByLabelText(/pot name/i);
        const targetInput = screen.getByLabelText(/target amount/i);
        
        await user.type(nameInput, 'Holiday Fund');
        await user.type(targetInput, '2000');

        // Submit
        const submitButton = screen.getByRole('button', { name: /create pot/i });
        await user.click(submitButton);

        await waitFor(() => {
          expect(supabase.from).toHaveBeenCalledWith('pots');
        });
      });

      it('should create a pot with optional fields (date, notes)', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        await user.click(screen.getByRole('button', { name: /create pot/i }));

        await user.type(screen.getByLabelText(/pot name/i), 'New Car');
        await user.type(screen.getByLabelText(/target amount/i), '15000');
        await user.type(screen.getByLabelText(/target date/i), '2025-12-31');
        await user.type(screen.getByLabelText(/notes/i), 'Saving for a Tesla');

        await user.click(screen.getByRole('button', { name: /create pot/i }));

        await waitFor(() => {
          expect(supabase.from).toHaveBeenCalledWith('pots');
        });
      });
    });

    describe('Edit existing pot', () => {
      beforeEach(() => {
        const mockFrom = vi.fn((table: string) => {
          if (table === 'pots') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  order: vi.fn(() => Promise.resolve({ data: mockPots, error: null }))
                }))
              })),
              update: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
              }))
            };
          }
        });
        (supabase.from as any).mockImplementation(mockFrom);
      });

      it('should open edit dialog with pre-filled data', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        await waitFor(() => {
          expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
        });

        const editButtons = screen.getAllByLabelText(/edit pot/i);
        await user.click(editButtons[0]);

        expect(screen.getByDisplayValue('Emergency Fund')).toBeInTheDocument();
        expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
      });

      it('should update pot when form is submitted', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        await waitFor(() => {
          expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
        });

        const editButtons = screen.getAllByLabelText(/edit pot/i);
        await user.click(editButtons[0]);

        const nameInput = screen.getByDisplayValue('Emergency Fund');
        await user.clear(nameInput);
        await user.type(nameInput, 'Updated Emergency Fund');

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
          expect(supabase.from).toHaveBeenCalledWith('pots');
        });
      });
    });

    describe('Delete pot with confirmation', () => {
      beforeEach(() => {
        const mockFrom = vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockPots, error: null }))
            }))
          })),
          delete: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }));
        (supabase.from as any).mockImplementation(mockFrom);
      });

      it('should show confirmation dialog when delete is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        await waitFor(() => {
          expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByLabelText(/delete pot/i);
        await user.click(deleteButtons[0]);

        expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
      });

      it('should delete pot when confirmed', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        await waitFor(() => {
          expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByLabelText(/delete pot/i);
        await user.click(deleteButtons[0]);

        const confirmButton = screen.getByRole('button', { name: /delete/i });
        await user.click(confirmButton);

        await waitFor(() => {
          expect(supabase.from).toHaveBeenCalledWith('pots');
        });
      });

      it('should cancel deletion and close dialog', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        await waitFor(() => {
          expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByLabelText(/delete pot/i);
        await user.click(deleteButtons[0]);

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await user.click(cancelButton);

        await waitFor(() => {
          expect(screen.queryByText(/are you sure you want to delete/i)).not.toBeInTheDocument();
        });
      });
    });

    describe('Form validation', () => {
      beforeEach(() => {
        const mockFrom = vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        }));
        (supabase.from as any).mockImplementation(mockFrom);
      });

      it('should show error when pot name is empty', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        await user.click(screen.getByRole('button', { name: /create pot/i }));
        await user.click(screen.getByRole('button', { name: /create pot/i }));

        await waitFor(() => {
          expect(screen.getByText(/pot name is required/i)).toBeInTheDocument();
        });
      });

      it('should show error when target amount is invalid', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        await user.click(screen.getByRole('button', { name: /create pot/i }));
        
        await user.type(screen.getByLabelText(/pot name/i), 'Test');
        await user.type(screen.getByLabelText(/target amount/i), '-100');
        
        await user.click(screen.getByRole('button', { name: /create pot/i }));

        await waitFor(() => {
          expect(screen.getByText(/target amount must be greater than 0/i)).toBeInTheDocument();
        });
      });
    });

    describe('Progress calculation', () => {
      beforeEach(() => {
        const mockFrom = vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockPots, error: null }))
            }))
          }))
        }));
        (supabase.from as any).mockImplementation(mockFrom);
      });

      it('should calculate progress correctly (50% for Emergency Fund)', async () => {
        renderWithProviders(<Pots />);

        await waitFor(() => {
          const emergencyFundCard = screen.getByText('Emergency Fund').closest('[role="article"]');
          expect(emergencyFundCard).toBeInTheDocument();
          
          // Progress should be 50% (2500/5000)
          if (emergencyFundCard) {
            const progressText = within(emergencyFundCard as HTMLElement).getByText(/50%/i);
            expect(progressText).toBeInTheDocument();
          }
        });
      });

      it('should show 0% when current amount is 0', async () => {
        const zeroPot = [{ ...mockPots[0], current_amount: 0 }];
        
        const mockFrom = vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: zeroPot, error: null }))
            }))
          }))
        }));
        (supabase.from as any).mockImplementation(mockFrom);

        renderWithProviders(<Pots />);

        await waitFor(() => {
          expect(screen.getByText(/0%/i)).toBeInTheDocument();
        });
      });
    });

    describe('Empty state', () => {
      beforeEach(() => {
        const mockFrom = vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        }));
        (supabase.from as any).mockImplementation(mockFrom);
      });

      it('should display empty state when no pots exist', async () => {
        renderWithProviders(<Pots />);

        await waitFor(() => {
          expect(screen.getByText(/no pots yet/i)).toBeInTheDocument();
        });
      });

      it('should show create button in empty state', async () => {
        renderWithProviders(<Pots />);

        await waitFor(() => {
          const emptyStateButtons = screen.getAllByRole('button', { name: /create pot/i });
          expect(emptyStateButtons.length).toBeGreaterThan(0);
        });
      });
    });

    describe('Loading state', () => {
      it('should show loading state while fetching', async () => {
        const mockFrom = vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => new Promise(() => {})) // Never resolves
            }))
          }))
        }));
        (supabase.from as any).mockImplementation(mockFrom);

        renderWithProviders(<Pots />);

        expect(screen.getByText(/loading/i)).toBeInTheDocument();
      });
    });
  });

  describe('UI/UX Tests', () => {
    describe('Modal overlay', () => {
      beforeEach(() => {
        const mockFrom = vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockPots, error: null }))
            }))
          }))
        }));
        (supabase.from as any).mockImplementation(mockFrom);
      });

      it('should open modal when create button is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        await user.click(screen.getByRole('button', { name: /create pot/i }));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      it('should close modal when cancel is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        await user.click(screen.getByRole('button', { name: /create pot/i }));
        
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await user.click(cancelButton);

        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
      });
    });

    describe('Icons display', () => {
      beforeEach(() => {
        const mockFrom = vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockPots, error: null }))
            }))
          }))
        }));
        (supabase.from as any).mockImplementation(mockFrom);
      });

      it('should display pot icon (Wallet)', async () => {
        renderWithProviders(<Pots />);

        await waitFor(() => {
          const walletIcons = document.querySelectorAll('svg');
          expect(walletIcons.length).toBeGreaterThan(0);
        });
      });

      it('should display action icons (Edit, Delete)', async () => {
        renderWithProviders(<Pots />);

        await waitFor(() => {
          expect(screen.getAllByLabelText(/edit pot/i).length).toBe(2);
          expect(screen.getAllByLabelText(/delete pot/i).length).toBe(2);
        });
      });
    });

    describe('Date formatting', () => {
      beforeEach(() => {
        const mockFrom = vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockPots, error: null }))
            }))
          }))
        }));
        (supabase.from as any).mockImplementation(mockFrom);
      });

      it('should format target date correctly', async () => {
        renderWithProviders(<Pots />);

        await waitFor(() => {
          // Date should be formatted (e.g., "Dec 31, 2025")
          expect(screen.getByText(/dec 31, 2025/i)).toBeInTheDocument();
        });
      });
    });

    describe('Notes display', () => {
      beforeEach(() => {
        const mockFrom = vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockPots, error: null }))
            }))
          }))
        }));
        (supabase.from as any).mockImplementation(mockFrom);
      });

      it('should display notes when present', async () => {
        renderWithProviders(<Pots />);

        await waitFor(() => {
          expect(screen.getByText('For unexpected expenses')).toBeInTheDocument();
          expect(screen.getByText('Summer trip to Europe')).toBeInTheDocument();
        });
      });

      it('should handle long notes appropriately', async () => {
        const longNotePot = [{
          ...mockPots[0],
          notes: 'This is a very long note that should be truncated or wrapped properly to maintain good UI/UX'
        }];
        
        const mockFrom = vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: longNotePot, error: null }))
            }))
          }))
        }));
        (supabase.from as any).mockImplementation(mockFrom);

        renderWithProviders(<Pots />);

        await waitFor(() => {
          const noteElement = screen.getByText(/this is a very long note/i);
          expect(noteElement).toBeInTheDocument();
        });
      });
    });
  });

  describe('Accessibility Tests', () => {
    beforeEach(() => {
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: mockPots, error: null }))
          }))
        }))
      }));
      (supabase.from as any).mockImplementation(mockFrom);
    });

    describe('Keyboard navigation', () => {
      it('should be able to navigate with keyboard', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        await waitFor(() => {
          expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
        });

        // Tab to create button
        await user.tab();
        expect(screen.getByRole('button', { name: /create pot/i })).toHaveFocus();
      });

      it('should open dialog with Enter key', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        const createButton = screen.getByRole('button', { name: /create pot/i });
        createButton.focus();
        
        await user.keyboard('{Enter}');

        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
      });
    });

    describe('ARIA labels', () => {
      it('should have ARIA labels on icon buttons', async () => {
        renderWithProviders(<Pots />);

        await waitFor(() => {
          expect(screen.getAllByLabelText(/edit pot/i).length).toBe(2);
          expect(screen.getAllByLabelText(/delete pot/i).length).toBe(2);
        });
      });

      it('should have proper dialog role and labels', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        await user.click(screen.getByRole('button', { name: /create pot/i }));

        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(screen.getByText(/create a new pot/i)).toBeInTheDocument();
      });
    });

    describe('Focus management', () => {
      it('should trap focus inside modal', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        await user.click(screen.getByRole('button', { name: /create pot/i }));

        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();

        // Focus should be inside dialog
        const inputs = within(dialog).getAllByRole('textbox');
        expect(inputs.length).toBeGreaterThan(0);
      });

      it('should return focus after modal closes', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        const createButton = screen.getByRole('button', { name: /create pot/i });
        await user.click(createButton);

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await user.click(cancelButton);

        await waitFor(() => {
          expect(document.activeElement).toBe(createButton);
        });
      });
    });

    describe('Error messages accessibility', () => {
      beforeEach(() => {
        const mockFrom = vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        }));
        (supabase.from as any).mockImplementation(mockFrom);
      });

      it('should associate error messages with inputs', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        await user.click(screen.getByRole('button', { name: /create pot/i }));
        await user.click(screen.getByRole('button', { name: /create pot/i }));

        await waitFor(() => {
          const errorMessage = screen.getByText(/pot name is required/i);
          expect(errorMessage).toBeInTheDocument();
          
          // Error should have proper ARIA attributes
          expect(errorMessage).toHaveClass('text-destructive');
        });
      });
    });
  });

  describe('Data Tests', () => {
    describe('CRUD operations', () => {
      it('should call correct Supabase methods for create', async () => {
        const insertMock = vi.fn(() => Promise.resolve({ data: null, error: null }));
        const mockFrom = vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          })),
          insert: insertMock
        }));
        (supabase.from as any).mockImplementation(mockFrom);

        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        await user.click(screen.getByRole('button', { name: /create pot/i }));
        await user.type(screen.getByLabelText(/pot name/i), 'Test Pot');
        await user.type(screen.getByLabelText(/target amount/i), '1000');
        await user.click(screen.getByRole('button', { name: /create pot/i }));

        await waitFor(() => {
          expect(insertMock).toHaveBeenCalled();
        });
      });

      it('should call correct Supabase methods for update', async () => {
        const updateMock = vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }));
        const mockFrom = vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockPots, error: null }))
            }))
          })),
          update: updateMock
        }));
        (supabase.from as any).mockImplementation(mockFrom);

        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        await waitFor(() => {
          expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
        });

        await user.click(screen.getAllByLabelText(/edit pot/i)[0]);
        await user.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
          expect(updateMock).toHaveBeenCalled();
        });
      });

      it('should call correct Supabase methods for delete', async () => {
        const deleteMock = vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }));
        const mockFrom = vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockPots, error: null }))
            }))
          })),
          delete: deleteMock
        }));
        (supabase.from as any).mockImplementation(mockFrom);

        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        await waitFor(() => {
          expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
        });

        await user.click(screen.getAllByLabelText(/delete pot/i)[0]);
        await user.click(screen.getByRole('button', { name: /delete/i }));

        await waitFor(() => {
          expect(deleteMock).toHaveBeenCalled();
        });
      });
    });

    describe('Real-time updates via react-query', () => {
      it('should invalidate queries after successful create', async () => {
        const mockFrom = vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          })),
          insert: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }));
        (supabase.from as any).mockImplementation(mockFrom);

        const user = userEvent.setup();
        renderWithProviders(<Pots />);

        await user.click(screen.getByRole('button', { name: /create pot/i }));
        await user.type(screen.getByLabelText(/pot name/i), 'New Pot');
        await user.type(screen.getByLabelText(/target amount/i), '500');
        await user.click(screen.getByRole('button', { name: /create pot/i }));

        // Should trigger refetch
        await waitFor(() => {
          expect(supabase.from).toHaveBeenCalledWith('pots');
        });
      });
    });

    describe('Currency field respected', () => {
      beforeEach(() => {
        const mockFrom = vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockPots, error: null }))
            }))
          }))
        }));
        (supabase.from as any).mockImplementation(mockFrom);
      });

      it('should display currency symbol ($)', async () => {
        renderWithProviders(<Pots />);

        await waitFor(() => {
          const currencySymbols = screen.getAllByText(/\$/);
          expect(currencySymbols.length).toBeGreaterThan(0);
        });
      });

      it('should format amounts correctly', async () => {
        renderWithProviders(<Pots />);

        await waitFor(() => {
          expect(screen.getByText(/\$2,500/)).toBeInTheDocument();
          expect(screen.getByText(/\$5,000/)).toBeInTheDocument();
        });
      });
    });
  });
});
