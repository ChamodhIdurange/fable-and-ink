import { Router } from 'express'
import mongoose from 'mongoose'
import { Story } from '../models/Story.js'
import { ReadingProgress } from '../models/ReadingProgress.js'
import { requireAuth, type AuthedRequest } from '../auth.js'
import { asyncHandler, HttpError } from '../util.js'
import { buildProfile } from './profile-shared.js'

export const meRouter = Router()
meRouter.use(requireAuth)

// GET /api/me/profile — the signed-in author's profile page payload.
meRouter.get(
  '/profile',
  asyncHandler(async (req: AuthedRequest, res) => {
    const profile = await buildProfile(req.userId!)
    if (!profile) throw new HttpError(404, 'User not found')
    res.json(profile)
  }),
)

// GET /api/me/stories — the user's own stories (published + drafts).
meRouter.get(
  '/stories',
  asyncHandler(async (req: AuthedRequest, res) => {
    const stories = await Story.find({ author: req.userId }).sort({ updatedAt: -1 }).lean()
    res.json({ stories: stories.map(summariseOwn) })
  }),
)

// GET /api/me/draft — the user's current working draft (for the editor).
// Returns the most-recently-updated draft, enriched with fork lineage.
meRouter.get(
  '/draft',
  asyncHandler(async (req: AuthedRequest, res) => {
    const draft = await Story.findOne({ author: req.userId, status: 'draft' }).sort({ updatedAt: -1 }).lean()
    if (!draft) return res.json({ draft: null })

    let forkedFrom: { id: string; title: string; by: string } | null = null
    if ((draft as any).parentStory) {
      const parent = await Story.findById((draft as any).parentStory).populate('author').lean()
      if (parent) {
        forkedFrom = {
          id: String((parent as any)._id),
          title: (parent as any).title,
          by: (parent as any).author?.name ?? 'Unknown',
        }
      }
    }

    res.json({
      draft: {
        id: String((draft as any)._id),
        title: (draft as any).title,
        draftChapterTitle: (draft as any).draftChapterTitle,
        draftBody: (draft as any).draftBody,
        scenes: (draft as any).scenes,
        genres: (draft as any).genres,
        blurb: (draft as any).blurb,
        visibility: (draft as any).visibility,
        forkKind: (draft as any).forkKind,
        forkedFrom,
      },
    })
  }),
)

// GET /api/me/progress — most recent reading position (the "Continue reading" card).
meRouter.get(
  '/progress',
  asyncHandler(async (req: AuthedRequest, res) => {
    const p = await ReadingProgress.findOne({ user: req.userId })
      .sort({ updatedAt: -1 })
      .populate({ path: 'story', populate: { path: 'author' } })
      .lean()
    if (!p || !(p as any).story) return res.json({ progress: null })
    const story: any = (p as any).story
    const chapter = story.chapters?.[(p as any).chapterIndex]
    res.json({
      progress: {
        storyId: String(story._id),
        title: story.title,
        chapterIndex: (p as any).chapterIndex,
        chapterLabel: chapter ? `Ch. ${(p as any).chapterIndex + 1} · ${chapter.title}` : '',
        percent: (p as any).percent,
      },
    })
  }),
)

// PUT /api/me/progress — upsert reading position for a story.
meRouter.put(
  '/progress',
  asyncHandler(async (req: AuthedRequest, res) => {
    const { storyId, chapterIndex = 0, percent = 0 } = req.body ?? {}
    if (!mongoose.isValidObjectId(storyId)) throw new HttpError(400, 'Invalid storyId')
    const story = await Story.findById(storyId)
    if (!story) throw new HttpError(404, 'Story not found')
    const p = await ReadingProgress.findOneAndUpdate(
      { user: req.userId, story: storyId },
      { chapterIndex, percent, user: req.userId, story: storyId },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
    res.json({ ok: true, progress: { chapterIndex: p!.chapterIndex, percent: p!.percent } })
  }),
)

function summariseOwn(s: any) {
  const reads = s.readCount >= 1000 ? `${(s.readCount / 1000).toFixed(1)}k` : String(s.readCount)
  const state = s.status === 'draft' ? 'draft' : 'published'
  return {
    id: String(s._id),
    title: s.title,
    genre: s.genres?.[0] ?? 'Literary',
    status: s.status,
    meta: `${reads} reads · ${state}`,
  }
}
