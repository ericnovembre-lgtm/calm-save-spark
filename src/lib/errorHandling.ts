/**
 * Centralized Error Handling Utilities
 * 
 * Provides consistent error handling patterns across the application
 * with user-friendly messages and actionable next steps.
 */

import { toast } from "sonner";

export interface ErrorContext {
  action: string;
  component?: string;
  metadata?: Record<string, any>;
}

export interface ErrorResponse {
  message: string;
  userMessage: string;
  actions: string[];
  canRetry: boolean;
}

/**
 * Maps error types to user-friendly messages with actionable guidance
 */
export function handleError(error: unknown, context: ErrorContext): ErrorResponse {
  console.error(`[${context.component || 'App'}] Error during ${context.action}:`, error);

  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: 'Network connection error',
      userMessage: 'Unable to connect to the server. Please check your internet connection.',
      actions: [
        'Check your internet connection',
        'Try again in a few moments',
        'Contact support if the issue persists'
      ],
      canRetry: true
    };
  }

  // Supabase auth errors
  if (error && typeof error === 'object' && 'message' in error) {
    const errorMessage = String(error.message).toLowerCase();
    
    if (errorMessage.includes('jwt') || errorMessage.includes('auth')) {
      return {
        message: 'Authentication error',
        userMessage: 'Your session has expired. Please sign in again.',
        actions: [
          'Sign out and sign back in',
          'Clear your browser cache',
          'Try a different browser'
        ],
        canRetry: false
      };
    }

    if (errorMessage.includes('row-level security') || errorMessage.includes('rls')) {
      return {
        message: 'Permission denied',
        userMessage: 'You don\'t have permission to perform this action.',
        actions: [
          'Make sure you\'re signed in',
          'Contact support if you believe this is an error'
        ],
        canRetry: false
      };
    }

    if (errorMessage.includes('unique constraint') || errorMessage.includes('duplicate')) {
      return {
        message: 'Duplicate entry',
        userMessage: 'This record already exists.',
        actions: [
          'Try updating the existing record instead',
          'Use a different name or identifier'
        ],
        canRetry: false
      };
    }

    if (errorMessage.includes('foreign key')) {
      return {
        message: 'Related record not found',
        userMessage: 'The associated record doesn\'t exist.',
        actions: [
          'Make sure the related record exists',
          'Refresh the page and try again'
        ],
        canRetry: true
      };
    }

    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      return {
        message: 'Request timeout',
        userMessage: 'The request took too long to complete.',
        actions: [
          'Try again with a smaller data set',
          'Check your internet connection',
          'Contact support if this keeps happening'
        ],
        canRetry: true
      };
    }
  }

  // Edge function errors
  if (error && typeof error === 'object' && 'status' in error) {
    const status = Number((error as any).status);
    
    switch (status) {
      case 400:
        return {
          message: 'Invalid request',
          userMessage: 'The request contains invalid data.',
          actions: [
            'Check that all required fields are filled',
            'Verify the data format is correct'
          ],
          canRetry: false
        };
      
      case 401:
        return {
          message: 'Unauthorized',
          userMessage: 'You need to be signed in to perform this action.',
          actions: [
            'Sign in to your account',
            'Check that your session hasn\'t expired'
          ],
          canRetry: false
        };
      
      case 403:
        return {
          message: 'Forbidden',
          userMessage: 'You don\'t have permission to access this resource.',
          actions: [
            'Contact support for access',
            'Verify your account permissions'
          ],
          canRetry: false
        };
      
      case 404:
        return {
          message: 'Not found',
          userMessage: 'The requested resource doesn\'t exist.',
          actions: [
            'Check that the item hasn\'t been deleted',
            'Refresh the page and try again'
          ],
          canRetry: false
        };
      
      case 429:
        return {
          message: 'Rate limit exceeded',
          userMessage: 'Too many requests. Please wait a moment and try again.',
          actions: [
            'Wait 1-2 minutes before trying again',
            'Contact support if you need higher limits'
          ],
          canRetry: true
        };
      
      case 500:
      case 502:
      case 503:
        return {
          message: 'Server error',
          userMessage: 'Something went wrong on our end. We\'re working to fix it.',
          actions: [
            'Try again in a few minutes',
            'Contact support if the problem persists',
            'Check our status page for updates'
          ],
          canRetry: true
        };
    }
  }

  // Default error response
  return {
    message: 'Unexpected error',
    userMessage: 'An unexpected error occurred. Please try again.',
    actions: [
      'Refresh the page',
      'Try again',
      'Contact support if the issue persists'
    ],
    canRetry: true
  };
}

/**
 * Shows an error toast with actionable guidance
 */
export function showErrorToast(error: unknown, context: ErrorContext) {
  const errorResponse = handleError(error, context);
  
  toast.error(errorResponse.userMessage, {
    description: errorResponse.actions[0], // Show primary action in description
    duration: 5000,
    action: errorResponse.canRetry ? {
      label: 'Retry',
      onClick: () => {
        // The component calling this should handle retry logic
        toast.info('Please try your action again');
      }
    } : undefined
  });
}

/**
 * Generic async error handler wrapper
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: ErrorContext
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    showErrorToast(error, context);
    return null;
  }
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    context: ErrorContext;
  }
): Promise<T> {
  const { maxRetries = 3, initialDelay = 1000, maxDelay = 10000, context } = options;
  
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        showErrorToast(error, context);
        throw error;
      }
      
      const errorResponse = handleError(error, context);
      if (!errorResponse.canRetry) {
        showErrorToast(error, context);
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
      
      if (attempt < maxRetries) {
        toast.info(`Retrying in ${delay / 1000} seconds... (Attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Validates required environment variables
 */
export function validateEnvVars(required: string[]): void {
  const missing = required.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    const error = new Error(`Missing required environment variables: ${missing.join(', ')}`);
    console.error(error);
    toast.error('Configuration error', {
      description: 'The application is not properly configured. Please contact support.'
    });
    throw error;
  }
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return fallback;
  }
}

/**
 * Log analytics event for errors (for monitoring)
 */
export function logErrorEvent(error: unknown, context: ErrorContext) {
  // This would integrate with your analytics service
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'exception', {
      description: handleError(error, context).message,
      fatal: false,
      ...context.metadata
    });
  }
}
