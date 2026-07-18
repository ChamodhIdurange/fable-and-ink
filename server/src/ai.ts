// Stubbed AI features. The API shape and behaviour mirror what real
// integrations would return, so swapping in live models later is a drop-in
// change with no client changes required.
//
// TODO(real AI): Beautify and Health Check are natural fits for the Claude API
//   (claude-opus-4-8 / claude-sonnet-5). Replace the bodies of generateBeautify
//   and generateHealth with an Anthropic SDK call that returns the same shape.
//   Narration would call a TTS provider and return a real audio URL.

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

// Voice-preserving polish. The stub recognises a few common issues by scanning
// the text; anything it doesn't find simply isn't suggested — never a rewrite.
export function generateBeautify(text: string): Suggestion[] {
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

// Structural notes — "notes, not verdicts". Stubbed to the demo story's issues.
export function generateHealth(_storyId: string): HealthNote[] {
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

// Adaptive narration. The stub returns the chapter's known duration; a real
// implementation would synthesise audio and return a streamable URL.
export function generateNarration(durationSecs: number) {
  return {
    stub: true,
    durationSecs,
    audioUrl: null as string | null,
    voice: 'adaptive-default',
    note: 'Narration is stubbed — the player simulates playback against durationSecs.',
  }
}
