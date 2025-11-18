import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor, userEvent } from '../utils';
import { CreateBudgetWizard } from '@/components/budget/CreateBudgetWizard';
import { supabase } from '@/integrations/supabase/client';

describe('Budget Creation Flow - Integration Test', () => {
  const mockCategories = [
    { id: '1', name: 'Food', code: 'food', icon: '🍕', color: '#FF6B6B' },
    { id: '2', name: 'Transport', code: 'transport', icon: '🚗', color: '#4ECDC4' },
    { id: '3', name: 'Entertainment', code: 'entertainment', icon: '🎮', color: '#95E1D3' },
  ];

  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful save
    (supabase.from as any).mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: { id: 'new-budget-123' }, error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockCategories, error: null }),
    });
  });

  it('completes full budget creation wizard flow', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <CreateBudgetWizard
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        categories={mockCategories}
      />
    );

    // Step 1: Select template
    await waitFor(() => {
      expect(screen.getByText(/Select a Budget Template/i)).toBeInTheDocument();
    });
    
    const fiftyThirtyTwenty = screen.getByText(/50\/30\/20 Rule/i);
    await user.click(fiftyThirtyTwenty);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Step 2: Basic information
    await waitFor(() => {
      expect(screen.getByLabelText(/Budget Name/i)).toBeInTheDocument();
    });
    
    const nameInput = screen.getByLabelText(/Budget Name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'My Monthly Budget');
    
    const periodSelect = screen.getByRole('combobox');
    await user.click(periodSelect);
    await user.click(screen.getByText(/monthly/i));
    
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 3: Set total budget
    await waitFor(() => {
      expect(screen.getByText(/Set Your Total Budget/i)).toBeInTheDocument();
    });
    
    const budgetInput = screen.getByRole('spinbutton');
    await user.clear(budgetInput);
    await user.type(budgetInput, '5000');
    
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 4: Allocate categories
    await waitFor(() => {
      expect(screen.getByText(/Allocate by Category/i)).toBeInTheDocument();
    });
    
    // Verify suggested allocations based on 50/30/20 rule
    expect(screen.getByText(/\$2,500/)).toBeInTheDocument(); // 50% for essentials
    
    const createButton = screen.getByRole('button', { name: /create budget/i });
    await user.click(createButton);

    // Verify budget creation
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My Monthly Budget',
          period: 'monthly',
          total_limit: 5000,
        })
      );
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('navigates back and preserves form data', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <CreateBudgetWizard
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        categories={mockCategories}
      />
    );

    // Complete step 1
    const customTemplate = screen.getByText(/Custom Budget/i);
    await user.click(customTemplate);
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Complete step 2
    await waitFor(() => {
      expect(screen.getByLabelText(/Budget Name/i)).toBeInTheDocument();
    });
    
    await user.type(screen.getByLabelText(/Budget Name/i), 'Test Budget');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Go back
    await waitFor(() => {
      expect(screen.getByText(/Set Your Total Budget/i)).toBeInTheDocument();
    });
    
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    // Verify data persists
    await waitFor(() => {
      const input = screen.getByLabelText(/Budget Name/i) as HTMLInputElement;
      expect(input.value).toBe('Test Budget');
    });
  });

  it('validates required fields and shows errors', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <CreateBudgetWizard
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        categories={mockCategories}
      />
    );

    // Try to skip template selection
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);
    
    // Should still be on step 1
    expect(screen.getByText(/Select a Budget Template/i)).toBeInTheDocument();

    // Select template and go to step 2
    await user.click(screen.getByText(/Custom Budget/i));
    await user.click(nextButton);

    // Try to proceed without budget name
    await waitFor(() => {
      expect(screen.getByLabelText(/Budget Name/i)).toBeInTheDocument();
    });
    
    const step2NextButton = screen.getByRole('button', { name: /next/i });
    await user.click(step2NextButton);

    // Should show validation error or stay on step 2
    expect(screen.getByLabelText(/Budget Name/i)).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock API error
    (supabase.from as any).mockReturnValue({
      insert: vi.fn().mockRejectedValue(new Error('Network error')),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    });

    renderWithProviders(
      <CreateBudgetWizard
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        categories={mockCategories}
      />
    );

    // Complete all steps quickly
    await user.click(screen.getByText(/Custom Budget/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Budget Name/i)).toBeInTheDocument();
    });
    
    await user.type(screen.getByLabelText(/Budget Name/i), 'Error Test');
    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });
    
    await user.type(screen.getByRole('spinbutton'), '3000');
    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create budget/i })).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('button', { name: /create budget/i }));

    // Verify error handling (component should show error toast or message)
    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });
});
