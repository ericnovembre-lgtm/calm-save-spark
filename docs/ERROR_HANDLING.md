# $ave+ Error Handling Guide

**Last Updated:** November 15, 2025  
**Version:** 1.0.0

---

## Overview

This guide explains the centralized error handling system implemented across $ave+ to provide consistent, user-friendly error messages with actionable next steps.

---

## Error Handling Utilities

### Location
`src/lib/errorHandling.ts`

### Core Functions

#### 1. `handleError(error, context)`
Maps technical errors to user-friendly messages with actionable guidance.

```typescript
import { handleError } from '@/lib/errorHandling';

const errorResponse = handleError(error, {
  action: 'loading portfolio',
  component: 'InvestmentManager'
});

console.log(errorResponse);
// {
//   message: 'Network connection error',
//   userMessage: 'Unable to connect to the server.',
//   actions: ['Check your internet connection', ...],
//   canRetry: true
// }
```

#### 2. `showErrorToast(error, context)`
Automatically shows user-friendly error toast with primary action.

```typescript
import { showErrorToast } from '@/lib/errorHandling';

try {
  await someOperation();
} catch (error) {
  showErrorToast(error, {
    action: 'saving goal',
    component: 'GoalForm'
  });
}
```

#### 3. `withErrorHandling(fn, context)`
Wraps async functions with automatic error handling.

```typescript
import { withErrorHandling } from '@/lib/errorHandling';

const data = await withErrorHandling(
  async () => {
    const { data, error } = await supabase
      .from('goals')
      .select('*');
    if (error) throw error;
    return data;
  },
  {
    action: 'loading goals',
    component: 'Dashboard'
  }
);
// Returns data on success, null on error (toast shown automatically)
```

#### 4. `retryWithBackoff(fn, options)`
Implements exponential backoff retry logic.

```typescript
import { retryWithBackoff } from '@/lib/errorHandling';

const data = await retryWithBackoff(
  () => supabase.functions.invoke('investment-manager'),
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    context: {
      action: 'syncing portfolio',
      component: 'InvestmentManager'
    }
  }
);
```

---

## Custom Hooks

### `useEdgeFunctionCall`

Simplifies edge function calls with built-in error handling and retry logic.

```typescript
import { useEdgeFunctionCall } from '@/hooks/useEdgeFunctionCall';

function MyComponent() {
  const { invoke, data, loading, error } = useEdgeFunctionCall('investment-manager');

  const handleSync = async () => {
    await invoke(
      {}, // body
      {
        retries: 2,
        showSuccessToast: true,
        successMessage: 'Portfolio synced successfully!'
      }
    );
  };

  return (
    <Button onClick={handleSync} disabled={loading}>
      {loading ? 'Syncing...' : 'Sync Portfolio'}
    </Button>
  );
}
```

### `usePollingEdgeFunction`

For long-running operations that require polling.

```typescript
import { usePollingEdgeFunction } from '@/hooks/useEdgeFunctionCall';

function SimulationComponent() {
  const { start, stop, data, loading, attempts } = usePollingEdgeFunction('digital-twin-simulate');

  const runSimulation = () => {
    start(
      { parameters: { yearsToProject: 10 } },
      {
        interval: 2000, // Poll every 2 seconds
        maxAttempts: 30, // Max 60 seconds
        onProgress: (attempts) => {
          console.log(`Attempt ${attempts}/30`);
        }
      }
    );
  };

  return (
    <div>
      <Button onClick={runSimulation} disabled={loading}>
        Run Simulation
      </Button>
      {loading && <p>Processing... (Attempt {attempts})</p>}
      {data && <SimulationResults data={data} />}
    </div>
  );
}
```

---

## Error Types & Responses

### Network Errors
**Detected:** `TypeError` with 'fetch'  
**User Message:** "Unable to connect to the server. Please check your internet connection."  
**Actions:**
- Check your internet connection
- Try again in a few moments
- Contact support if the issue persists

**Can Retry:** ✅ Yes

---

### Authentication Errors
**Detected:** Message contains 'jwt' or 'auth'  
**User Message:** "Your session has expired. Please sign in again."  
**Actions:**
- Sign out and sign back in
- Clear your browser cache
- Try a different browser

**Can Retry:** ❌ No (requires re-authentication)

---

### Permission Errors (RLS)
**Detected:** Message contains 'row-level security' or 'rls'  
**User Message:** "You don't have permission to perform this action."  
**Actions:**
- Make sure you're signed in
- Contact support if you believe this is an error

**Can Retry:** ❌ No

---

### Duplicate Entry Errors
**Detected:** Message contains 'unique constraint' or 'duplicate'  
**User Message:** "This record already exists."  
**Actions:**
- Try updating the existing record instead
- Use a different name or identifier

**Can Retry:** ❌ No

---

### HTTP Status Codes

#### 400 Bad Request
**User Message:** "The request contains invalid data."  
**Actions:**
- Check that all required fields are filled
- Verify the data format is correct

**Can Retry:** ❌ No

---

#### 401 Unauthorized
**User Message:** "You need to be signed in to perform this action."  
**Actions:**
- Sign in to your account
- Check that your session hasn't expired

**Can Retry:** ❌ No

---

#### 403 Forbidden
**User Message:** "You don't have permission to access this resource."  
**Actions:**
- Contact support for access
- Verify your account permissions

**Can Retry:** ❌ No

---

#### 404 Not Found
**User Message:** "The requested resource doesn't exist."  
**Actions:**
- Check that the item hasn't been deleted
- Refresh the page and try again

**Can Retry:** ❌ No

---

#### 429 Too Many Requests
**User Message:** "Too many requests. Please wait a moment and try again."  
**Actions:**
- Wait 1-2 minutes before trying again
- Contact support if you need higher limits

**Can Retry:** ✅ Yes (with delay)

---

#### 500/502/503 Server Errors
**User Message:** "Something went wrong on our end. We're working to fix it."  
**Actions:**
- Try again in a few minutes
- Contact support if the problem persists
- Check our status page for updates

**Can Retry:** ✅ Yes

---

## Usage Patterns

### 1. React Query with Error Handling

```typescript
import { useQuery } from '@tanstack/react-query';
import { withErrorHandling } from '@/lib/errorHandling';

const { data, isLoading } = useQuery({
  queryKey: ['goals', userId],
  queryFn: () => withErrorHandling(
    async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    },
    {
      action: 'loading goals',
      component: 'Dashboard'
    }
  ),
  retry: false, // Handled by withErrorHandling
});
```

### 2. Mutation with Error Handling

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showErrorToast } from '@/lib/errorHandling';
import { toast } from 'sonner';

const mutation = useMutation({
  mutationFn: async (newGoal) => {
    const { data, error } = await supabase
      .from('goals')
      .insert(newGoal)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['goals']);
    toast.success('Goal created successfully!');
  },
  onError: (error) => {
    showErrorToast(error, {
      action: 'creating goal',
      component: 'GoalForm'
    });
  }
});
```

### 3. Edge Function Call with Retry

```typescript
import { retryWithBackoff } from '@/lib/errorHandling';

const syncPortfolio = async () => {
  const result = await retryWithBackoff(
    () => supabase.functions.invoke('investment-manager', {
      body: { action: 'sync' }
    }),
    {
      maxRetries: 3,
      context: {
        action: 'syncing portfolio',
        component: 'InvestmentManager',
        metadata: { timestamp: Date.now() }
      }
    }
  );

  return result;
};
```

### 4. Form Submission with Validation

```typescript
import { handleError } from '@/lib/errorHandling';

const handleSubmit = async (formData) => {
  try {
    // Validate locally first
    const validated = schema.parse(formData);
    
    // Submit to database
    const { data, error } = await supabase
      .from('goals')
      .insert(validated)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Goal created!');
    navigate('/goals');
  } catch (error) {
    const errorResponse = handleError(error, {
      action: 'creating goal',
      component: 'GoalForm'
    });
    
    // Show specific error in form
    setFormError(errorResponse.userMessage);
    
    // Also show toast
    showErrorToast(error, {
      action: 'creating goal',
      component: 'GoalForm'
    });
  }
};
```

---

## Best Practices

### DO ✅

1. **Always provide context**
   ```typescript
   showErrorToast(error, {
     action: 'loading transactions', // What operation failed
     component: 'TransactionList', // Where it failed
     metadata: { userId, filters } // Additional context
   });
   ```

2. **Use descriptive action names**
   ```typescript
   // ✅ Good
   { action: 'creating savings goal' }
   { action: 'updating profile picture' }
   
   // ❌ Bad
   { action: 'operation' }
   { action: 'submit' }
   ```

3. **Let withErrorHandling handle errors in queries**
   ```typescript
   const { data } = useQuery({
     queryKey: ['data'],
     queryFn: () => withErrorHandling(
       async () => { /* ... */ },
       { action: 'loading data', component: 'Page' }
     ),
     retry: false // Disable React Query retry
   });
   ```

4. **Use retryWithBackoff for critical operations**
   ```typescript
   await retryWithBackoff(
     () => submitPayment(),
     { maxRetries: 3, context: { action: 'processing payment' } }
   );
   ```

5. **Provide success feedback**
   ```typescript
   await invoke({}, {
     showSuccessToast: true,
     successMessage: 'Portfolio synced successfully!'
   });
   ```

### DON'T ❌

1. **Don't swallow errors silently**
   ```typescript
   // ❌ Bad
   try {
     await operation();
   } catch (error) {
     // Silent failure
   }
   
   // ✅ Good
   try {
     await operation();
   } catch (error) {
     showErrorToast(error, { action: 'operation', component: 'Page' });
   }
   ```

2. **Don't show generic error messages**
   ```typescript
   // ❌ Bad
   toast.error('An error occurred');
   
   // ✅ Good
   showErrorToast(error, { action: 'saving data', component: 'Form' });
   ```

3. **Don't log sensitive information**
   ```typescript
   // ❌ Bad
   console.error('Error:', user.email, user.ssn);
   
   // ✅ Good
   console.error('Error loading user data:', error.message);
   ```

4. **Don't retry non-retryable errors**
   ```typescript
   // Error handling utility automatically determines retry eligibility
   const errorResponse = handleError(error, context);
   if (errorResponse.canRetry) {
     // Only retry if it makes sense
   }
   ```

---

## Testing Error Handling

### Simulate Network Errors
```typescript
// In Chrome DevTools:
// 1. Open Network tab
// 2. Set throttling to "Offline"
// 3. Trigger operation
// 4. Verify friendly error message appears
```

### Simulate Authentication Errors
```typescript
// Clear auth token
await supabase.auth.signOut();

// Try protected operation
const { data, error } = await supabase.from('goals').select('*');
// Should show: "Your session has expired. Please sign in again."
```

### Test Retry Logic
```typescript
// Add temporary error to edge function
throw new Error('Simulated error');

// Call with retry
await retryWithBackoff(
  () => supabase.functions.invoke('test-function'),
  { maxRetries: 3, context: { action: 'test' } }
);

// Should see 3 retry attempts with backoff
```

---

## Monitoring & Analytics

### Error Tracking
```typescript
import { logErrorEvent } from '@/lib/errorHandling';

// Automatically logs to analytics
logErrorEvent(error, {
  action: 'critical operation',
  component: 'ImportantPage',
  metadata: { userId, timestamp }
});
```

### Error Dashboard
Track error rates in PostHog/Sentry:
- Error type distribution
- Most common errors
- Error rate by component
- User impact (% of sessions with errors)

---

## Contact

For questions about error handling:
📧 engineering@saveplus.app
