import { Router } from 'express'
import mongoose from 'mongoose'
import { Story } from '../models/Story.js'
import { requireAuth, type AuthedRequest } from '../auth.js'
import { asyncHandler, HttpError } from '../util.js'
import { AiUnavailableError, generateBeautify, generateHealth, generateNarration, type StoryContext } from '../ai.js'

export const aiRouter = Router()

const OUT_MESSAGE =
  'Our writing models are all at capacity right now — take a breather and try again in a few minutes.'

// POST /api/ai/beautify  { text }  -> voice-preserving suggestions (Gemini).
aiRouter.post(
  '/beautify',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const text = String(req.body?.text ?? '')
    if (!text.trim()) throw new HttpError(400, 'text is required')
    try {
      const { suggestions, source } = await generateBeautify(text)
      res.json({ suggestions, source, stub: source === 'stub' })
    } catch (err) {
      if (err instanceof AiUnavailableError) throw new HttpError(503, OUT_MESSAGE)
      throw err
    }
  }),
)

// POST /api/ai/health  { storyId }  -> Story Health notes (Gemini), grounded
// in the story's real chapters, scene cards and current draft.
aiRouter.post(
  '/health',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const storyId = String(req.body?.storyId ?? '')
    if (!mongoose.isValidObjectId(storyId)) throw new HttpError(400, 'Invalid storyId')
    const story = await Story.findById(storyId).lean()
    if (!story) throw new HttpError(404, 'Story not found')

    const ctx: StoryContext = {
      title: (story as any).title,
      blurb: (story as any).blurb ?? '',
      chapterTitles: ((story as any).chapters ?? []).map((c: any) => c.title),
      scenes: ((story as any).scenes ?? []).map((s: any) => ({
        slug: s.slug,
        title: s.title,
        ch: s.ch,
        words: s.words,
        flag: s.flag ?? '',
      })),
      draftChapterTitle: (story as any).draftChapterTitle ?? '',
      draftBody: (story as any).draftBody ?? '',
    }
    try {
      const { notes, source } = await generateHealth(ctx)
      res.json({ notes, ranAt: 'just now', source, stub: source === 'stub' })
    } catch (err) {
      if (err instanceof AiUnavailableError) throw new HttpError(503, OUT_MESSAGE)
      throw err
    }
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
