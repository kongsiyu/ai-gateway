import Anthropic from '@anthropic-ai/sdk'
import { Response } from 'express'
import { BaseProvider } from './base'
import { ChatCompletionRequest, ChatCompletionResponse, ChatMessage } from '../types'
import { v4 as uuidv4 } from 'uuid'

export class AnthropicProvider extends BaseProvider {
  name = 'anthropic'
  private client: Anthropic

  constructor(apiKey: string) {
    super()
    this.client = new Anthropic({ apiKey })
  }

  private extractSystem(messages: ChatMessage[]): { system?: string; messages: ChatMessage[] } {
    const systemMsg = messages.find(m => m.role === 'system')
    const rest = messages.filter(m => m.role !== 'system')
    return { system: systemMsg?.content, messages: rest }
  }

  async chatCompletion(request: ChatCompletionRequest, providerModelId: string): Promise<ChatCompletionResponse> {
    const { system, messages } = this.extractSystem(request.messages)

    const response = await this.client.messages.create({
      model: providerModelId,
      max_tokens: request.max_tokens ?? 4096,
      system,
      messages: messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      temperature: request.temperature,
      top_p: request.top_p,
    })

    const content = response.content[0]?.type === 'text' ? response.content[0].text : ''

    return {
      id: response.id,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: request.model,
      choices: [{
        index: 0,
        message: { role: 'assistant', content },
        finish_reason: response.stop_reason === 'end_turn' ? 'stop' : 'length',
      }],
      usage: {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    }
  }

  async chatCompletionStream(request: ChatCompletionRequest, providerModelId: string, res: Response): Promise<void> {
    const { system, messages } = this.extractSystem(request.messages)

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const id = `chatcmpl-${uuidv4()}`
    const created = Math.floor(Date.now() / 1000)

    const stream = await this.client.messages.create({
      model: providerModelId,
      max_tokens: request.max_tokens ?? 4096,
      system,
      messages: messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      temperature: request.temperature,
      top_p: request.top_p,
      stream: true,
    })

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const chunk = {
          id,
          object: 'chat.completion.chunk',
          created,
          model: request.model,
          choices: [{ index: 0, delta: { content: event.delta.text }, finish_reason: null }],
        }
        res.write(`data: ${JSON.stringify(chunk)}\n\n`)
      } else if (event.type === 'message_stop') {
        const chunk = {
          id,
          object: 'chat.completion.chunk',
          created,
          model: request.model,
          choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
        }
        res.write(`data: ${JSON.stringify(chunk)}\n\n`)
      }
    }

    res.write('data: [DONE]\n\n')
    res.end()
  }
}
