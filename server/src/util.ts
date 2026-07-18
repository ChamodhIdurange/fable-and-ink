import type { Request, Response, NextFunction, RequestHandler } from 'express'

// Wraps an async route so thrown errors reach the Express error handler.
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// Generates a STORY-#### blind id. Deterministic-length, human-readable.
export function makeBlindId(): string {
  const n = Math.floor(1 + Math.random() * 9998)
  return `STORY-${String(n).padStart(4, '0')}`
}
