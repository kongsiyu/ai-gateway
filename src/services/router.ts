import { resolveModel } from '../config/providers'
import { OpenAIProvider } from '../providers/openai'
import { AnthropicProvider } from '../providers/anthropic'
import { GoogleProvider } from '../providers/google'
import { BaseProvider } from '../providers/base'

const providers: Record<string, BaseProvider | null> = {
  openai: process.env.OPENAI_API_KEY ? new OpenAIProvider(process.env.OPENAI_API_KEY) : null,
  anthropic: process.env.ANTHROPIC_API_KEY ? new AnthropicProvider(process.env.ANTHROPIC_API_KEY) : null,
  google: process.env.GOOGLE_API_KEY ? new GoogleProvider(process.env.GOOGLE_API_KEY) : null,
}

export function routeModel(modelId: string): { provider: BaseProvider; providerModelId: string } {
  const model = resolveModel(modelId)
  if (!model) throw new Error(`Unknown model: ${modelId}`)

  const provider = providers[model.provider]
  if (!provider) throw new Error(`Provider ${model.provider} is not configured (missing API key)`)

  return { provider, providerModelId: model.providerModelId }
}
