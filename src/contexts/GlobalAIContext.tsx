import { createContext, useContext, useState, ReactNode } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PageContext {
  route: string;
  title: string;
  data?: any;
}

interface GlobalAIContextType {
  isOpen: boolean;
  messages: Message[];
  pageContext: PageContext | null;
  isVoiceMode: boolean;
  openAI: () => void;
  closeAI: () => void;
  toggleAI: () => void;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setPageContext: (context: PageContext) => void;
  setVoiceMode: (enabled: boolean) => void;
  clearMessages: () => void;
}

const GlobalAIContext = createContext<GlobalAIContextType | undefined>(undefined);

export function GlobalAIProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pageContext, setPageContextState] = useState<PageContext | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const openAI = () => setIsOpen(true);
  const closeAI = () => setIsOpen(false);
  const toggleAI = () => setIsOpen(!isOpen);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }]);
  };

  const setPageContext = (context: PageContext) => {
    setPageContextState(context);
  };

  const setVoiceMode = (enabled: boolean) => {
    setIsVoiceMode(enabled);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <GlobalAIContext.Provider
      value={{
        isOpen,
        messages,
        pageContext,
        isVoiceMode,
        openAI,
        closeAI,
        toggleAI,
        addMessage,
        setPageContext,
        setVoiceMode,
        clearMessages,
      }}
    >
      {children}
    </GlobalAIContext.Provider>
  );
}

export function useGlobalAI() {
  const context = useContext(GlobalAIContext);
  if (!context) {
    throw new Error('useGlobalAI must be used within GlobalAIProvider');
  }
  return context;
}
