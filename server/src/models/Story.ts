import { Schema, model, InferSchemaType, Types } from 'mongoose'

// A chapter of published prose. `secs` is the narration duration (drives the
// Listen player); `mins` is the human-facing read/listen estimate.
const chapterSchema = new Schema(
  {
    title: { type: String, required: true },
    mins: { type: Number, default: 0 },
    secs: { type: Number, default: 0 },
    paras: { type: [String], default: [] },
  },
  { _id: false },
)

// A scene is a sub-unit shown in the editor's Arrange board. `slug` is a stable
// id used to link Story Health notes to a card; array order is the scene order.
const sceneSchema = new Schema(
  {
    slug: { type: String, required: true },
    title: { type: String, required: true },
    ch: { type: Number, default: 1 },
    words: { type: String, default: '0' },
    flag: { type: String, default: '' },
  },
  { _id: false },
)

export const FORK_KINDS = ['ending', 'branch', 'spinoff', 'altpov'] as const
export const VISIBILITIES = ['public', 'unlisted', 'private'] as const
export const STATUSES = ['draft', 'published'] as const

const storySchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    genres: { type: [String], default: [] },
    blurb: { type: String, default: '' },
    firstLine: { type: String, default: '' },
    blindId: { type: String, required: true, index: true },
    readCount: { type: Number, default: 0 },

    visibility: { type: String, enum: VISIBILITIES, default: 'public' },
    status: { type: String, enum: STATUSES, default: 'draft' },

    // Fork lineage. A fork is simply a Story that points back to its parent.
    parentStory: { type: Schema.Types.ObjectId, ref: 'Story', default: null },
    forkKind: { type: String, enum: FORK_KINDS, default: null },

    chapters: { type: [chapterSchema], default: [] },
    scenes: { type: [sceneSchema], default: [] },

    // The editor's working draft (a single in-progress chapter). Kept separate
    // from published `chapters` so editing never mutates live prose.
    draftChapterTitle: { type: String, default: '' },
    draftBody: { type: String, default: '' },
  },
  { timestamps: true },
)

storySchema.index({ status: 1, visibility: 1 })
storySchema.index({ parentStory: 1 })

export type StoryDoc = InferSchemaType<typeof storySchema> & { _id: Types.ObjectId }
export const Story = model('Story', storySchema)

const GENRE_COLORS: Record<string, string> = {
  Mystery: '#3b82d4',
  'Sci-fi': '#00b8c8',
  Fantasy: '#9b3fb8',
  Romance: '#d44f78',
  YA: '#e8822a',
  Literary: '#4eb86a',
  Horror: '#b73030',
  'Short fiction': '#00b8c8',
}

function readStats(s: any): string {
  const reads = s.readCount >= 1000 ? `${(s.readCount / 1000).toFixed(1)}k` : String(s.readCount)
  const forks = s.forkCount ?? 0
  const forkStr = forks > 0 ? ` · ${forks} fork${forks === 1 ? '' : 's'}` : ''
  return `${reads} reads${forkStr}`
}

// Card representation for feeds. When `blind` is true the author identity and
// social stats are stripped SERVER-SIDE — Blind Read is a real guarantee, not a
// CSS trick — and the story is surfaced by genre + first line only.
export function storyCard(s: any, opts: { blind?: boolean } = {}) {
  const genre = s.genres?.[0] ?? 'Literary'
  const author = s.author && typeof s.author === 'object' ? s.author : null
  const base = {
    id: String(s._id),
    title: s.title,
    genre,
    genres: s.genres ?? [],
    genreColor: GENRE_COLORS[genre] ?? '#6b6b6b',
    blurb: s.blurb,
    readTime: s.chapters?.reduce((m: number, c: any) => m + (c.mins ?? 0), 0) || s.readTime || 0,
  }
  if (opts.blind) {
    return { ...base, blind: true, blindId: s.blindId, firstLine: s.firstLine }
  }
  return {
    ...base,
    blind: false,
    author: author?.name ?? 'Unknown',
    authorId: author ? String(author._id) : null,
    initials: author?.initials ?? '??',
    readCount: s.readCount,
    forkCount: s.forkCount ?? 0,
    stats: readStats(s),
  }
}

export { GENRE_COLORS }
