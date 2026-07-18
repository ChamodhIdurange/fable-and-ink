import { genreOptions, genreColor } from '../data.js'
import { IconEyeOff, IconBook, IconClock } from '../components/Icon.jsx'

const pill = (on) => (on ? 'nxb-pill nxb-pill--selected' : 'nxb-pill')

export default function Discover({
  blindRead,
  toggleBlind,
  genreFilter,
  setGenreFilter,
  openStory,
  stories = [],
  progress,
}) {
  // The server already filters by genre and applies the Blind Read transform;
  // here we only derive per-card styling from the genre color + blind flag.
  const feed = stories.map((s) => {
    const c = s.genreColor || genreColor(s.genre)
    const blind = s.blind
    return {
      ...s,
      tagColor: blind ? `color-mix(in srgb, ${c} 60%, #ffffff)` : c,
      tagBg: blind
        ? `color-mix(in srgb, ${c} 22%, transparent)`
        : `color-mix(in srgb, ${c} 10%, transparent)`,
      cardBg: blind ? 'var(--nxb-surface-4)' : 'var(--fi-card)',
      cardBorder: blind ? 'rgba(255, 255, 255, 0.08)' : 'var(--nxb-border-low)',
      washBg: blind ? 'rgba(255, 255, 255, 0.05)' : `color-mix(in srgb, ${c} 14%, transparent)`,
      titleColor: blind ? '#fafafa' : 'var(--nxb-text-primary)',
      bodyColor: blind ? '#c7c7c7' : 'var(--nxb-text-secondary)',
      metaColor: blind ? '#afafaf' : 'var(--nxb-text-muted)',
    }
  })

  return (
    <main data-screen-label="Discover" className="fi-page fi-page--wide">
      {/* Hero */}
      <section className="fi-disc-hero">
        <span className="fi-hero__glow fi-hero__glow--write" aria-hidden="true" style={{ opacity: 0.16 }} />
        <div className="fi-disc-hero__copy">
          <span className="fi-kicker" style={{ fontSize: 11 }}>
            Discover
          </span>
          <h1 className="fi-disc-hero__title">Stories that earn the read.</h1>
          <p className="fi-disc-hero__sub">
            Written by <span style={{ color: '#a867ee' }}>{'{anyone}'}</span>. Discovered on craft,
            not follower count.
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
          <IconEyeOff size={16} style={{ color: 'var(--nxb-text-muted)', flex: 'none' }} />
          <span className="body" style={{ color: 'var(--nxb-text-secondary)', flex: 1, minWidth: 200 }}>
            Blind Read is on — authors, reads and fork counts are hidden. Every story opens with its
            first line instead.
          </span>
          <span className="fi-tag fi-tag--outline fi-blind-note__badge">BLIND · ON</span>
        </div>
      )}

      {/* Continue reading — only when the reader has a saved position */}
      {progress && (
        <div className="fi-continue fi-row-hover" onClick={() => openStory(progress.storyId)}>
          <IconBook size={20} style={{ color: 'var(--nxb-text-muted)', flex: 'none' }} />
          <div className="fi-stack fi-stack--6" style={{ flex: 1, minWidth: 0 }}>
            <div className="fi-continue__meta">
              <span className="body" style={{ color: 'var(--nxb-text-primary)', fontWeight: 500 }}>
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
            style={{ flex: 'none', height: 36 }}
            onClick={(e) => {
              e.stopPropagation()
              openStory(progress.storyId)
            }}
          >
            Resume
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
      <div className="fi-grid--feed">
        {feed.map((st) => (
          <article
            key={st.id}
            data-lift
            className="fi-story-card"
            onClick={() => openStory(st.id)}
            style={{ background: st.cardBg, borderColor: st.cardBorder }}
          >
            <div className="fi-story-card__wash" style={{ background: st.washBg }}>
              <span className="fi-tag" style={{ color: st.tagColor, background: st.tagBg }}>
                {st.genre}
              </span>
              <span
                className="meta"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: st.metaColor }}
              >
                <IconClock size={12} />
                {st.readTime} min
              </span>
              {st.blind && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: '#afafaf',
                  }}
                >
                  {st.blindId}
                </span>
              )}
            </div>
            <div className="fi-stack fi-stack--6">
              <h2 className="h2" style={{ color: st.titleColor }}>
                {st.title}
              </h2>
              <p className="body fi-story-card__blurb" style={{ color: st.bodyColor }}>
                {st.blurb}
              </p>
            </div>
            {!st.blind && (
              <div className="fi-story-card__footer">
                <span className="fi-avatar fi-avatar--sm">{st.initials}</span>
                <span className="body-s" style={{ color: 'var(--nxb-text-primary)' }}>
                  {st.author}
                </span>
                <span className="meta" style={{ marginLeft: 'auto' }}>
                  {st.stats}
                </span>
              </div>
            )}
            {st.blind && (
              <div
                className="fi-story-card__footer fi-stack fi-stack--4"
                style={{ borderTopColor: 'rgba(255, 255, 255, 0.10)', alignItems: 'flex-start', flexDirection: 'column' }}
              >
                <span className="label" style={{ color: '#afafaf' }}>
                  first line
                </span>
                <span className="body" style={{ color: '#c7c7c7' }}>
                  &ldquo;{st.firstLine}&rdquo;
                </span>
              </div>
            )}
          </article>
        ))}
      </div>
    </main>
  )
}
