/**
 * API Credit Monitoring Service
 * Monitors OpenAI spending and Replicate API status
 */

export interface OpenAICostBucket {
  object: 'bucket'
  start_time: number
  end_time: number
  results: Array<{
    object: 'organization.costs.result'
    amount: {
      value: number
      currency: string
    }
    line_item: string | null
    project_id: string | null
  }>
}

export interface OpenAICostsResponse {
  object: 'page'
  data: OpenAICostBucket[]
  has_more: boolean
  next_page: string | null
}

export interface ReplicateAccountInfo {
  type: 'user' | 'organization'
  username: string
  name: string
  github_url?: string
}

export interface APICreditsStatus {
  openai: {
    status: 'success' | 'error'
    last_7_days_spending?: number
    last_30_days_spending?: number
    daily_costs?: Array<{
      date: string
      amount: number
    }>
    error?: string
  }
  replicate: {
    status: 'success' | 'error'
    account_name?: string
    account_type?: string
    api_active?: boolean
    error?: string
  }
  last_updated: string
}

/**
 * Check OpenAI costs using the official Costs API
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

    // Get costs for last 30 days
    const now = Math.floor(Date.now() / 1000)
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60)
    
    const costsResponse = await fetch(
      `https://api.openai.com/v1/organization/costs?start_time=${thirtyDaysAgo}&bucket_width=1d&limit=30`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!costsResponse.ok) {
      const errorText = await costsResponse.text()
      throw new Error(`Costs API returned ${costsResponse.status}: ${errorText}`)
    }

    const costs: OpenAICostsResponse = await costsResponse.json()

    // Calculate total spending for last 7 and 30 days
    let last7DaysSpending = 0
    let last30DaysSpending = 0
    const dailyCosts: Array<{ date: string; amount: number }> = []

    const sevenDaysAgo = now - (7 * 24 * 60 * 60)

    costs.data.forEach((bucket) => {
      const totalAmount = bucket.results.reduce((sum, result) => sum + result.amount.value, 0)
      last30DaysSpending += totalAmount
      
      if (bucket.start_time >= sevenDaysAgo) {
        last7DaysSpending += totalAmount
      }

      dailyCosts.push({
        date: new Date(bucket.start_time * 1000).toLocaleDateString(),
        amount: totalAmount
      })
    })

    return {
      status: 'success',
      last_7_days_spending: last7DaysSpending,
      last_30_days_spending: last30DaysSpending,
      daily_costs: dailyCosts.reverse(), // Most recent first
    }
  } catch (error: any) {
    console.error('[api-credits] OpenAI check failed:', error)
    return {
      status: 'error',
      error: error.message || 'Failed to check OpenAI costs'
    }
  }
}

/**
 * Check Replicate API status using account endpoint
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

    // Use the account endpoint to verify API is active
    const accountResponse = await fetch(
      'https://api.replicate.com/v1/account',
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!accountResponse.ok) {
      throw new Error(`Account API returned ${accountResponse.status}`)
    }

    const account: ReplicateAccountInfo = await accountResponse.json()

    return {
      status: 'success',
      account_name: account.name || account.username,
      account_type: account.type,
      api_active: true,
    }
  } catch (error: any) {
    console.error('[api-credits] Replicate check failed:', error)
    return {
      status: 'error',
      error: error.message || 'Failed to check Replicate API status'
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
 * Get status color based on spending trends
 */
export function getSpendingStatusColor(last7Days: number, last30Days: number): 'green' | 'yellow' | 'red' {
  const dailyAverage = last7Days / 7
  const monthlyProjection = dailyAverage * 30
  
  // Alert levels based on projected monthly spending
  if (monthlyProjection < 50) return 'green'
  if (monthlyProjection < 100) return 'yellow'
  return 'red'
}

/**
 * Format USD amount for display
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
