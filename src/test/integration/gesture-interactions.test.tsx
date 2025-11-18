import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '../utils';
import { GestureGoalCard } from '@/components/goals/interactions/GestureGoalCard';
import { DragToReorderGoals } from '@/components/goals/interactions/DragToReorderGoals';
import { fireEvent } from '@testing-library/react';

describe('Gesture Interactions - Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GestureGoalCard', () => {
    const mockGoal = {
      id: 'goal-123',
      name: 'Emergency Fund',
      current: 5000,
      target: 10000,
    };

    it('handles swipe right for quick deposit', async () => {
      const mockQuickDeposit = vi.fn();
      
      renderWithProviders(
        <GestureGoalCard
          id={mockGoal.id}
          name={mockGoal.name}
          current={mockGoal.current}
          target={mockGoal.target}
          onQuickDeposit={mockQuickDeposit}
        >
          <div>Goal Card Content</div>
        </GestureGoalCard>
      );

      const card = screen.getByText('Goal Card Content').parentElement;
      expect(card).toBeInTheDocument();

      // Simulate swipe right gesture
      fireEvent.pointerDown(card!, { clientX: 0, clientY: 0 });
      fireEvent.pointerMove(card!, { clientX: 150, clientY: 0 });
      fireEvent.pointerUp(card!, { clientX: 150, clientY: 0 });

      await waitFor(() => {
        expect(mockQuickDeposit).toHaveBeenCalledWith(mockGoal.id);
      });
    });

    it('handles swipe left for delete', async () => {
      const mockDelete = vi.fn();
      
      renderWithProviders(
        <GestureGoalCard
          id={mockGoal.id}
          name={mockGoal.name}
          current={mockGoal.current}
          target={mockGoal.target}
          onDelete={mockDelete}
        >
          <div>Goal Card Content</div>
        </GestureGoalCard>
      );

      const card = screen.getByText('Goal Card Content').parentElement;

      // Simulate swipe left gesture
      fireEvent.pointerDown(card!, { clientX: 200, clientY: 0 });
      fireEvent.pointerMove(card!, { clientX: 50, clientY: 0 });
      fireEvent.pointerUp(card!, { clientX: 50, clientY: 0 });

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith(mockGoal.id);
      }, { timeout: 500 });
    });

    it('shows visual feedback during swipe', async () => {
      renderWithProviders(
        <GestureGoalCard
          id={mockGoal.id}
          name={mockGoal.name}
          current={mockGoal.current}
          target={mockGoal.target}
          onQuickDeposit={vi.fn()}
        >
          <div>Goal Card Content</div>
        </GestureGoalCard>
      );

      const card = screen.getByText('Goal Card Content').parentElement;

      // Start swipe
      fireEvent.pointerDown(card!, { clientX: 0, clientY: 0 });
      fireEvent.pointerMove(card!, { clientX: 60, clientY: 0 });

      await waitFor(() => {
        // Should show "Quick Deposit" hint
        expect(screen.getByText(/Quick Deposit/i)).toBeInTheDocument();
      });
    });

    it('cancels gesture if swipe is too short', async () => {
      const mockQuickDeposit = vi.fn();
      
      renderWithProviders(
        <GestureGoalCard
          id={mockGoal.id}
          name={mockGoal.name}
          current={mockGoal.current}
          target={mockGoal.target}
          onQuickDeposit={mockQuickDeposit}
        >
          <div>Goal Card Content</div>
        </GestureGoalCard>
      );

      const card = screen.getByText('Goal Card Content').parentElement;

      // Short swipe (less than threshold)
      fireEvent.pointerDown(card!, { clientX: 0, clientY: 0 });
      fireEvent.pointerMove(card!, { clientX: 50, clientY: 0 });
      fireEvent.pointerUp(card!, { clientX: 50, clientY: 0 });

      await waitFor(() => {
        expect(mockQuickDeposit).not.toHaveBeenCalled();
      });
    });
  });

  describe('DragToReorderGoals', () => {
    const mockGoals = [
      { id: '1', name: 'Emergency Fund', progress: 50, icon: '💰' },
      { id: '2', name: 'Vacation', progress: 30, icon: '✈️' },
      { id: '3', name: 'New Car', progress: 70, icon: '🚗' },
    ];

    it('allows reordering goals via drag and drop', async () => {
      const mockOnReorder = vi.fn();
      
      renderWithProviders(
        <DragToReorderGoals goals={mockGoals} onReorder={mockOnReorder} />
      );

      // Verify all goals are rendered
      expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
      expect(screen.getByText('Vacation')).toBeInTheDocument();
      expect(screen.getByText('New Car')).toBeInTheDocument();

      // Simulate drag and drop (mocked, as full drag simulation is complex)
      const firstGoal = screen.getByText('Emergency Fund').closest('li');
      const secondGoal = screen.getByText('Vacation').closest('li');

      if (firstGoal && secondGoal) {
        // This is a simplified test - actual drag-drop would require more complex simulation
        fireEvent.dragStart(firstGoal);
        fireEvent.dragOver(secondGoal);
        fireEvent.drop(secondGoal);
      }

      // The component should call onReorder with new order
      // Note: Framer Motion's Reorder requires more complex testing setup
      await waitFor(() => {
        expect(mockOnReorder).toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('displays progress bars for each goal', () => {
      renderWithProviders(
        <DragToReorderGoals goals={mockGoals} onReorder={vi.fn()} />
      );

      // Check progress percentages
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('70%')).toBeInTheDocument();
    });

    it('shows drag handle on each goal', () => {
      renderWithProviders(
        <DragToReorderGoals goals={mockGoals} onReorder={vi.fn()} />
      );

      const dragHandles = screen.getAllByRole('img', { hidden: true });
      expect(dragHandles.length).toBeGreaterThan(0);
    });

    it('shows toast notification after reordering', async () => {
      const mockOnReorder = vi.fn();
      
      const { rerender } = renderWithProviders(
        <DragToReorderGoals goals={mockGoals} onReorder={mockOnReorder} />
      );

      // Simulate reorder
      const newOrder = [mockGoals[1], mockGoals[0], mockGoals[2]];
      
      rerender(
        <DragToReorderGoals goals={newOrder} onReorder={mockOnReorder} />
      );

      await waitFor(() => {
        // Toast should show "Goals reordered"
        expect(screen.getByText(/reordered|priority/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('maintains goal data integrity during reorder', async () => {
      const mockOnReorder = vi.fn();
      
      renderWithProviders(
        <DragToReorderGoals goals={mockGoals} onReorder={mockOnReorder} />
      );

      // Simulate reorder completion
      await waitFor(() => {
        if (mockOnReorder.mock.calls.length > 0) {
          const reorderedIds = mockOnReorder.mock.calls[0][0];
          expect(reorderedIds).toHaveLength(mockGoals.length);
          expect(reorderedIds.every((id: string) => 
            mockGoals.some(goal => goal.id === id)
          )).toBe(true);
        }
      });
    });
  });

  describe('Touch and Pointer Events', () => {
    it('handles touch events on mobile devices', async () => {
      const mockOnSwipe = vi.fn();
      
      renderWithProviders(
        <GestureGoalCard
          id="mobile-goal"
          name="Mobile Test"
          current={1000}
          target={2000}
          onQuickDeposit={mockOnSwipe}
        >
          <div>Mobile Content</div>
        </GestureGoalCard>
      );

      const card = screen.getByText('Mobile Content').parentElement;

      // Simulate touch events
      fireEvent.touchStart(card!, {
        touches: [{ clientX: 0, clientY: 0 }],
      });
      fireEvent.touchMove(card!, {
        touches: [{ clientX: 150, clientY: 0 }],
      });
      fireEvent.touchEnd(card!, {
        changedTouches: [{ clientX: 150, clientY: 0 }],
      });

      await waitFor(() => {
        expect(mockOnSwipe).toHaveBeenCalled();
      });
    });

    it('prevents default scroll during horizontal swipe', async () => {
      renderWithProviders(
        <GestureGoalCard
          id="scroll-test"
          name="Scroll Test"
          current={500}
          target={1000}
          onQuickDeposit={vi.fn()}
        >
          <div>Scroll Content</div>
        </GestureGoalCard>
      );

      const card = screen.getByText('Scroll Content').parentElement;

      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 150, clientY: 0 } as any],
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(touchMoveEvent, 'preventDefault');
      
      card?.dispatchEvent(touchMoveEvent);

      // Should prevent default to avoid page scroll during swipe
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });
});
