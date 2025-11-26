import { createContext, useContext, useState, useEffect } from 'react';

interface VoiceContextType {
  isVoiceEnabled: boolean;
  toggleVoice: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
    const stored = localStorage.getItem('voice-enabled');
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    localStorage.setItem('voice-enabled', JSON.stringify(isVoiceEnabled));
  }, [isVoiceEnabled]);

  const toggleVoice = () => {
    setIsVoiceEnabled((prev: boolean) => !prev);
  };

  return (
    <VoiceContext.Provider value={{ isVoiceEnabled, toggleVoice }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within VoiceProvider');
  }
  return context;
}
