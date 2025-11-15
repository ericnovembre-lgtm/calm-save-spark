import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, userEvent } from '@/test/utils';
import { CreateEventModal } from '../CreateEventModal';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(),
    functions: {
      invoke: vi.fn()
    }
  }
}));

vi.mock('@/hooks/useLifePlans', () => ({
  useLifePlans: () => ({
    createPlan: vi.fn()
  })
}));

describe('CreateEventModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'test-user-id' } }
    });
  });

  describe('Rendering', () => {
    it('renders modal when open is true', () => {
      render(<CreateEventModal open={true} onClose={mockOnClose} />);

      expect(screen.getByText('Create Life Plan')).toBeInTheDocument();
    });

    it('does not render modal when open is false', () => {
      render(<CreateEventModal open={false} onClose={mockOnClose} />);

      expect(screen.queryByText('Create Life Plan')).not.toBeInTheDocument();
    });

    it('renders all input fields', () => {
      render(<CreateEventModal open={true} onClose={mockOnClose} />);

      expect(screen.getByLabelText(/event name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/event type/i)).toBeInTheDocument();
      expect(screen.getByText(/target date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/estimated cost/i)).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      render(<CreateEventModal open={true} onClose={mockOnClose} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create plan/i })).toBeInTheDocument();
    });
  });

  describe('Event Type Options', () => {
    it('displays all event type options', async () => {
      const user = userEvent.setup();
      render(<CreateEventModal open={true} onClose={mockOnClose} />);

      const eventTypeSelect = screen.getByRole('combobox', { name: /event type/i });
      await user.click(eventTypeSelect);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /wedding/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /home purchase/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /baby/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /education/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /retirement/i })).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('shows error when submitting with empty fields', async () => {
      const user = userEvent.setup();
      render(<CreateEventModal open={true} onClose={mockOnClose} />);

      const createButton = screen.getByRole('button', { name: /create plan/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/missing information/i)).toBeInTheDocument();
      });
    });

    it('shows error when event name is missing', async () => {
      const user = userEvent.setup();
      render(<CreateEventModal open={true} onClose={mockOnClose} />);

      // Fill some fields but not event name
      const costInput = screen.getByLabelText(/estimated cost/i);
      await user.type(costInput, '25000');

      const createButton = screen.getByRole('button', { name: /create plan/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/missing information/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Input', () => {
    it('allows entering event name', async () => {
      const user = userEvent.setup();
      render(<CreateEventModal open={true} onClose={mockOnClose} />);

      const nameInput = screen.getByLabelText(/event name/i);
      await user.type(nameInput, 'My Dream Wedding');

      expect(nameInput).toHaveValue('My Dream Wedding');
    });

    it('allows entering estimated cost', async () => {
      const user = userEvent.setup();
      render(<CreateEventModal open={true} onClose={mockOnClose} />);

      const costInput = screen.getByLabelText(/estimated cost/i);
      await user.type(costInput, '25000');

      expect(costInput).toHaveValue(25000);
    });

    it('displays placeholder text in event name input', () => {
      render(<CreateEventModal open={true} onClose={mockOnClose} />);

      const nameInput = screen.getByPlaceholderText(/e.g., my dream wedding/i);
      expect(nameInput).toBeInTheDocument();
    });

    it('displays placeholder text in cost input', () => {
      render(<CreateEventModal open={true} onClose={mockOnClose} />);

      const costInput = screen.getByPlaceholderText(/25000/i);
      expect(costInput).toBeInTheDocument();
    });
  });

  describe('Date Picker', () => {
    it('renders date picker button', () => {
      render(<CreateEventModal open={true} onClose={mockOnClose} />);

      const dateButton = screen.getByRole('button', { name: /pick a date/i });
      expect(dateButton).toBeInTheDocument();
    });

    it('opens calendar when date button is clicked', async () => {
      const user = userEvent.setup();
      render(<CreateEventModal open={true} onClose={mockOnClose} />);

      const dateButton = screen.getByRole('button', { name: /pick a date/i });
      await user.click(dateButton);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument(); // Calendar grid
      });
    });
  });

  describe('Form Submission', () => {
    it('creates life plan with valid data', async () => {
      const user = userEvent.setup();
      
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'plan-id' },
            error: null
          })
        })
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert
      });

      (supabase.functions.invoke as any).mockResolvedValue({
        data: null,
        error: null
      });

      render(<CreateEventModal open={true} onClose={mockOnClose} />);

      // Fill in all fields
      const nameInput = screen.getByLabelText(/event name/i);
      await user.type(nameInput, 'My Wedding');

      const costInput = screen.getByLabelText(/estimated cost/i);
      await user.type(costInput, '25000');

      const createButton = screen.getByRole('button', { name: /create plan/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalled();
      });
    });

    it('shows loading state during creation', async () => {
      const user = userEvent.setup();
      
      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockImplementation(() => 
              new Promise(resolve => setTimeout(() => resolve({ data: { id: 'plan-id' }, error: null }), 100))
            )
          })
        })
      });

      render(<CreateEventModal open={true} onClose={mockOnClose} />);

      const nameInput = screen.getByLabelText(/event name/i);
      await user.type(nameInput, 'My Wedding');

      const costInput = screen.getByLabelText(/estimated cost/i);
      await user.type(costInput, '25000');

      const createButton = screen.getByRole('button', { name: /create plan/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/generating ai suggestions/i)).toBeInTheDocument();
      });
    });

    it('handles creation error', async () => {
      const user = userEvent.setup();
      
      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      });

      render(<CreateEventModal open={true} onClose={mockOnClose} />);

      const nameInput = screen.getByLabelText(/event name/i);
      await user.type(nameInput, 'My Wedding');

      const costInput = screen.getByLabelText(/estimated cost/i);
      await user.type(costInput, '25000');

      const createButton = screen.getByRole('button', { name: /create plan/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to create plan/i)).toBeInTheDocument();
      });
    });
  });

  describe('Modal Controls', () => {
    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<CreateEventModal open={true} onClose={mockOnClose} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('disables create button during loading', async () => {
      const user = userEvent.setup();
      
      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockImplementation(() => 
              new Promise(resolve => setTimeout(() => resolve({ data: { id: 'plan-id' }, error: null }), 100))
            )
          })
        })
      });

      render(<CreateEventModal open={true} onClose={mockOnClose} />);

      const nameInput = screen.getByLabelText(/event name/i);
      await user.type(nameInput, 'My Wedding');

      const costInput = screen.getByLabelText(/estimated cost/i);
      await user.type(costInput, '25000');

      const createButton = screen.getByRole('button', { name: /create plan/i });
      await user.click(createButton);

      await waitFor(() => {
        const loadingButton = screen.getByRole('button', { name: /generating/i });
        expect(loadingButton).toBeDisabled();
      });
    });
  });

  describe('Icons', () => {
    it('renders calendar icon in date picker', () => {
      render(<CreateEventModal open={true} onClose={mockOnClose} />);

      const dateButton = screen.getByRole('button', { name: /pick a date/i });
      expect(dateButton.querySelector('svg')).toBeInTheDocument();
    });

    it('renders loader icon during submission', async () => {
      const user = userEvent.setup();
      
      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockImplementation(() => 
              new Promise(resolve => setTimeout(() => resolve({ data: { id: 'plan-id' }, error: null }), 100))
            )
          })
        })
      });

      render(<CreateEventModal open={true} onClose={mockOnClose} />);

      const nameInput = screen.getByLabelText(/event name/i);
      await user.type(nameInput, 'My Wedding');

      const costInput = screen.getByLabelText(/estimated cost/i);
      await user.type(costInput, '25000');

      const createButton = screen.getByRole('button', { name: /create plan/i });
      await user.click(createButton);

      await waitFor(() => {
        const loadingButton = screen.getByRole('button', { name: /generating/i });
        expect(loadingButton.querySelector('svg')).toBeInTheDocument();
      });
    });
  });
});
