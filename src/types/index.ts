export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
  stream?: boolean
  temperature?: number
  max_tokens?: number
  top_p?: number
  stop?: string | string[]
}

export interface ChatCompletionChoice {
  index: number
  message: ChatMessage
  finish_reason: 'stop' | 'length' | 'content_filter' | null
}

export interface UsageStats {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export interface ChatCompletionResponse {
  id: string
  object: 'chat.completion'
  created: number
  model: string
  choices: ChatCompletionChoice[]
  usage: UsageStats
}

export interface StreamDelta {
  role?: string
  content?: string
}

export interface StreamChoice {
  index: number
  delta: StreamDelta
  finish_reason: string | null
}

export interface StreamChunk {
  id: string
  object: 'chat.completion.chunk'
  created: number
  model: string
  choices: StreamChoice[]
}

export interface ProviderConfig {
  name: string
  apiKey: string
  baseUrl?: string
}

export interface ModelInfo {
  id: string
  provider: string
  providerModelId: string
  contextLength: number
  inputPricePerMToken: number
  outputPricePerMToken: number
}
