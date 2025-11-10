/**
 * API Credit Monitoring Service
 * Checks remaining credits for OpenAI and Replicate APIs
 */

export interface OpenAIBillingInfo {
  hard_limit_usd: number
  soft_limit_usd: number
  system_hard_limit_usd: number
  has_payment_method: boolean
}

export interface OpenAIUsageInfo {
  total_usage: number // in cents
  daily_costs: Array<{
    timestamp: number
    line_items: Array<{
      name: string
      cost: number
    }>
  }>
}

export interface ReplicateBillingInfo {
  outstanding_balance: number
  usage_this_month: number
  credit_remaining: number
}

export interface APICreditsStatus {
  openai: {
    status: 'success' | 'error'
    hard_limit_usd?: number
    soft_limit_usd?: number
    usage_this_month_usd?: number
    remaining_usd?: number
    has_payment_method?: boolean
    error?: string
  }
  replicate: {
    status: 'success' | 'error'
    outstanding_balance?: number
    usage_this_month?: number
    credit_remaining?: number
    error?: string
  }
  last_updated: string
}

/**
 * Check OpenAI billing and usage
 */
async function checkOpenAICredits(): Promise<APICreditsStatus['openai']> {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return {
        status: 'error',
        error: 'OpenAI API key not configured'
      }
    }

    // Get billing subscription info
    const subscriptionResponse = await fetch(
      'https://api.openai.com/dashboard/billing/subscription',
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!subscriptionResponse.ok) {
      throw new Error(`Subscription API returned ${subscriptionResponse.status}`)
    }

    const subscription: OpenAIBillingInfo = await subscriptionResponse.json()

    // Get usage for current month
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    const usageResponse = await fetch(
      `https://api.openai.com/dashboard/billing/usage?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!usageResponse.ok) {
      throw new Error(`Usage API returned ${usageResponse.status}`)
    }

    const usage: OpenAIUsageInfo = await usageResponse.json()
    const usageThisMonthUsd = usage.total_usage / 100 // Convert cents to dollars

    return {
      status: 'success',
      hard_limit_usd: subscription.hard_limit_usd,
      soft_limit_usd: subscription.soft_limit_usd,
      usage_this_month_usd: usageThisMonthUsd,
      remaining_usd: subscription.hard_limit_usd - usageThisMonthUsd,
      has_payment_method: subscription.has_payment_method,
    }
  } catch (error: any) {
    console.error('[api-credits] OpenAI check failed:', error)
    return {
      status: 'error',
      error: error.message || 'Failed to check OpenAI credits'
    }
  }
}

/**
 * Check Replicate billing
 */
async function checkReplicateCredits(): Promise<APICreditsStatus['replicate']> {
  try {
    const apiToken = process.env.REPLICATE_API_TOKEN
    if (!apiToken) {
      return {
        status: 'error',
        error: 'Replicate API token not configured'
      }
    }

    // Note: Replicate doesn't have a public billing API endpoint
    // We'll need to scrape the dashboard or use their unofficial API
    // For now, return a placeholder
    return {
      status: 'error',
      error: 'Replicate billing API not yet implemented'
    }
  } catch (error: any) {
    console.error('[api-credits] Replicate check failed:', error)
    return {
      status: 'error',
      error: error.message || 'Failed to check Replicate credits'
    }
  }
}

/**
 * Get comprehensive API credits status
 */
export async function getAPICreditsStatus(): Promise<APICreditsStatus> {
  const [openai, replicate] = await Promise.all([
    checkOpenAICredits(),
    checkReplicateCredits(),
  ])

  return {
    openai,
    replicate,
    last_updated: new Date().toISOString(),
  }
}

/**
 * Get status color based on remaining credits
 */
export function getStatusColor(remaining: number, limit: number): 'green' | 'yellow' | 'red' {
  const percentage = (remaining / limit) * 100
  
  if (percentage > 30) return 'green'
  if (percentage > 10) return 'yellow'
  return 'red'
}

/**
 * Format USD amount for display
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
