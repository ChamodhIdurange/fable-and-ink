import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import { config } from './config.js'
import { HttpError } from './util.js'
import { authRouter } from './routes/auth.js'
import { storiesRouter } from './routes/stories.js'
import { meRouter } from './routes/me.js'
import { usersRouter } from './routes/users.js'
import { aiRouter } from './routes/ai.js'

export function createApp() {
  const app = express()

  app.use(cors({ origin: config.corsOrigins, credentials: true }))
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'fable-and-ink' }))

  app.use('/api/auth', authRouter)
  app.use('/api/stories', storiesRouter)
  app.use('/api/me', meRouter)
  app.use('/api/users', usersRouter)
  app.use('/api/ai', aiRouter)

  // 404 for unmatched API routes.
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }))

  // Central error handler.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message })
    }
    if (err && typeof err === 'object' && (err as any).name === 'ValidationError') {
      return res.status(400).json({ error: (err as any).message })
    }
    console.error('Unhandled error:', err)
    res.status(500).json({ error: 'Internal server error' })
  })

  return app
}
