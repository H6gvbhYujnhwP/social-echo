/**
 * Model ID Mapping
 * 
 * Maps UI-friendly model labels to actual API model IDs.
 * This ensures the admin can select human-readable names
 * while we send the correct model ID to OpenAI/Anthropic.
 */

export type ModelProvider = 'openai' | 'anthropic'

export interface ModelInfo {
  id: string
  provider: ModelProvider
  maxTokens: number
  costPer1kTokens: number
}

/**
 * Map of UI labels to actual model IDs
 */
export const MODEL_MAPPING: Record<string, ModelInfo> = {
  // OpenAI models
  'gpt-4o': {
    id: 'gpt-4o',
    provider: 'openai',
    maxTokens: 128000,
    costPer1kTokens: 0.005
  },
  'GPT-4o (Creative, Rich Language)': {
    id: 'gpt-4o',
    provider: 'openai',
    maxTokens: 128000,
    costPer1kTokens: 0.005
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    provider: 'openai',
    maxTokens: 128000,
    costPer1kTokens: 0.00015
  },
  'GPT-4o mini (fast)': {
    id: 'gpt-4o-mini',
    provider: 'openai',
    maxTokens: 128000,
    costPer1kTokens: 0.00015
  },
  'gpt-4.1-mini': {
    id: 'gpt-4o-mini',
    provider: 'openai',
    maxTokens: 128000,
    costPer1kTokens: 0.00015
  },
  'gpt-4.1-nano': {
    id: 'gpt-4o-mini',
    provider: 'openai',
    maxTokens: 128000,
    costPer1kTokens: 0.00015
  },
  
  // Anthropic models
  'claude-4.1-opus': {
    id: 'claude-opus-4-20250514',
    provider: 'anthropic',
    maxTokens: 200000,
    costPer1kTokens: 0.015
  },
  'Claude 4.1 Opus (beta)': {
    id: 'claude-opus-4-20250514',
    provider: 'anthropic',
    maxTokens: 200000,
    costPer1kTokens: 0.015
  }
}

/**
 * Get the actual model ID from a UI label or model string
 */
export function getModelId(modelLabel: string): string {
  const modelInfo = MODEL_MAPPING[modelLabel]
  
  if (!modelInfo) {
    console.error('[model-mapping] Unknown model label:', modelLabel)
    console.error('[model-mapping] Available models:', Object.keys(MODEL_MAPPING))
    throw new Error(`CONFIG_MODEL_INVALID: Unknown model "${modelLabel}". Please update AI configuration.`)
  }
  
  return modelInfo.id
}

/**
 * Get full model info from a UI label or model string
 */
export function getModelInfo(modelLabel: string): ModelInfo {
  const modelInfo = MODEL_MAPPING[modelLabel]
  
  if (!modelInfo) {
    throw new Error(`CONFIG_MODEL_INVALID: Unknown model "${modelLabel}"`)
  }
  
  return modelInfo
}

/**
 * Validate that a model string is recognized
 */
export function isValidModel(modelLabel: string): boolean {
  return modelLabel in MODEL_MAPPING
}

/**
 * Get list of all available model labels (for UI dropdowns)
 */
export function getAvailableModels(): string[] {
  return Object.keys(MODEL_MAPPING)
}
