import OpenAI from 'openai'
import { Response } from 'express'
import { BaseProvider } from './base'
import { ChatCompletionRequest, ChatCompletionResponse } from '../types'
import { v4 as uuidv4 } from 'uuid'

export class OpenAIProvider extends BaseProvider {
  name = 'openai'
  private client: OpenAI

  constructor(apiKey: string, baseUrl?: string) {
    super()
    this.client = new OpenAI({ apiKey, baseURL: baseUrl })
  }

  async chatCompletion(request: ChatCompletionRequest, providerModelId: string): Promise<ChatCompletionResponse> {
    const response = await this.client.chat.completions.create({
      model: providerModelId,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
      top_p: request.top_p,
      stop: request.stop,
      stream: false,
    })

    return {
      id: response.id,
      object: 'chat.completion',
      created: response.created,
      model: request.model,
      choices: response.choices.map((c, i) => ({
        index: i,
        message: { role: c.message.role as 'assistant', content: c.message.content || '' },
        finish_reason: c.finish_reason,
      })),
      usage: {
        prompt_tokens: response.usage?.prompt_tokens ?? 0,
        completion_tokens: response.usage?.completion_tokens ?? 0,
        total_tokens: response.usage?.total_tokens ?? 0,
      },
    }
  }

  async chatCompletionStream(request: ChatCompletionRequest, providerModelId: string, res: Response): Promise<void> {
    const stream = await this.client.chat.completions.create({
      model: providerModelId,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
      top_p: request.top_p,
      stop: request.stop,
      stream: true,
    })

    const id = `chatcmpl-${uuidv4()}`
    const created = Math.floor(Date.now() / 1000)

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    for await (const chunk of stream) {
      const data = {
        id,
        object: 'chat.completion.chunk',
        created,
        model: request.model,
        choices: chunk.choices.map((c, i) => ({
          index: i,
          delta: { role: c.delta.role, content: c.delta.content },
          finish_reason: c.finish_reason,
        })),
      }
      res.write(`data: ${JSON.stringify(data)}\n\n`)
    }

    res.write('data: [DONE]\n\n')
    res.end()
  }
}
