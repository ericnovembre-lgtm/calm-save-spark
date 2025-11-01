import { SaveplusAnimIcon } from '@/components/icons';

interface AuthHeaderProps {
  mode: 'login' | 'signup';
}

export function AuthHeader({ mode }: AuthHeaderProps) {
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <SaveplusAnimIcon name="logo" size={48} decorative />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-muted-foreground">
          {mode === 'signup' 
            ? 'Start your journey to financial freedom' 
            : 'Sign in to continue to your account'}
        </p>
      </div>
    </div>
  );
}
