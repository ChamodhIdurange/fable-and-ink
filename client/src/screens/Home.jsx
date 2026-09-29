import { useState } from 'react'
import { pubGenreOptions, genreColor, genreCounts } from '../data.js'
import Aurora from '../components/Aurora.jsx'
import Reveal from '../components/Reveal.jsx'
import StoryCard from '../components/StoryCard.jsx'
import {
  IconEyeOff,
  IconAudioLines,
  IconSparkles,
  IconActivity,
  IconGitFork,
  IconArrowRight,
} from '../components/Icon.jsx'

const features = [
  {
    tint: '#3b82d4',
    title: 'Listen to any chapter',
    body: 'AI narration that reads the room — pace tightens in the tense scenes, breathes in the calm ones.',
    Icon: IconAudioLines,
  },
  {
    tint: '#4eb86a',
    title: 'Beautify, not rewrite',
    body: 'Grammar and rhythm polish that keeps your voice. Every change is a suggestion you accept or skip.',
    Icon: IconSparkles,
  },
  {
    tint: '#e8822a',
    title: 'Story Health Check',
    body: 'Pacing dips, missing characters, setups that never pay off — flagged as friendly notes, never verdicts.',
    Icon: IconActivity,
  },
  {
    tint: '#d44f78',
    title: 'Fork & remix',
    body: 'Alternate endings, new branches, spin-offs — every fork keeps a living link back to the original.',
    Icon: IconGitFork,
  },
]

const steps = [
  {
    title: 'Read it blind',
    body: 'Flip one switch and names and numbers vanish. You pick what to read from the first line alone.',
  },
  {
    title: 'Write it your way',
    body: 'Draft in a clean editor. Beautify mends the seams and Story Health flags the pacing — both only ever suggest.',
  },
  {
    title: 'Fork it forward',
    body: 'Loved it but wanted a different ending? Fork the story into your drafts. The link back is permanent.',
  },
]

const faqs = [
  {
    q: 'What exactly does Blind Read hide?',
    a: 'Author names, read counts and fork counts — every popularity signal. In their place each story shows its opening line, so you choose on the writing. Flip it back whenever you like; the setting follows you into Discover.',
  },
  {
    q: 'Will Beautify rewrite my voice?',
    a: 'No. It returns individual suggestions with the original and the revision side by side, plus the reason. Nothing touches your draft until you press Accept, and you can skip any of them.',
  },
  {
    q: 'What happens when someone forks my story?',
    a: 'They get a copy in their own drafts and your original keeps a permanent, visible link from their version. Forks come in three kinds — alternate ending, new branch, or spin-off — and all of them appear in your remix tree.',
  },
  {
    q: 'Is the narration a real recording?',
    a: 'It is generated, and it adapts to the scene — the pace tightens through tension and opens up in quieter passages. You can change playback speed while you listen.',
  },
]

const prompts = ['A lighthouse and a ledger', 'Something short for the train', 'Sci-fi off the coast of Lagos']

const compact = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n ?? 0)
}

export default function Home({ go, tryBlind, openStory, pickCategory, search, samples = [] }) {
  const [query, setQuery] = useState('')

  // Counters and faces come from the live feed, so the page never claims more
  // than the shelf actually holds.
  const totalReads = samples.reduce((n, s) => n + (s.readCount ?? 0), 0)
  const authors = [...new Map(samples.map((s) => [s.authorId ?? s.author, s])).values()].slice(0, 7)
  const lead = samples[0]

  const submit = (e) => {
    e.preventDefault()
    search(query)
  }

  return (
    <main data-screen-label="Home" className="fi-page fi-page--full">
      {/* Hero — the primary action is the field, not a button pair. */}
      <section className="fi-hero">
        <div className="fi-hero__inner">
          <h1 className="fi-hero__title">
            Tell us what you feel like reading.
            <em>We&rsquo;ll find the story.</em>
          </h1>

          <p className="fi-hero__lede">
            Fable&amp;Ink is where stories get read for how they&rsquo;re written — not who wrote
            them.
          </p>

          <form className="fi-search" onSubmit={submit}>
            <input
              className="fi-search__input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="A quiet mystery in a coastal town, under 20 minutes…"
              aria-label="What do you feel like reading?"
            />
            <div className="fi-search__row">
              <span className="meta fi-search__hint">
                No idea? Just hit search — we&rsquo;ll open the whole shelf.
              </span>
              <button type="submit" className="nxb-btn nxb-btn--primary nxb-btn--sm">
                Find my story
                <IconArrowRight size={16} />
              </button>
            </div>
          </form>

          <div className="fi-search__chips">
            {prompts.map((t) => (
              <button
                key={t}
                type="button"
                className="fi-chip"
                onClick={() => {
                  setQuery(t)
                  search(t)
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {authors.length > 0 && (
            <div className="fi-proof">
              <div className="fi-proof__avatars">
                {authors.map((a) => (
                  <span
                    key={a.id}
                    className="fi-avatar fi-avatar--sm"
                    title={a.author}
                    style={{ '--fi-tint': a.genreColor || genreColor(a.genre) }}
                  >
                    {a.initials}
                  </span>
                ))}
              </div>
              <span className="fi-proof__text">
                <strong>{compact(totalReads)}</strong> reads across{' '}
                <strong>{samples.length}</strong> stories · <strong>0</strong> follower counts
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Pull quote — a real opening line from the shelf, not a testimonial. */}
      {lead && (
        <Reveal as="section" className="fi-quote">
          <p className="fi-quote__text">&ldquo;{lead.blurb}&rdquo;</p>
          <span className="fi-quote__cite">
            <strong>{lead.title}</strong> · {lead.author} · {lead.readTime} min read
          </span>
        </Reveal>
      )}

      {/* Blind Read banner */}
      <Reveal className="fi-blind-banner-wrap" as="section">
        <div className="fi-blind-banner">
          <span className="fi-blind-banner__icon">
            <IconEyeOff size={26} />
          </span>
          <div className="fi-blind-banner__copy">
            <h2 className="h2">Blind Read — our answer to follower-count fiction</h2>
            <p className="body" style={{ margin: 0 }}>
              Flip one switch and every author name, read count and fork count disappears. Stories
              stand on their first line alone.
            </p>
          </div>
          <button className="nxb-btn nxb-btn--inverse nxb-btn--sm" onClick={tryBlind} style={{ flex: 'none' }}>
            Try Blind Read
          </button>
        </div>
      </Reveal>

      {/* Feature grid */}
      <section className="fi-home-section">
        <Reveal>
          <span className="fi-eyebrow">What you get</span>
        </Reveal>
        <div className="fi-grid fi-grid--features">
          {features.map(({ tint, title, body, Icon }, i) => (
            <Reveal key={title} delay={i * 90}>
              <div className="fi-feature-card" style={{ '--fi-tint': tint }}>
                <span className="fi-feature-card__icon">
                  <Icon size={22} />
                </span>
                <h3 className="h3">{title}</h3>
                <p className="body-s" style={{ color: 'var(--fi-ink-3)' }}>
                  {body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="fi-home-section">
        <Reveal>
          <span className="fi-eyebrow">How it works</span>
          <div className="fi-section-head">
            <h2 className="h1">Read it. Write it. Fork it.</h2>
          </div>
        </Reveal>
        <div className="fi-steps">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 90}>
              <div className="fi-step">
                <span className="fi-step__num">{i + 1}</span>
                <h3 className="h3">{s.title}</h3>
                <p className="body-s">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Browse by category */}
      <section className="fi-home-section">
        <Reveal>
          <span className="fi-eyebrow">Every genre, one shelf</span>
          <div className="fi-section-head">
            <h2 className="h1">Browse by category</h2>
          </div>
        </Reveal>
        <div className="fi-grid fi-grid--cats">
          {pubGenreOptions.map((g, i) => (
            <Reveal key={g} delay={i * 60}>
              <button
                className="fi-cat-card"
                data-initial={g.charAt(0)}
                onClick={() => pickCategory(g)}
                style={{ '--fi-tint': genreColor(g), width: '100%' }}
              >
                <span className="fi-cat-card__name">{g}</span>
                <span className="meta">{genreCounts[g] || '1k'} stories</span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Fresh off the press */}
      <section className="fi-home-section">
        <Reveal>
          <span className="fi-eyebrow">Just published</span>
          <div className="fi-section-head">
            <h2 className="h1">Fresh off the press</h2>
            <button className="nxb-pill" onClick={() => go('discover')} style={{ marginLeft: 'auto' }}>
              Discover more
              <IconArrowRight size={14} />
            </button>
          </div>
        </Reveal>
        <div className="fi-grid fi-grid--stories">
          {samples.slice(0, 6).map((hs, i) => (
            <Reveal key={hs.id} delay={i * 80}>
              <StoryCard story={hs} onOpen={openStory} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="fi-home-section fi-home-section--last">
        <Reveal>
          <span className="fi-eyebrow">Questions</span>
          <div className="fi-section-head">
            <h2 className="h1">Before you start</h2>
          </div>
        </Reveal>
        <Reveal className="fi-faq">
          {faqs.map(({ q, a }) => (
            <details key={q} className="fi-faq__item">
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </Reveal>
      </section>

      {/* Closing CTA */}
      <section className="fi-cta">
        <Aurora />
        <div className="fi-cta__inner">
          <h2 className="fi-cta__title">
            Your story, discovered on <em>merit</em>.
          </h2>
          <p className="fi-cta__sub">No follower counts. No algorithm games. Just the work.</p>
          <button className="nxb-btn nxb-btn--primary nxb-btn--md" onClick={() => go('discover')}>
            Browse the shelves
            <IconArrowRight size={16} />
          </button>
        </div>
      </section>

      <footer className="fi-footer">
        <div className="fi-footer__inner">
          <span className="fi-logo" aria-hidden="true">
            Fable<span className="slash">&amp;Ink</span>
          </span>
          <div className="fi-footer__links">
            <button onClick={() => go('discover')}>Discover</button>
            <button onClick={() => go('editor')}>Write</button>
            <button onClick={tryBlind}>Blind Read</button>
            <button onClick={() => go('profile')}>Profile</button>
          </div>
          <span className="meta">Read it. Write it. Fork it.</span>
        </div>
      </footer>
    </main>
  )
}
