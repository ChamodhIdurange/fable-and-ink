import mongoose from 'mongoose'
import { Story } from '../models/Story.js'
import { User, publicUser } from '../models/User.js'

const FORK_KIND_LABELS: Record<string, string> = {
  ending: 'ALT ENDING',
  branch: 'BRANCH',
  spinoff: 'SPIN-OFF',
  altpov: 'ALT POV',
}

// Builds the Profile-screen payload: the author, their published stories, and
// the forks other writers have made of their work (each linking back).
export async function buildProfile(userId: string) {
  if (!mongoose.isValidObjectId(userId)) return null
  const user = await User.findById(userId)
  if (!user) return null

  const published = await Story.find({ author: userId, status: 'published' })
    .sort({ createdAt: -1 })
    .lean()

  // Fork counts for each published story (to render "N forks of her work").
  const publishedIds = published.map((s: any) => s._id)
  const forkRows = await Story.find({ parentStory: { $in: publishedIds } })
    .populate('author')
    .lean()

  const forkCountByStory = new Map<string, number>()
  for (const f of forkRows) {
    const key = String((f as any).parentStory)
    forkCountByStory.set(key, (forkCountByStory.get(key) ?? 0) + 1)
  }

  const publishedById = new Map(published.map((s: any) => [String(s._id), s]))

  const publishedCards = published.map((s: any) => {
    const reads = s.readCount >= 1000 ? `${(s.readCount / 1000).toFixed(1)}k` : String(s.readCount)
    const forks = forkCountByStory.get(String(s._id)) ?? 0
    const forkStr = forks > 0 ? ` · ${forks} fork${forks === 1 ? '' : 's'}` : ''
    return {
      id: String(s._id),
      title: s.title,
      genre: s.genres?.[0] ?? 'Literary',
      meta: `${reads} reads${forkStr} · ${s.status === 'draft' ? 'draft' : 'published'}`,
    }
  })

  const theirForks = forkRows.map((f: any) => ({
    id: String(f._id),
    kind: FORK_KIND_LABELS[f.forkKind] ?? 'FORK',
    title: f.title,
    by: f.author?.name ?? 'Unknown',
    from: publishedById.get(String(f.parentStory))?.title ?? 'a story',
  }))

  const totalForks = theirForks.length
  return {
    user: {
      ...publicUser(user),
      summary: `Writing since ${user.joinedYear} · ${published.length} published stories · ${totalForks} forks of her work`,
    },
    published: publishedCards,
    theirForks,
  }
}
