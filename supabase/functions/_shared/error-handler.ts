/**
 * Centralized error handling for edge functions
 * Maps internal errors to safe client messages while preserving detailed server-side logs
 */

export class ErrorHandlerOptions {
  corsHeaders: Record<string, string>;
  functionName: string;
  userId?: string;
  ipAddress?: string;

  constructor(corsHeaders: Record<string, string>, functionName: string, userId?: string, ipAddress?: string) {
    this.corsHeaders = corsHeaders;
    this.functionName = functionName;
    this.userId = userId;
    this.ipAddress = ipAddress;
  }
}

export interface SafeErrorResponse {
  error: string;
  code?: string;
}

/**
 * Maps known error types to safe client messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  'Not authenticated': 'Authentication required. Please log in.',
  'Unauthorized': 'You do not have permission to perform this action.',
  'Organization not found or unauthorized': 'Organization not found or access denied.',
  'Rule not found or inactive': 'Automation rule not found or is inactive.',
  'Rate limit exceeded': 'Too many requests. Please try again later.',
  'Validation error': 'Invalid input. Please check your request.',
  'Unknown rule type': 'Invalid automation rule configuration.',
};

/**
 * Generic fallback messages by status code
 */
const FALLBACK_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Authentication required.',
  403: 'Access denied.',
  404: 'Resource not found.',
  429: 'Too many requests. Please try again later.',
  500: 'An unexpected error occurred. Please try again.',
};

/**
 * Determines if an error should be logged as critical
 */
function isCriticalError(error: any): boolean {
  return (
    error?.code === 'PGRST301' || // Database connection error
    error?.code === 'PGRST116' || // Database query timeout
    error?.message?.includes('FATAL') ||
    error?.message?.includes('PANIC')
  );
}

/**
 * Sanitizes error message by removing sensitive information
 */
function sanitizeErrorMessage(message: string): string {
  // Remove potential SQL injection attempts from logs
  return message
    .replace(/SELECT.*FROM/gi, '[SQL_QUERY]')
    .replace(/INSERT.*INTO/gi, '[SQL_QUERY]')
    .replace(/UPDATE.*SET/gi, '[SQL_QUERY]')
    .replace(/DELETE.*FROM/gi, '[SQL_QUERY]')
    .replace(/uuid:[a-f0-9-]+/gi, '[UUID]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
}

/**
 * Handles errors safely for edge functions
 * @returns Response object with safe error message
 */
export function handleError(
  error: any,
  options: ErrorHandlerOptions,
  status: number = 400
): Response {
  const { corsHeaders, functionName, userId } = options;
  
  // Generate error ID for tracking
  const errorId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  // Determine error message and status
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const isCritical = isCriticalError(error);
  
  // Server-side logging (detailed, for debugging)
  const logLevel = isCritical ? 'CRITICAL' : 'ERROR';
  console.error(`[${logLevel}][${functionName}]`, {
    error_id: errorId,
    timestamp,
    user_id: userId ? '[REDACTED]' : 'unauthenticated',
    error_type: error?.constructor?.name || 'Unknown',
    error_code: error?.code,
    message: sanitizeErrorMessage(errorMessage),
    stack: error?.stack?.split('\n').slice(0, 3).join('\n'), // First 3 lines only
  });
  
  // Determine safe client message
  let clientMessage = ERROR_MESSAGES[errorMessage] || FALLBACK_MESSAGES[status] || 'An error occurred.';
  
  // For rate limiting errors, include retry-after hint
  if (errorMessage.includes('Rate limit')) {
    status = 429;
    clientMessage = 'Too many requests. Please wait a moment before trying again.';
  }
  
  // For validation errors, keep the message if it's from zod
  if ((error as any)?.name === 'ZodError') {
    status = 400;
    clientMessage = 'Invalid input data.';
  }
  
  const response: SafeErrorResponse = {
    error: clientMessage,
    code: errorId, // Include error ID for support tickets
  };
  
  return new Response(
    JSON.stringify(response),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Handles validation errors from zod
 */
export function handleValidationError(
  error: any,
  options: ErrorHandlerOptions
): Response {
  console.error(`[VALIDATION_ERROR][${options.functionName}]`, {
    timestamp: new Date().toISOString(),
    issues: error?.issues || error?.errors || [],
  });
  
  return new Response(
    JSON.stringify({
      error: 'Invalid input data.',
      code: crypto.randomUUID(),
      details: error?.issues?.map((issue: any) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })) || [],
    }),
    {
      status: 400,
      headers: { ...options.corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
