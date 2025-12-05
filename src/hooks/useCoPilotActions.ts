import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoPilot } from '@/contexts/CoPilotContext';
import { createActionRegistry, findMatchingAction } from '@/lib/action-registry';
import { useTheme } from '@/lib/theme';
import type { CoPilotAction } from '@/types/copilot';

interface UseCoPilotActionsReturn {
  actions: CoPilotAction[];
  executeAction: (actionId: string, params?: Record<string, unknown>) => Promise<boolean>;
  parseAndExecute: (input: string) => Promise<{ executed: boolean; action?: CoPilotAction }>;
  getAction: (actionId: string) => CoPilotAction | undefined;
}

// Modal state management (will be connected to actual modal system)
const modalCallbacks = new Map<string, () => void>();

export function registerModal(modalId: string, openFn: () => void) {
  modalCallbacks.set(modalId, openFn);
}

export function unregisterModal(modalId: string) {
  modalCallbacks.delete(modalId);
}

// Spotlight state management
const spotlightCallbacks = new Map<string, (elementId: string) => void>();

export function registerSpotlight(callback: (elementId: string) => void) {
  spotlightCallbacks.set('default', callback);
}

export function unregisterSpotlight() {
  spotlightCallbacks.delete('default');
}

export function useCoPilotActions(): UseCoPilotActionsReturn {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { addMessage } = useCoPilot();
  
  // Create action registry with dependencies
  const actions = useMemo(() => {
    return createActionRegistry({
      navigate,
      setTheme,
      openModal: (modalId: string) => {
        const callback = modalCallbacks.get(modalId);
        if (callback) {
          callback();
        } else {
          console.warn(`Modal ${modalId} not registered`);
        }
      },
      spotlight: (elementId: string) => {
        const callback = spotlightCallbacks.get('default');
        if (callback) {
          callback(elementId);
        }
      },
    });
  }, [navigate, setTheme]);
  
  // Get action by ID
  const getAction = useCallback((actionId: string): CoPilotAction | undefined => {
    return actions.find(action => action.id === actionId);
  }, [actions]);
  
  // Execute action by ID
  const executeAction = useCallback(async (
    actionId: string, 
    params?: Record<string, unknown>
  ): Promise<boolean> => {
    const action = getAction(actionId);
    
    if (!action) {
      console.warn(`Action ${actionId} not found`);
      return false;
    }
    
    try {
      await action.execute(params);
      return true;
    } catch (error) {
      console.error(`Error executing action ${actionId}:`, error);
      return false;
    }
  }, [getAction]);
  
  // Parse natural language input and execute matching action
  const parseAndExecute = useCallback(async (
    input: string
  ): Promise<{ executed: boolean; action?: CoPilotAction }> => {
    const matchingAction = findMatchingAction(input, actions);
    
    if (matchingAction) {
      try {
        await matchingAction.execute();
        
        // Add confirmation message
        addMessage({
          role: 'assistant',
          content: `Done! I've executed: ${matchingAction.description}`,
        });
        
        return { executed: true, action: matchingAction };
      } catch (error) {
        console.error('Error executing action:', error);
        
        addMessage({
          role: 'assistant',
          content: `Sorry, I couldn't complete that action. Please try again.`,
        });
        
        return { executed: false, action: matchingAction };
      }
    }
    
    return { executed: false };
  }, [actions, addMessage]);
  
  return {
    actions,
    executeAction,
    parseAndExecute,
    getAction,
  };
}
