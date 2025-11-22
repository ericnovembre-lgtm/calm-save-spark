import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useOptimisticAction } from './useOptimisticAction';

/**
 * Page-specific optimistic UI hooks for instant feedback
 */

// Goals optimistic actions
export function useGoalsOptimistic() {
  const { executeAction, isPending } = useOptimisticAction();

  const createGoalOptimistic = useCallback(async (
    goalData: any,
    createAction: () => Promise<any>
  ) => {
    return executeAction(
      createAction,
      {
        successMessage: '🎯 Goal created!',
        errorMessage: 'Failed to create goal',
      }
    );
  }, [executeAction]);

  const updateGoalProgressOptimistic = useCallback(async (
    goalId: string,
    newProgress: number,
    updateAction: () => Promise<any>
  ) => {
    return executeAction(
      updateAction,
      {
        successMessage: '✨ Progress updated!',
        errorMessage: 'Failed to update progress',
      }
    );
  }, [executeAction]);

  return {
    createGoalOptimistic,
    updateGoalProgressOptimistic,
    isPending,
  };
}

// Budget optimistic actions
export function useBudgetOptimistic() {
  const { executeAction, isPending } = useOptimisticAction();

  const createBudgetOptimistic = useCallback(async (
    budgetData: any,
    createAction: () => Promise<any>
  ) => {
    return executeAction(
      createAction,
      {
        successMessage: '',
        errorMessage: 'Failed to create budget',
      }
    );
  }, [executeAction]);

  const updateBudgetOptimistic = useCallback(async (
    budgetId: string,
    updates: any,
    updateAction: () => Promise<any>
  ) => {
    return executeAction(
      updateAction,
      {
        successMessage: '',
        errorMessage: 'Failed to update budget',
      }
    );
  }, [executeAction]);

  const deleteBudgetOptimistic = useCallback(async (
    budgetId: string,
    deleteAction: () => Promise<any>
  ) => {
    return executeAction(
      deleteAction,
      {
        successMessage: '',
        errorMessage: 'Failed to delete budget',
      }
    );
  }, [executeAction]);

  const createCategoryOptimistic = useCallback(async (
    categoryData: any,
    createAction: () => Promise<any>
  ) => {
    return executeAction(
      createAction,
      {
        successMessage: '📊 Category added!',
        errorMessage: 'Failed to add category',
      }
    );
  }, [executeAction]);

  return {
    createBudgetOptimistic,
    updateBudgetOptimistic,
    deleteBudgetOptimistic,
    createCategoryOptimistic,
    isPending,
  };
}

// Transactions optimistic actions
export function useTransactionsOptimistic() {
  const { executeAction, isPending } = useOptimisticAction();

  const addTransactionOptimistic = useCallback(async (
    transactionData: any,
    createAction: () => Promise<any>
  ) => {
    return executeAction(
      createAction,
      {
        successMessage: '💸 Transaction added!',
        errorMessage: 'Failed to add transaction',
      }
    );
  }, [executeAction]);

  const categorizeTransactionOptimistic = useCallback(async (
    transactionId: string,
    category: string,
    updateAction: () => Promise<any>
  ) => {
    return executeAction(
      updateAction,
      {
        successMessage: '🏷️ Categorized!',
        errorMessage: 'Failed to categorize',
      }
    );
  }, [executeAction]);

  const enrichTransactionOptimistic = useCallback(async (
    transactionId: string,
    enrichAction: () => Promise<any>
  ) => {
    return executeAction(
      enrichAction,
      {
        successMessage: '✨ Transaction enriched!',
        errorMessage: 'Failed to enrich transaction',
      }
    );
  }, [executeAction]);

  return {
    addTransactionOptimistic,
    categorizeTransactionOptimistic,
    enrichTransactionOptimistic,
    isPending,
  };
}

// Pots optimistic actions
export function usePotsOptimistic() {
  const { executeAction, isPending } = useOptimisticAction();

  const createPotOptimistic = useCallback(async (
    potData: any,
    createAction: () => Promise<any>
  ) => {
    return executeAction(
      createAction,
      {
        successMessage: '🏺 Pot created!',
        errorMessage: 'Failed to create pot',
      }
    );
  }, [executeAction]);

  const addToPotOptimistic = useCallback(async (
    potId: string,
    amount: number,
    addAction: () => Promise<any>
  ) => {
    return executeAction(
      addAction,
      {
        successMessage: `💰 Added $${amount.toFixed(2)}!`,
        errorMessage: 'Failed to add funds',
      }
    );
  }, [executeAction]);

  return {
    createPotOptimistic,
    addToPotOptimistic,
    isPending,
  };
}

// Settings optimistic actions
export function useSettingsOptimistic() {
  const { executeAction, isPending } = useOptimisticAction();

  const updateSettingOptimistic = useCallback(async (
    setting: string,
    value: any,
    updateAction: () => Promise<any>
  ) => {
    return executeAction(
      updateAction,
      {
        successMessage: '⚙️ Setting updated!',
        errorMessage: 'Failed to update setting',
      }
    );
  }, [executeAction]);

  return {
    updateSettingOptimistic,
    isPending,
  };
}

// Generic optimistic action for any page
export function useGenericOptimistic(successMessage = 'Action completed!', errorMessage = 'Action failed') {
  const { executeAction, isPending } = useOptimisticAction();

  const executeOptimistic = useCallback(async (
    action: () => Promise<any>
  ) => {
    return executeAction(action, { successMessage, errorMessage });
  }, [executeAction, successMessage, errorMessage]);

  return {
    executeOptimistic,
    isPending,
  };
}
