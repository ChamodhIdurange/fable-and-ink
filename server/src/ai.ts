// AI features, powered by the Google AI (Gemini) API.
//
// Beautify and Story Health call Gemini with a strict JSON response schema and
// validate everything before it reaches the client. If the configured model is
// exhausted (rate limit / quota) or unavailable, the call falls through a
// chain of free Gemini models; when every model in the chain is out, an
// AiUnavailableError bubbles up and the client shows a "try again later"
// message. The built-in stubs are used only when no GEMINI_API_KEY is
// configured, so local dev still works with zero setup. Narration remains
// stubbed (it would need a TTS provider; Gemini's TTS models are preview-only).

import { config } from './config.js'

export interface Suggestion {
  id: number
  kind: string
  original: string
  revised: string
  why: string
}

export interface HealthNote {
  kind: string
  severity: 'info' | 'warn'
  text: string
  scene?: string | null
}

export interface StoryContext {
  title: string
  blurb: string
  chapterTitles: string[]
  scenes: Array<{ slug: string; title: string; ch: number; words: string; flag: string }>
  draftChapterTitle: string
  draftBody: string
}

export type AiSource = 'gemini' | 'stub'

// Thrown when every model in the chain is exhausted or unreachable. The route
// turns this into a 503 with a friendly "try again later" message.
export class AiUnavailableError extends Error {
  constructor() {
    super('All Gemini models are at capacity or unavailable')
  }
}

/* ----------------------------- Gemini client ---------------------------- */

const GEMINI_URL = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

// Free-tier models to fall through when the primary is exhausted (429) or
// unavailable. The configured model always goes first.
const FALLBACK_MODELS = ['gemini-flash-lite-latest', 'gemini-2.0-flash', 'gemini-2.0-flash-lite']

function modelChain(): string[] {
  return [...new Set([config.geminiModel, ...FALLBACK_MODELS])]
}

// One prompt, JSON in → parsed JSON out. Walks the model chain: any failure
// (quota exhausted, model retired, timeout, 5xx) moves on to the next model.
// Throws AiUnavailableError when the whole chain is out.
async function callGemini(prompt: string, responseSchema: object): Promise<unknown> {
  for (const model of modelChain()) {
    try {
      const res = await fetch(GEMINI_URL(model), {
        method: 'POST',
        headers: {
          'x-goog-api-key': config.geminiApiKey!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: 'application/json',
            responseSchema,
          },
        }),
        signal: AbortSignal.timeout(30_000),
      })
      if (!res.ok) {
        const detail = (await res.text()).slice(0, 300)
        console.warn(`[ai] ${model} returned ${res.status}${res.status === 429 ? ' (quota exhausted)' : ''}: ${detail} — trying next model`)
        continue
      }
      const data: any = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (typeof text !== 'string') {
        console.warn(`[ai] ${model} returned no text candidate — trying next model`)
        continue
      }
      if (model !== config.geminiModel) console.warn(`[ai] served by fallback model ${model}`)
      return JSON.parse(text)
    } catch (err: any) {
      console.warn(`[ai] ${model} call failed: ${err?.message ?? err} — trying next model`)
    }
  }
  throw new AiUnavailableError()
}

/* ------------------------------- Beautify ------------------------------- */

const BEAUTIFY_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      kind: { type: 'STRING' },
      original: { type: 'STRING' },
      revised: { type: 'STRING' },
      why: { type: 'STRING' },
    },
    required: ['kind', 'original', 'revised', 'why'],
  },
} as const

// Voice-preserving polish: micro-edits the author accepts or skips one by one.
export async function generateBeautify(text: string): Promise<{ suggestions: Suggestion[]; source: AiSource }> {
  const prompt = `You are "Beautify", the voice-preserving polish feature of Fable & Ink, a storytelling platform.
Given a fiction draft, suggest 2 to 5 small copyedits. Rules:
- Each "original" MUST be one exact, contiguous sentence or phrase copied VERBATIM from the draft (same punctuation, casing and spacing), and must appear exactly once in it.
- Fix only mechanics: grammar, punctuation, comma splices, "was ...-ing" filler, repeated words, rhythm. NEVER change plot, imagery, word choice beyond the fix, or the author's voice.
- "kind" is a one-word label such as Rhythm, Grammar, Punctuation or Clarity.
- "why" is one short, warm sentence explaining the fix and, where apt, noting the author's voice is untouched.
- If the draft is already clean, return fewer suggestions or an empty array. Never invent problems.

DRAFT:
${text.slice(0, 12_000)}`

  if (!config.geminiApiKey) return { suggestions: stubBeautify(text), source: 'stub' }

  const raw = await callGemini(prompt, BEAUTIFY_SCHEMA) // throws AiUnavailableError when the chain is out
  if (!Array.isArray(raw)) throw new AiUnavailableError()

  const seen = new Set<string>()
  const suggestions: Suggestion[] = []
  for (const s of raw as any[]) {
    if (
      typeof s?.kind === 'string' &&
      typeof s?.original === 'string' &&
      typeof s?.revised === 'string' &&
      typeof s?.why === 'string' &&
      s.original !== s.revised &&
      s.original.length > 0 &&
      text.includes(s.original) && // the client applies edits via exact replace
      !seen.has(s.original)
    ) {
      seen.add(s.original)
      suggestions.push({ id: suggestions.length + 1, kind: s.kind, original: s.original, revised: s.revised, why: s.why })
    }
    if (suggestions.length >= 6) break
  }
  return { suggestions, source: 'gemini' }
}

/* ------------------------------ Story Health ---------------------------- */

const HEALTH_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      kind: { type: 'STRING' },
      severity: { type: 'STRING', enum: ['info', 'warn'] },
      text: { type: 'STRING' },
      scene: { type: 'STRING' },
    },
    required: ['kind', 'severity', 'text'],
  },
} as const

// Structural notes — "notes, not verdicts". Reads the story's real structure.
export async function generateHealth(story: StoryContext): Promise<{ notes: HealthNote[]; source: AiSource }> {
  const sceneList = story.scenes.map((s) => `- slug "${s.slug}": "${s.title}" (Ch. ${s.ch}, ${s.words} words${s.flag ? `, flagged: ${s.flag}` : ''})`).join('\n')
  const prompt = `You are "Story Health" on Fable & Ink — a friendly structural read of a fiction draft. Your notes are observations, never verdicts; the story belongs to the author.
Return 3 to 5 notes. Rules:
- "kind" is a one-word lens: Pacing, Character, Setup, Dialogue, Continuity or similar.
- "severity" is "warn" for something likely worth acting on, "info" for an observation.
- "text" is 1–2 warm, specific sentences (max ~220 characters) grounded in THIS story — name chapters, scenes or characters where possible.
- "scene": when a note is about one scene, set it to that scene's slug from the list below; otherwise omit it.

STORY: "${story.title}" — ${story.blurb}
CHAPTERS: ${story.chapterTitles.map((t, i) => `${i + 1}. ${t}`).join(' · ') || '(none published yet)'}
SCENES:
${sceneList || '(no scene cards)'}
CURRENT DRAFT CHAPTER ("${story.draftChapterTitle}"):
${story.draftBody.slice(0, 10_000)}`

  if (!config.geminiApiKey) return { notes: stubHealth(), source: 'stub' }

  const raw = await callGemini(prompt, HEALTH_SCHEMA) // throws AiUnavailableError when the chain is out
  if (!Array.isArray(raw)) throw new AiUnavailableError()

  const slugs = new Set(story.scenes.map((s) => s.slug))
  const notes: HealthNote[] = []
  for (const n of raw as any[]) {
    if (typeof n?.kind === 'string' && typeof n?.text === 'string' && (n.severity === 'info' || n.severity === 'warn')) {
      notes.push({
        kind: n.kind,
        severity: n.severity,
        text: n.text,
        scene: typeof n.scene === 'string' && slugs.has(n.scene) ? n.scene : null,
      })
    }
    if (notes.length >= 5) break
  }
  return { notes, source: 'gemini' }
}

/* ------------------------------- Narration ------------------------------ */

// Adaptive narration. Still stubbed: a real implementation would call a TTS
// provider and return a streamable URL; the player simulates playback.
export function generateNarration(durationSecs: number) {
  return {
    stub: true,
    durationSecs,
    audioUrl: null as string | null,
    voice: 'adaptive-default',
    note: 'Narration is stubbed — the player simulates playback against durationSecs.',
  }
}

/* ----------------------- Stub fallbacks (no API key) --------------------- */

function stubBeautify(text: string): Suggestion[] {
  const out: Suggestion[] = []
  let id = 1
  const rules: Array<{ kind: string; test: RegExp; fix: (m: RegExpMatchArray) => string; why: string }> = [
    {
      kind: 'Rhythm',
      test: /She was walking slowly through the wet orchard, and she was thinking about the letter again\./,
      fix: () => 'She walked slowly through the wet orchard, thinking about the letter again.',
      why: 'Trims “was …-ing” filler. Your pacing and word choice stay yours.',
    },
    {
      kind: 'Grammar',
      test: /The tide had taken the lower field in March, it had not given it back\./,
      fix: () => 'The tide had taken the lower field in March; it had not given it back.',
      why: 'Mends the comma splice; keeps the flat, declarative cadence.',
    },
    {
      kind: 'Punctuation',
      test: /Salt had gotten into everything, the door hinges, the bread, her handwriting\./,
      fix: () => 'Salt had gotten into everything — the door hinges, the bread, her handwriting.',
      why: 'Sets the list off cleanly. The triad itself is untouched.',
    },
  ]
  for (const r of rules) {
    const m = text.match(r.test)
    if (m) out.push({ id: id++, kind: r.kind, original: m[0], revised: r.fix(m), why: r.why })
  }
  return out
}

function stubHealth(): HealthNote[] {
  return [
    {
      kind: 'Pacing',
      severity: 'warn',
      text: 'Ch. 2 runs three reflective scenes in a row. Moving “The Ferry” earlier would give the middle a heartbeat.',
      scene: 'ferry',
    },
    {
      kind: 'Character',
      severity: 'warn',
      text: 'Tomas hasn’t appeared since Ch. 1, but he’s named in your ending notes. Worth a sighting before Ch. 4.',
      scene: null,
    },
    {
      kind: 'Setup',
      severity: 'info',
      text: 'The unopened letter from Ch. 1 hasn’t paid off yet. “The Reading” looks like its natural home.',
      scene: 'reading',
    },
    {
      kind: 'Dialogue',
      severity: 'info',
      text: 'Ch. 3 is 4% dialogue against your usual 18%. Fine if the silence is deliberate — it reads that way.',
      scene: 'inventory',
    },
  ]
}
