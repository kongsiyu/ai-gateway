import { ChatCompletionRequest, ChatCompletionResponse } from '../types'
import { Response } from 'express'

export abstract class BaseProvider {
  abstract name: string

  abstract chatCompletion(
    request: ChatCompletionRequest,
    providerModelId: string
  ): Promise<ChatCompletionResponse>

  abstract chatCompletionStream(
    request: ChatCompletionRequest,
    providerModelId: string,
    res: Response
  ): Promise<void>
}
