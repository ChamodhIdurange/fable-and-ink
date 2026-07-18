import { Router } from 'express'
import mongoose from 'mongoose'
import { Story, storyCard, FORK_KINDS, VISIBILITIES } from '../models/Story.js'
import { User } from '../models/User.js'
import { requireAuth, optionalAuth, type AuthedRequest } from '../auth.js'
import { asyncHandler, HttpError, makeBlindId } from '../util.js'

export const storiesRouter = Router()

const FORK_KIND_LABELS: Record<string, string> = {
  ending: 'ALT ENDING',
  branch: 'BRANCH',
  spinoff: 'SPIN-OFF',
  altpov: 'ALT POV',
}

const isId = (id: string) => mongoose.isValidObjectId(id)

// Count forks for a set of stories in one aggregation (avoids N+1 queries).
async function forkCountsFor(storyIds: mongoose.Types.ObjectId[]): Promise<Map<string, number>> {
  const rows = await Story.aggregate([
    { $match: { parentStory: { $in: storyIds } } },
    { $group: { _id: '$parentStory', n: { $sum: 1 } } },
  ])
  return new Map(rows.map((r: any) => [String(r._id), r.n]))
}

/* ------------------------------- Feed ---------------------------------- */
// GET /api/stories?genre=Mystery&blind=true
storiesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const genre = typeof req.query.genre === 'string' ? req.query.genre : 'All'
    const blind = req.query.blind === 'true'

    // Originals only — forks live in the remix tree and on profiles, not the shelf.
    const filter: Record<string, unknown> = {
      status: 'published',
      visibility: 'public',
      parentStory: null,
    }
    if (genre && genre !== 'All') filter.genres = genre

    // Stable shelf order (insertion order via monotonic _id) so the feed reads
    // the same on every visit — matches the prototype's shelf sequence.
    const stories = await Story.find(filter).populate('author').sort({ _id: 1 }).lean()
    const counts = await forkCountsFor(stories.map((s: any) => s._id))
    const cards = stories.map((s: any) =>
      storyCard({ ...s, forkCount: counts.get(String(s._id)) ?? 0 }, { blind }),
    )
    res.json({ stories: cards, blind })
  }),
)

/* ---------------------------- Story detail ----------------------------- */
// GET /api/stories/:id?blind=true
storiesRouter.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!isId(req.params.id)) throw new HttpError(400, 'Invalid story id')
    const blind = req.query.blind === 'true'
    const story = await Story.findById(req.params.id).populate('author').lean()
    if (!story) throw new HttpError(404, 'Story not found')

    const isOwner = req.userId && String((story as any).author?._id) === req.userId
    const counts = await forkCountsFor([(story as any)._id])
    const forkCount = counts.get(String((story as any)._id)) ?? 0

    const card = storyCard({ ...story, forkCount }, { blind: blind && !isOwner })
    res.json({
      story: {
        ...card,
        visibility: (story as any).visibility,
        status: (story as any).status,
        chapters: (story as any).chapters,
        // Scenes + draft body are editor-only; only expose to the owner.
        scenes: isOwner ? (story as any).scenes : undefined,
        draftChapterTitle: isOwner ? (story as any).draftChapterTitle : undefined,
        draftBody: isOwner ? (story as any).draftBody : undefined,
        parentStory: (story as any).parentStory ? String((story as any).parentStory) : null,
        forkKind: (story as any).forkKind,
      },
    })
  }),
)

/* ------------------------- Remix tree / forks -------------------------- */
// GET /api/stories/:id/forks  -> { original, forks:[{kind,title,by,...}] }
storiesRouter.get(
  '/:id/forks',
  asyncHandler(async (req, res) => {
    if (!isId(req.params.id)) throw new HttpError(400, 'Invalid story id')
    const story = await Story.findById(req.params.id).lean()
    if (!story) throw new HttpError(404, 'Story not found')

    // The tree is rooted at the original (walk up one level if this is a fork).
    const rootId = (story as any).parentStory ?? (story as any)._id
    const root = await Story.findById(rootId).populate('author').lean()
    const forks = await Story.find({ parentStory: rootId }).populate('author').sort({ createdAt: 1 }).lean()

    res.json({
      original: root
        ? { id: String((root as any)._id), title: (root as any).title, by: (root as any).author?.name ?? 'Unknown' }
        : null,
      forks: forks.map((f: any) => ({
        id: String(f._id),
        kind: FORK_KIND_LABELS[f.forkKind] ?? 'FORK',
        title: f.title,
        by: f.author?.name ?? 'Unknown',
      })),
    })
  }),
)

// POST /api/stories/:id/fork  { kind }  -> creates a fork draft for the user.
storiesRouter.post(
  '/:id/fork',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!isId(req.params.id)) throw new HttpError(400, 'Invalid story id')
    const kind = String(req.body?.kind ?? 'ending')
    if (!FORK_KINDS.includes(kind as any)) throw new HttpError(400, 'Invalid fork kind')

    const parent = await Story.findById(req.params.id).populate('author').lean()
    if (!parent) throw new HttpError(404, 'Story not found')

    const firstChapter = (parent as any).chapters?.[0]
    const fork = await Story.create({
      title: `${(parent as any).title} — Your ${FORK_KIND_LABELS[kind]}`,
      author: req.userId,
      genres: (parent as any).genres,
      blurb: (parent as any).blurb,
      firstLine: (parent as any).firstLine,
      blindId: makeBlindId(),
      visibility: 'private',
      status: 'draft',
      parentStory: (parent as any)._id,
      forkKind: kind,
      chapters: (parent as any).chapters,
      scenes: (parent as any).scenes,
      draftChapterTitle: firstChapter?.title ?? 'Untitled chapter',
      draftBody: (firstChapter?.paras ?? []).join('\n\n'),
    })

    res.status(201).json({
      story: { id: String(fork._id), title: fork.title, forkKind: kind },
      parent: { id: String((parent as any)._id), title: (parent as any).title, by: (parent as any).author?.name },
    })
  }),
)

/* ------------------------------ Drafts --------------------------------- */
// POST /api/stories  -> create a blank draft owned by the user.
storiesRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { title, blurb, genres } = req.body ?? {}
    const story = await Story.create({
      title: title || 'Untitled story',
      author: req.userId,
      blurb: blurb || '',
      genres: Array.isArray(genres) ? genres : [],
      blindId: makeBlindId(),
      visibility: 'private',
      status: 'draft',
      draftChapterTitle: 'Chapter 1',
      draftBody: '',
    })
    res.status(201).json({ story: { id: String(story._id), title: story.title } })
  }),
)

// Guard: load a story and ensure the requester owns it.
async function loadOwned(req: AuthedRequest) {
  if (!isId(req.params.id)) throw new HttpError(400, 'Invalid story id')
  const story = await Story.findById(req.params.id)
  if (!story) throw new HttpError(404, 'Story not found')
  if (String(story.author) !== req.userId) throw new HttpError(403, 'Not your story')
  return story
}

// PATCH /api/stories/:id  -> update editable fields.
storiesRouter.patch(
  '/:id',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const story = await loadOwned(req)
    const b = req.body ?? {}
    if (typeof b.title === 'string') story.title = b.title
    if (typeof b.blurb === 'string') story.blurb = b.blurb
    if (Array.isArray(b.genres)) story.genres = b.genres.slice(0, 2)
    if (typeof b.draftChapterTitle === 'string') story.draftChapterTitle = b.draftChapterTitle
    if (typeof b.draftBody === 'string') story.draftBody = b.draftBody
    if (typeof b.visibility === 'string' && VISIBILITIES.includes(b.visibility)) {
      story.visibility = b.visibility
    }
    await story.save()
    res.json({ ok: true, story: { id: String(story._id), updatedAt: story.updatedAt } })
  }),
)

// PATCH /api/stories/:id/scenes/order  { order: [slug, ...] }
storiesRouter.patch(
  '/:id/scenes/order',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const story = await loadOwned(req)
    const order: string[] = Array.isArray(req.body?.order) ? req.body.order : []
    const bySlug = new Map(story.scenes.map((s: any) => [s.slug, s]))
    const reordered = order.map((slug) => bySlug.get(slug)).filter(Boolean)
    // Keep any scenes the client didn't mention, appended in original order.
    for (const s of story.scenes) if (!order.includes((s as any).slug)) reordered.push(s)
    story.scenes = reordered as any
    await story.save()
    res.json({ ok: true, scenes: story.scenes })
  }),
)

// POST /api/stories/:id/publish  { visibility, genres, title, blurb }
storiesRouter.post(
  '/:id/publish',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const story = await loadOwned(req)
    const b = req.body ?? {}
    if (typeof b.title === 'string' && b.title.trim()) story.title = b.title
    if (typeof b.blurb === 'string') story.blurb = b.blurb
    if (Array.isArray(b.genres) && b.genres.length) story.genres = b.genres.slice(0, 2)
    if (typeof b.visibility === 'string' && VISIBILITIES.includes(b.visibility)) {
      story.visibility = b.visibility
    }
    if (!story.firstLine && story.draftBody) {
      story.firstLine = story.draftBody.split(/(?<=[.!?])\s/)[0]?.slice(0, 160) ?? ''
    }
    story.status = 'published'
    await story.save()
    res.json({ ok: true, story: { id: String(story._id), status: story.status, visibility: story.visibility } })
  }),
)
