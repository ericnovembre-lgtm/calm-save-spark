import { Link } from 'react-router-dom';

interface AuthFooterProps {
  mode: 'login' | 'signup';
  onForgotPassword: () => void;
}

export function AuthFooter({ mode, onForgotPassword }: AuthFooterProps) {
  return (
    <div className="space-y-4">
      {mode === 'login' && (
        <div className="text-center">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-primary hover:underline"
          >
            Forgot your password?
          </button>
        </div>
      )}

      <div className="text-center text-xs text-muted-foreground">
        {mode === 'signup' ? (
          <p>
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        ) : (
          <p>
            <Link to="/help" className="text-primary hover:underline">
              Need help?
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
