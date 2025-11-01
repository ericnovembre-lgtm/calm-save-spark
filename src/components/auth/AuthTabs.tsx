import { Button } from '@/components/ui/button';

interface AuthTabsProps {
  mode: 'login' | 'signup';
  onModeChange: (mode: 'login' | 'signup') => void;
}

export function AuthTabs({ mode, onModeChange }: AuthTabsProps) {
  return (
    <div className="flex gap-2 p-1 bg-accent rounded-lg" role="tablist">
      <Button
        type="button"
        variant={mode === 'login' ? 'default' : 'ghost'}
        className="flex-1"
        onClick={() => onModeChange('login')}
        role="tab"
        aria-selected={mode === 'login'}
        aria-controls="auth-panel"
      >
        Log in
      </Button>
      <Button
        type="button"
        variant={mode === 'signup' ? 'default' : 'ghost'}
        className="flex-1"
        onClick={() => onModeChange('signup')}
        role="tab"
        aria-selected={mode === 'signup'}
        aria-controls="auth-panel"
      >
        Sign up
      </Button>
    </div>
  );
}
