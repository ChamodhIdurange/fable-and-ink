# Fable & Ink — Backend API

Node + TypeScript (Express + Mongoose) API for the Fable & Ink storytelling
platform. Runs with **zero setup**: if no `MONGO_URI` is configured it starts an
in-memory MongoDB and seeds it with the demo world on boot.

## Run

```bash
npm install
npm run dev        # http://localhost:4000 — tsx watch, auto-reload
# or
npm run build && npm start
npm run seed       # drop + reseed (standalone)
npm run typecheck
```

Config is via env vars (see `.env.example`) — copy to `.env` to override. Set
`MONGO_URI` to use a real MongoDB instead of the in-memory one.

## Auth

Session tokens are JWTs sent as `Authorization: Bearer <token>`.

- `POST /api/auth/demo` — log in as the seeded demo author (June Okafor). The
  frontend calls this on load, since the design has no sign-up screen.
- `POST /api/auth/login` `{ email, password }` — all seeded authors share the
  demo password (`password` by default).
- `GET  /api/auth/me` — the current user.

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/health` | liveness |
| GET | `/api/stories?genre=&blind=` | Discover feed (originals only). **`blind=true` strips author + stats server-side** and returns `blindId` + `firstLine`. |
| GET | `/api/stories/:id?blind=` | story detail + chapters (scenes/draft only for the owner) |
| GET | `/api/stories/:id/forks` | remix tree — `{ original, forks[] }` |
| POST | `/api/stories/:id/fork` | `{ kind }` → creates a fork draft (auth) |
| POST | `/api/stories` | create a draft (auth) |
| PATCH | `/api/stories/:id` | update title/blurb/genres/visibility/draft body (owner) |
| PATCH | `/api/stories/:id/scenes/order` | `{ order: [slug] }` reorder Arrange cards (owner) |
| POST | `/api/stories/:id/publish` | publish a draft (owner) |
| GET | `/api/me/profile` | profile payload (author, published, forks of their work) |
| GET | `/api/me/stories` | the user's own stories |
| GET | `/api/me/draft` | the current working draft (for the editor) |
| GET | `/api/me/progress` | most recent reading position |
| PUT | `/api/me/progress` | `{ storyId, chapterIndex, percent }` upsert |
| GET | `/api/users/:id/profile` | public author profile |
| POST | `/api/ai/beautify` | `{ text }` → voice-preserving suggestions *(stubbed)* |
| POST | `/api/ai/health` | `{ storyId }` → Story Health notes *(stubbed)* |
| POST | `/api/ai/narrate` | `{ storyId, chapterIndex }` → narration metadata *(stubbed)* |

## Data model

- **User** — author (name, initials, email, bio, joinedYear).
- **Story** — the core document. Embeds `chapters[]` (prose + narration
  duration) and `scenes[]` (Arrange cards). A **fork is a Story** with
  `parentStory` + `forkKind` set. Drafts hold `draftBody`/`draftChapterTitle`
  separate from published `chapters`.
- **ReadingProgress** — per-user, per-story position.

## AI (stubbed)

`src/ai.ts` returns realistic, correctly-shaped responses without external
calls. Each function has a `TODO(real AI)` marker — Beautify and Health Check
are drop-in targets for the Claude API (`claude-opus-4-8` / `claude-sonnet-5`),
and narration for a TTS provider — with no client changes needed.
