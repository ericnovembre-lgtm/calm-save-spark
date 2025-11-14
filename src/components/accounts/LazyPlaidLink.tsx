/**
 * Lazy-loaded Plaid Link wrapper
 * Only loads the heavy react-plaid-link library when user initiates connection
 */

import { lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const PlaidLink = lazy(() => import('./PlaidLink').then(module => ({
  default: module.PlaidLink
})));

interface LazyPlaidLinkProps {
  onSuccess?: () => void;
}

export function LazyPlaidLink({ onSuccess }: LazyPlaidLinkProps) {
  return (
    <Suspense fallback={
      <Button disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading Connection...
      </Button>
    }>
      <PlaidLink onSuccess={onSuccess} />
    </Suspense>
  );
}
