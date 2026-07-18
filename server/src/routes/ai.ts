import { Router } from 'express'
import mongoose from 'mongoose'
import { Story } from '../models/Story.js'
import { requireAuth, type AuthedRequest } from '../auth.js'
import { asyncHandler, HttpError } from '../util.js'
import { generateBeautify, generateHealth, generateNarration } from '../ai.js'

export const aiRouter = Router()

// POST /api/ai/beautify  { text }  -> voice-preserving suggestions.
aiRouter.post(
  '/beautify',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const text = String(req.body?.text ?? '')
    if (!text.trim()) throw new HttpError(400, 'text is required')
    res.json({ suggestions: generateBeautify(text), stub: true })
  }),
)

// POST /api/ai/health  { storyId }  -> Story Health notes.
aiRouter.post(
  '/health',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const storyId = String(req.body?.storyId ?? '')
    res.json({ notes: generateHealth(storyId), ranAt: 'just now', stub: true })
  }),
)

// POST /api/ai/narrate  { storyId, chapterIndex }  -> narration metadata.
aiRouter.post(
  '/narrate',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { storyId, chapterIndex = 0 } = req.body ?? {}
    if (!mongoose.isValidObjectId(storyId)) throw new HttpError(400, 'Invalid storyId')
    const story = await Story.findById(storyId).lean()
    if (!story) throw new HttpError(404, 'Story not found')
    const chapter = (story as any).chapters?.[chapterIndex]
    if (!chapter) throw new HttpError(404, 'Chapter not found')
    res.json({ narration: generateNarration(chapter.secs ?? 300) })
  }),
)
