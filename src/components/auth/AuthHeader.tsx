import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion } from 'framer-motion';

interface AuthHeaderProps {
  mode: 'login' | 'signup';
}

export function AuthHeader({ mode }: AuthHeaderProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <motion.div
          className="text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          $ave+
        </motion.div>
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
