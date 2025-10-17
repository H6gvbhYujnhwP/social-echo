/**
 * Retry and Timeout Utilities
 * 
 * Handles timeouts, retries, and fallback logic for AI generation.
 */

export interface RetryConfig {
  maxRetries: number
  timeoutMs: number
  backoffMultiplier: number
  fallbackModel?: string
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  timeoutMs: 45000, // 45 seconds
  backoffMultiplier: 2,
  fallbackModel: 'gpt-4o-mini'
}

export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: Error
  attempts: number
  fallbackUsed: boolean
  totalDurationMs: number
}

/**
 * Execute a function with timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  let timeoutId: NodeJS.Timeout
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`TIMEOUT: ${errorMessage} (${timeoutMs}ms)`))
    }, timeoutMs)
  })
  
  try {
    const result = await Promise.race([promise, timeoutPromise])
    clearTimeout(timeoutId!)
    return result
  } catch (error) {
    clearTimeout(timeoutId!)
    throw error
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: (attempt: number, useFallback: boolean) => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<RetryResult<T>> {
  const startTime = Date.now()
  let lastError: Error | undefined
  let fallbackUsed = false
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // On last attempt, use fallback model if available
      const useFallback = attempt === config.maxRetries && !!config.fallbackModel
      if (useFallback) {
        fallbackUsed = true
        console.log(`[retry] Last attempt - using fallback model: ${config.fallbackModel}`)
      }
      
      // Execute with timeout
      const result = await withTimeout(
        fn(attempt, useFallback),
        config.timeoutMs,
        `Generation attempt ${attempt + 1}`
      )
      
      // Success!
      return {
        success: true,
        data: result,
        attempts: attempt + 1,
        fallbackUsed,
        totalDurationMs: Date.now() - startTime
      }
      
    } catch (error: any) {
      lastError = error
      console.error(`[retry] Attempt ${attempt + 1} failed:`, error.message)
      
      // Don't retry on certain errors
      if (error.message.includes('Invalid API key') ||
          error.message.includes('CONFIG_MODEL_INVALID') ||
          error.message.includes('not enabled')) {
        break
      }
      
      // If not last attempt, wait before retrying
      if (attempt < config.maxRetries) {
        const backoffMs = Math.pow(config.backoffMultiplier, attempt) * 1000
        console.log(`[retry] Waiting ${backoffMs}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, backoffMs))
      }
    }
  }
  
  // All attempts failed
  return {
    success: false,
    error: lastError || new Error('Unknown error'),
    attempts: config.maxRetries + 1,
    fallbackUsed,
    totalDurationMs: Date.now() - startTime
  }
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase()
  
  // Retryable errors
  if (message.includes('timeout')) return true
  if (message.includes('429')) return true // Rate limit
  if (message.includes('500')) return true // Server error
  if (message.includes('502')) return true // Bad gateway
  if (message.includes('503')) return true // Service unavailable
  if (message.includes('504')) return true // Gateway timeout
  if (message.includes('econnreset')) return true
  if (message.includes('econnrefused')) return true
  
  // Non-retryable errors
  if (message.includes('invalid api key')) return false
  if (message.includes('invalid model')) return false
  if (message.includes('config_model_invalid')) return false
  if (message.includes('not enabled')) return false
  if (message.includes('400')) return false // Bad request
  if (message.includes('401')) return false // Unauthorized
  if (message.includes('403')) return false // Forbidden
  
  // Default to retryable for unknown errors
  return true
}

/**
 * Extract error code from error message
 */
export function extractErrorCode(error: Error): string {
  const message = error.message
  
  if (message.includes('TIMEOUT')) return 'TIMEOUT'
  if (message.includes('429')) return 'RATE_LIMIT'
  if (message.includes('500')) return 'SERVER_ERROR'
  if (message.includes('502')) return 'BAD_GATEWAY'
  if (message.includes('503')) return 'SERVICE_UNAVAILABLE'
  if (message.includes('504')) return 'GATEWAY_TIMEOUT'
  if (message.includes('CONFIG_MODEL_INVALID')) return 'CONFIG_MODEL_INVALID'
  if (message.includes('Invalid API key')) return 'INVALID_API_KEY'
  if (message.includes('not enabled')) return 'POST_TYPE_DISABLED'
  
  return 'UNKNOWN_ERROR'
}
