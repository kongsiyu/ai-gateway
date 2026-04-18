import { Request, Response, NextFunction } from 'express'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: { message: 'Missing Authorization header', type: 'auth_error' } })
  }

  const token = authHeader.slice(7)
  // For now: accept any non-empty token; replace with DB lookup for production
  if (!token) {
    return res.status(401).json({ error: { message: 'Invalid API key', type: 'auth_error' } })
  }

  // In production, validate token against database and attach user info to req
  next()
}
