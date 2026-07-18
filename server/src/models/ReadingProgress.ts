import { Schema, model, InferSchemaType } from 'mongoose'

// Per-user, per-story reading position. Powers the "Continue reading" card.
const readingProgressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    story: { type: Schema.Types.ObjectId, ref: 'Story', required: true },
    chapterIndex: { type: Number, default: 0 },
    percent: { type: Number, default: 0 }, // 0–100 within the current chapter
  },
  { timestamps: true },
)

readingProgressSchema.index({ user: 1, story: 1 }, { unique: true })

export type ReadingProgressDoc = InferSchemaType<typeof readingProgressSchema>
export const ReadingProgress = model('ReadingProgress', readingProgressSchema)
