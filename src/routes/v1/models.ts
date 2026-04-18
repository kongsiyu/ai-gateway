import { Router, Request, Response } from 'express'
import { MODELS } from '../../config/providers'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  res.json({
    object: 'list',
    data: MODELS.map(m => ({
      id: m.id,
      object: 'model',
      created: 1700000000,
      owned_by: m.provider,
      context_length: m.contextLength,
      pricing: {
        input: m.inputPricePerMToken / 1_000_000,
        output: m.outputPricePerMToken / 1_000_000,
      },
    })),
  })
})

export default router
