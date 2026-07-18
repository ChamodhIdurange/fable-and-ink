import { Schema, model, InferSchemaType } from 'mongoose'

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    initials: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    bio: { type: String, default: '' },
    joinedYear: { type: Number, default: 2024 },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export type UserDoc = InferSchemaType<typeof userSchema>
export const User = model('User', userSchema)

// Shape returned to clients — never leak the password hash.
export function publicUser(u: any) {
  return {
    id: String(u._id),
    name: u.name,
    initials: u.initials,
    bio: u.bio,
    joinedYear: u.joinedYear,
  }
}
