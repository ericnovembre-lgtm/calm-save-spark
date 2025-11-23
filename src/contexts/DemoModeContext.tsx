import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface DemoModeContextType {
  isDemoMode: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export const DemoModeProvider = ({ children }: { children: ReactNode }) => {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    return localStorage.getItem('demo_mode') === 'true';
  });

  useEffect(() => {
    console.log('[DemoModeProvider] Demo mode state:', isDemoMode);
  }, [isDemoMode]);

  const enableDemoMode = () => {
    console.log('[DemoModeProvider] Enabling demo mode');
    setIsDemoMode(true);
    localStorage.setItem('demo_mode', 'true');
  };

  const disableDemoMode = () => {
    console.log('[DemoModeProvider] Disabling demo mode');
    setIsDemoMode(false);
    localStorage.removeItem('demo_mode');
  };

  return (
    <DemoModeContext.Provider value={{ isDemoMode, enableDemoMode, disableDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
};

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within DemoModeProvider');
  }
  return context;
};
