import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import { config } from './config.js'
import { User } from './models/User.js'

export interface AuthedRequest extends Request {
  userId?: string
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: '30d' })
}

function readToken(req: Request): string | null {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) return header.slice(7)
  return null
}

// Attaches userId when a valid token is present; never rejects.
export async function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const token = readToken(req)
  if (token) {
    try {
      const payload = jwt.verify(token, config.jwtSecret) as { sub: string }
      req.userId = payload.sub
    } catch {
      // ignore invalid token — treated as anonymous
    }
  }
  next()
}

// Rejects with 401 when no valid token / user is present.
export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = readToken(req)
  if (!token) return res.status(401).json({ error: 'Authentication required' })
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { sub: string }
    const exists = await User.exists({ _id: payload.sub })
    if (!exists) return res.status(401).json({ error: 'User no longer exists' })
    req.userId = payload.sub
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
