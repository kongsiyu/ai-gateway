import { ModelInfo } from '../types'

export const MODELS: ModelInfo[] = [
  // OpenAI
  { id: 'openai/gpt-4o', provider: 'openai', providerModelId: 'gpt-4o', contextLength: 128000, inputPricePerMToken: 5, outputPricePerMToken: 15 },
  { id: 'openai/gpt-4o-mini', provider: 'openai', providerModelId: 'gpt-4o-mini', contextLength: 128000, inputPricePerMToken: 0.15, outputPricePerMToken: 0.6 },
  { id: 'openai/gpt-4-turbo', provider: 'openai', providerModelId: 'gpt-4-turbo', contextLength: 128000, inputPricePerMToken: 10, outputPricePerMToken: 30 },
  { id: 'openai/gpt-3.5-turbo', provider: 'openai', providerModelId: 'gpt-3.5-turbo', contextLength: 16385, inputPricePerMToken: 0.5, outputPricePerMToken: 1.5 },

  // Anthropic
  { id: 'anthropic/claude-opus-4', provider: 'anthropic', providerModelId: 'claude-opus-4-5', contextLength: 200000, inputPricePerMToken: 15, outputPricePerMToken: 75 },
  { id: 'anthropic/claude-sonnet-4', provider: 'anthropic', providerModelId: 'claude-sonnet-4-5', contextLength: 200000, inputPricePerMToken: 3, outputPricePerMToken: 15 },
  { id: 'anthropic/claude-haiku-4', provider: 'anthropic', providerModelId: 'claude-haiku-4-5', contextLength: 200000, inputPricePerMToken: 0.8, outputPricePerMToken: 4 },

  // Google
  { id: 'google/gemini-1.5-pro', provider: 'google', providerModelId: 'gemini-1.5-pro', contextLength: 1000000, inputPricePerMToken: 3.5, outputPricePerMToken: 10.5 },
  { id: 'google/gemini-1.5-flash', provider: 'google', providerModelId: 'gemini-1.5-flash', contextLength: 1000000, inputPricePerMToken: 0.075, outputPricePerMToken: 0.3 },
  { id: 'google/gemini-2.0-flash', provider: 'google', providerModelId: 'gemini-2.0-flash', contextLength: 1000000, inputPricePerMToken: 0.1, outputPricePerMToken: 0.4 },

  // Mistral
  { id: 'mistral/mistral-large', provider: 'mistral', providerModelId: 'mistral-large-latest', contextLength: 128000, inputPricePerMToken: 3, outputPricePerMToken: 9 },
  { id: 'mistral/mistral-small', provider: 'mistral', providerModelId: 'mistral-small-latest', contextLength: 32000, inputPricePerMToken: 0.2, outputPricePerMToken: 0.6 },
]

export const MODEL_MAP = new Map(MODELS.map(m => [m.id, m]))

export function resolveModel(modelId: string): ModelInfo | undefined {
  // Try exact match first
  if (MODEL_MAP.has(modelId)) return MODEL_MAP.get(modelId)

  // Try without provider prefix (e.g. "gpt-4o" -> "openai/gpt-4o")
  for (const model of MODELS) {
    if (model.providerModelId === modelId) return model
  }

  return undefined
}
