import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { User, publicUser } from '../models/User.js'
import { signToken, requireAuth, type AuthedRequest } from '../auth.js'
import { asyncHandler, HttpError } from '../util.js'
import { config } from '../config.js'

export const authRouter = Router()

// Demo login — logs in as the seeded demo author (June Okafor) so the app works
// out of the box without a sign-up flow (the design has no login screen).
authRouter.post(
  '/demo',
  asyncHandler(async (_req, res) => {
    const user = await User.findOne({ isDemo: true }).sort({ createdAt: 1 })
    if (!user) throw new HttpError(500, 'Demo user not seeded')
    res.json({ token: signToken(String(user._id)), user: publicUser(user) })
  }),
)

// Standard email + password login (all seeded users share the demo password).
authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {}
    if (!email || !password) throw new HttpError(400, 'email and password are required')
    const user = await User.findOne({ email: String(email).toLowerCase() })
    if (!user) throw new HttpError(401, 'Invalid credentials')
    const ok = await bcrypt.compare(String(password), user.passwordHash)
    if (!ok) throw new HttpError(401, 'Invalid credentials')
    res.json({ token: signToken(String(user._id)), user: publicUser(user) })
  }),
)

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await User.findById(req.userId)
    if (!user) throw new HttpError(404, 'User not found')
    res.json({ user: publicUser(user) })
  }),
)

// Exposed so the frontend can show the demo password hint if it wants to.
authRouter.get('/demo-info', (_req, res) => {
  res.json({ password: config.demoPassword, hint: 'All seeded authors use this password.' })
})
