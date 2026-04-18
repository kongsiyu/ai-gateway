import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { routeModel } from '../../services/router'

const router = Router()

const ChatRequestSchema = z.object({
  model: z.string(),
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string(),
  })),
  stream: z.boolean().optional().default(false),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().positive().optional(),
  top_p: z.number().min(0).max(1).optional(),
  stop: z.union([z.string(), z.array(z.string())]).optional(),
})

router.post('/completions', async (req: Request, res: Response) => {
  const parsed = ChatRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: { message: 'Invalid request', type: 'invalid_request_error', details: parsed.error.issues },
    })
  }

  const request = parsed.data

  try {
    const { provider, providerModelId } = routeModel(request.model)

    if (request.stream) {
      await provider.chatCompletionStream(request, providerModelId, res)
    } else {
      const result = await provider.chatCompletion(request, providerModelId)
      res.json(result)
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    const status = message.includes('Unknown model') || message.includes('not configured') ? 400 : 500
    res.status(status).json({ error: { message, type: 'api_error' } })
  }
})

export default router
