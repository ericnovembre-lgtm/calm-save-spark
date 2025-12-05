import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import type { 
  CoPilotContextState, 
  CoPilotMessage, 
  PulseNotification, 
  ContextualGreeting,
  PulseState 
} from '@/types/copilot';
import { getRouteContext, getContextualGreeting } from '@/lib/route-context';

interface CoPilotContextValue {
  // State
  contextState: CoPilotContextState;
  messages: CoPilotMessage[];
  isOpen: boolean;
  isPanelExpanded: boolean;
  pulseNotification: PulseNotification | null;
  greeting: ContextualGreeting;
  
  // Actions
  openCoPilot: () => void;
  closeCoPilot: () => void;
  toggleCoPilot: () => void;
  expandPanel: () => void;
  collapsePanel: () => void;
  addMessage: (message: Omit<CoPilotMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setPulse: (state: PulseState, message: string, actionId?: string, duration?: number) => void;
  clearPulse: () => void;
  setActiveElement: (elementId: string | undefined) => void;
  setSelectedData: (dataId: string | undefined) => void;
}

const CoPilotContext = createContext<CoPilotContextValue | undefined>(undefined);

export function CoPilotProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  
  const [contextState, setContextState] = useState<CoPilotContextState>({
    currentRoute: location.pathname,
    pageTitle: '',
    sessionDuration: 0,
    lastInteractionTime: Date.now(),
    userMood: 'neutral',
  });
  
  const [messages, setMessages] = useState<CoPilotMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [pulseNotification, setPulseNotification] = useState<PulseNotification | null>(null);
  const [greeting, setGreeting] = useState<ContextualGreeting>({ text: '', suggestions: [] });
  
  // Update context when route changes
  useEffect(() => {
    const routeContext = getRouteContext(location.pathname);
    const newGreeting = getContextualGreeting(location.pathname);
    
    setContextState(prev => ({
      ...prev,
      currentRoute: location.pathname,
      pageTitle: routeContext.title,
    }));
    
    setGreeting(newGreeting);
  }, [location.pathname]);
  
  // Track session duration
  useEffect(() => {
    const interval = setInterval(() => {
      setContextState(prev => ({
        ...prev,
        sessionDuration: prev.sessionDuration + 1,
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Track user interaction
  useEffect(() => {
    const handleInteraction = () => {
      setContextState(prev => ({
        ...prev,
        lastInteractionTime: Date.now(),
      }));
    };
    
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('scroll', handleInteraction);
    
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
    };
  }, []);
  
  const openCoPilot = useCallback(() => setIsOpen(true), []);
  const closeCoPilot = useCallback(() => setIsOpen(false), []);
  const toggleCoPilot = useCallback(() => setIsOpen(prev => !prev), []);
  const expandPanel = useCallback(() => setIsPanelExpanded(true), []);
  const collapsePanel = useCallback(() => setIsPanelExpanded(false), []);
  
  const addMessage = useCallback((message: Omit<CoPilotMessage, 'id' | 'timestamp'>) => {
    const newMessage: CoPilotMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);
  
  const clearMessages = useCallback(() => setMessages([]), []);
  
  const setPulse = useCallback((
    state: PulseState, 
    message: string, 
    actionId?: string, 
    duration?: number
  ) => {
    const notification: PulseNotification = {
      state,
      message,
      actionId,
      expiresAt: duration ? Date.now() + duration : undefined,
    };
    setPulseNotification(notification);
    
    if (duration) {
      setTimeout(() => {
        setPulseNotification(prev => 
          prev?.expiresAt === notification.expiresAt ? null : prev
        );
      }, duration);
    }
  }, []);
  
  const clearPulse = useCallback(() => setPulseNotification(null), []);
  
  const setActiveElement = useCallback((elementId: string | undefined) => {
    setContextState(prev => ({ ...prev, activeElementId: elementId }));
  }, []);
  
  const setSelectedData = useCallback((dataId: string | undefined) => {
    setContextState(prev => ({ ...prev, selectedDataId: dataId }));
  }, []);
  
  return (
    <CoPilotContext.Provider
      value={{
        contextState,
        messages,
        isOpen,
        isPanelExpanded,
        pulseNotification,
        greeting,
        openCoPilot,
        closeCoPilot,
        toggleCoPilot,
        expandPanel,
        collapsePanel,
        addMessage,
        clearMessages,
        setPulse,
        clearPulse,
        setActiveElement,
        setSelectedData,
      }}
    >
      {children}
    </CoPilotContext.Provider>
  );
}

export function useCoPilot() {
  const context = useContext(CoPilotContext);
  if (!context) {
    throw new Error('useCoPilot must be used within CoPilotProvider');
  }
  return context;
}
