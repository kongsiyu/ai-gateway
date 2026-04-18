import { GoogleGenerativeAI } from '@google/generative-ai'
import { Response } from 'express'
import { BaseProvider } from './base'
import { ChatCompletionRequest, ChatCompletionResponse, ChatMessage } from '../types'
import { v4 as uuidv4 } from 'uuid'

export class GoogleProvider extends BaseProvider {
  name = 'google'
  private client: GoogleGenerativeAI

  constructor(apiKey: string) {
    super()
    this.client = new GoogleGenerativeAI(apiKey)
  }

  private toGeminiMessages(messages: ChatMessage[]) {
    return messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))
  }

  private getSystemInstruction(messages: ChatMessage[]): string | undefined {
    return messages.find(m => m.role === 'system')?.content
  }

  async chatCompletion(request: ChatCompletionRequest, providerModelId: string): Promise<ChatCompletionResponse> {
    const systemInstruction = this.getSystemInstruction(request.messages)
    const model = this.client.getGenerativeModel({
      model: providerModelId,
      systemInstruction,
    })

    const history = this.toGeminiMessages(request.messages)
    const lastMessage = history.pop()
    if (!lastMessage) throw new Error('No messages provided')

    const chat = model.startChat({ history })
    const result = await chat.sendMessage(lastMessage.parts)
    const text = result.response.text()

    return {
      id: `chatcmpl-${uuidv4()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: request.model,
      choices: [{
        index: 0,
        message: { role: 'assistant', content: text },
        finish_reason: 'stop',
      }],
      usage: {
        prompt_tokens: result.response.usageMetadata?.promptTokenCount ?? 0,
        completion_tokens: result.response.usageMetadata?.candidatesTokenCount ?? 0,
        total_tokens: result.response.usageMetadata?.totalTokenCount ?? 0,
      },
    }
  }

  async chatCompletionStream(request: ChatCompletionRequest, providerModelId: string, res: Response): Promise<void> {
    const systemInstruction = this.getSystemInstruction(request.messages)
    const model = this.client.getGenerativeModel({
      model: providerModelId,
      systemInstruction,
    })

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const id = `chatcmpl-${uuidv4()}`
    const created = Math.floor(Date.now() / 1000)

    const history = this.toGeminiMessages(request.messages)
    const lastMessage = history.pop()
    if (!lastMessage) throw new Error('No messages provided')

    const chat = model.startChat({ history })
    const result = await chat.sendMessageStream(lastMessage.parts)

    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) {
        const data = {
          id,
          object: 'chat.completion.chunk',
          created,
          model: request.model,
          choices: [{ index: 0, delta: { content: text }, finish_reason: null }],
        }
        res.write(`data: ${JSON.stringify(data)}\n\n`)
      }
    }

    res.write(`data: ${JSON.stringify({ id, object: 'chat.completion.chunk', created, model: request.model, choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] })}\n\n`)
    res.write('data: [DONE]\n\n')
    res.end()
  }
}
