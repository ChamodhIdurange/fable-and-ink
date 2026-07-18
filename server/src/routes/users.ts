import { Router } from 'express'
import { asyncHandler, HttpError } from '../util.js'
import { buildProfile } from './profile-shared.js'

export const usersRouter = Router()

// GET /api/users/:id/profile — public author profile page.
usersRouter.get(
  '/:id/profile',
  asyncHandler(async (req, res) => {
    const profile = await buildProfile(req.params.id)
    if (!profile) throw new HttpError(404, 'User not found')
    res.json(profile)
  }),
)
