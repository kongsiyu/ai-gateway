import express from 'express'
import { authMiddleware } from './middleware/auth'
import chatRouter from './routes/v1/chat'
import modelsRouter from './routes/v1/models'

const app = express()

app.use(express.json())

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// API v1
app.use('/v1/chat', authMiddleware, chatRouter)
app.use('/v1/models', authMiddleware, modelsRouter)

// 404
app.use((_req, res) => res.status(404).json({ error: { message: 'Not found', type: 'not_found' } }))

export default app
