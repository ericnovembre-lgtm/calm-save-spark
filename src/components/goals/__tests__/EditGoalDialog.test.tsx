import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen } from '@/test/utils';
import { EditGoalDialog } from '../EditGoalDialog';

describe('EditGoalDialog', () => {
  const mockGoal = {
    id: 'goal-123',
    name: 'Emergency Fund',
    target_amount: 10000,
    deadline: '2025-12-31',
    icon: 'piggy-bank',
  };

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    goal: mockGoal,
    onSubmit: vi.fn(),
    isSubmitting: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog with goal details', () => {
    renderWithProviders(<EditGoalDialog {...defaultProps} />);

    expect(screen.getByText('Edit Goal')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Emergency Fund')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10000')).toBeInTheDocument();
  });

  it('displays goal name input', () => {
    renderWithProviders(<EditGoalDialog {...defaultProps} />);

    const nameInput = screen.getByLabelText(/Goal Name/i);
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveValue('Emergency Fund');
  });

  it('displays target amount input', () => {
    renderWithProviders(<EditGoalDialog {...defaultProps} />);

    const amountInput = screen.getByLabelText(/Target Amount/i);
    expect(amountInput).toBeInTheDocument();
    expect(amountInput).toHaveAttribute('type', 'number');
  });

  it('displays deadline input', () => {
    renderWithProviders(<EditGoalDialog {...defaultProps} />);

    const deadlineInput = screen.getByLabelText(/Deadline/i);
    expect(deadlineInput).toBeInTheDocument();
    expect(deadlineInput).toHaveAttribute('type', 'date');
  });

  it('shows save button', () => {
    renderWithProviders(<EditGoalDialog {...defaultProps} />);

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).not.toBeDisabled();
  });

  it('disables save button when submitting', () => {
    renderWithProviders(<EditGoalDialog {...defaultProps} isSubmitting={true} />);

    const saveButton = screen.getByRole('button', { name: /Saving/i });
    expect(saveButton).toBeDisabled();
  });

  it('shows cancel button', () => {
    renderWithProviders(<EditGoalDialog {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    expect(cancelButton).toBeInTheDocument();
  });

  it('returns null when goal is null', () => {
    const { container } = renderWithProviders(
      <EditGoalDialog {...defaultProps} goal={null} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('handles goal without deadline', () => {
    const goalWithoutDeadline = { ...mockGoal, deadline: null };
    renderWithProviders(
      <EditGoalDialog {...defaultProps} goal={goalWithoutDeadline} />
    );

    const deadlineInput = screen.getByLabelText(/Deadline/i);
    expect(deadlineInput).toHaveValue('');
  });

  it('populates form when goal changes', () => {
    const { rerender } = renderWithProviders(<EditGoalDialog {...defaultProps} />);

    const newGoal = {
      ...mockGoal,
      name: 'Vacation Fund',
      target_amount: 5000,
    };

    rerender(
      <EditGoalDialog {...defaultProps} goal={newGoal} />
    );

    expect(screen.getByDisplayValue('Vacation Fund')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
  });
});
