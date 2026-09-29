import { genreOptions, genreColor } from '../data.js'
import Reveal from '../components/Reveal.jsx'
import StoryCard from '../components/StoryCard.jsx'
import { IconEyeOff, IconBook } from '../components/Icon.jsx'

const pill = (on) => (on ? 'nxb-pill nxb-pill--selected' : 'nxb-pill')

export default function Discover({
  blindRead,
  toggleBlind,
  genreFilter,
  setGenreFilter,
  searchQuery = '',
  setSearchQuery,
  openStory,
  stories = [],
  progress,
}) {
  // The feed API filters by genre and applies the Blind Read transform; the
  // free-text query is matched here against what the server already returned.
  const q = searchQuery.trim().toLowerCase()
  const feed = q
    ? stories.filter((s) =>
        [s.title, s.blurb, s.genre, s.blind ? '' : s.author]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q)),
      )
    : stories
  return (
    <main data-screen-label="Discover" className="fi-page fi-page--wide">
      {/* Hero */}
      <section className="fi-disc-hero">
        <div className="fi-disc-hero__copy">
          <span className="fi-eyebrow" style={{ marginBottom: 2 }}>
            Discover
          </span>
          <h1 className="fi-disc-hero__title">
            Stories that <em>earn</em> the read.
          </h1>
          <p className="fi-disc-hero__sub">
            Written by anyone. Discovered on craft, not follower count.
          </p>
        </div>
        <div className="fi-blind-toggle">
          <span className="fi-blind-toggle__label">Blind Read</span>
          <button
            className={`fi-switch${blindRead ? ' is-on' : ''}`}
            onClick={toggleBlind}
            role="switch"
            aria-checked={blindRead}
            aria-label="Toggle Blind Read"
          >
            <span className="fi-switch__knob" />
          </button>
        </div>
      </section>

      {/* Blind Read active notice */}
      {blindRead && (
        <div className="fi-blind-note">
          <IconEyeOff size={16} style={{ color: 'var(--fi-accent)', flex: 'none' }} />
          <span className="body" style={{ flex: 1, minWidth: 200 }}>
            Blind Read is on — authors, reads and fork counts are hidden. Every story opens with its
            first line instead.
          </span>
          <span className="fi-tag fi-tag--outline fi-blind-note__badge">BLIND · ON</span>
        </div>
      )}

      {/* Continue reading — only when the reader has a saved position */}
      {progress && (
        <div className="fi-continue fi-row-hover" onClick={() => openStory(progress.storyId)}>
          <IconBook size={20} style={{ color: 'var(--fi-ink-3)', flex: 'none' }} />
          <div className="fi-stack fi-stack--8" style={{ flex: 1, minWidth: 0 }}>
            <div className="fi-continue__meta">
              <span className="body" style={{ color: 'var(--fi-ink)', fontWeight: 500 }}>
                {progress.title}
              </span>
              <span className="meta">
                {progress.chapterLabel} · {Math.round(progress.percent)}% read
              </span>
            </div>
            <div className="fi-progress">
              <span className="fi-progress__fill" style={{ width: `${progress.percent}%` }} />
            </div>
          </div>
          <button
            className="nxb-btn nxb-btn--secondary nxb-btn--sm"
            style={{ flex: 'none' }}
            onClick={(e) => {
              e.stopPropagation()
              openStory(progress.storyId)
            }}
          >
            Resume
          </button>
        </div>
      )}

      {/* Active search */}
      {q && (
        <div className="fi-searchbar">
          <span className="body" style={{ flex: 1, minWidth: 180 }}>
            {feed.length} {feed.length === 1 ? 'story' : 'stories'} matching{' '}
            <strong style={{ color: 'var(--fi-ink)' }}>&ldquo;{searchQuery}&rdquo;</strong>
          </span>
          <button className="nxb-pill" onClick={() => setSearchQuery('')}>
            Clear search
          </button>
        </div>
      )}

      {/* Genre filters */}
      <div className="fi-filters">
        {genreOptions.map((g) => (
          <button key={g} className={pill(genreFilter === g)} onClick={() => setGenreFilter(g)}>
            {g !== 'All' && <span className="fi-genre-dot" style={{ background: genreColor(g) }} />}
            {g}
          </button>
        ))}
      </div>

      {/* Feed */}
      {feed.length > 0 ? (
        <div className="fi-grid--feed">
          {feed.map((st, i) => (
            <Reveal key={st.id} delay={Math.min(i, 5) * 70}>
              <StoryCard story={st} onOpen={openStory} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="fi-empty">
          <p className="body" style={{ margin: 0 }}>
            {q
              ? `Nothing matches “${searchQuery}” yet.`
              : `Nothing on this shelf yet${genreFilter !== 'All' ? ` under ${genreFilter}` : ''}.`}
          </p>
          {(q || genreFilter !== 'All') && (
            <button
              className="nxb-btn nxb-btn--secondary nxb-btn--sm"
              onClick={() => {
                setSearchQuery('')
                setGenreFilter('All')
              }}
            >
              Show every story
            </button>
          )}
        </div>
      )}
    </main>
  )
}
