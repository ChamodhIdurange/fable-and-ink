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
    <main
      data-screen-label="Discover"
      style={{ width: '100%', maxWidth: 1080, margin: '0 auto', padding: '32px 24px 64px', flex: 1 }}
    >
      {/* Hero */}
      <section
        style={{
          borderRadius: 24,
          background: 'var(--nxb-surface-4)',
          padding: 40,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              color: '#afafaf',
            }}
          >
            Discover
          </span>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              fontSize: 44,
              lineHeight: 1.1,
              letterSpacing: '-1px',
              color: '#fafafa',
              textWrap: 'balance',
            }}
          >
            Stories that earn the read.
          </h1>
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-sans)',
              fontSize: 16,
              lineHeight: 1.5,
              letterSpacing: '-0.25px',
              color: '#afafaf',
            }}
          >
            Written by <span style={{ color: '#a867ee' }}>{'{anyone}'}</span>. Discovered on craft,
            not follower count.
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 12px 10px 18px',
            borderRadius: 9999,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '0.5px solid rgba(255, 255, 255, 0.10)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              letterSpacing: '-0.25px',
              color: '#fafafa',
              whiteSpace: 'nowrap',
            }}
          >
            Blind Read
          </span>
          <button
            onClick={toggleBlind}
            aria-label="Toggle Blind Read"
            style={{
              width: 44,
              height: 26,
              borderRadius: 9999,
              border: 0,
              background: blindRead ? 'var(--nxb-action-primary-to)' : 'rgba(255, 255, 255, 0.20)',
              padding: 3,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'background 200ms ease',
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: 9999,
                background: '#ffffff',
                transition: 'transform 200ms ease',
                transform: blindRead ? 'translateX(18px)' : 'translateX(0)',
              }}
            />
          </button>
        </div>
      </section>

      {/* Blind Read active notice */}
      {blindRead && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            margin: '16px 0 0',
            padding: '12px 16px',
            border: 0,
            borderRadius: 8,
            background: 'var(--nxb-neutral-purple-150)',
            animation: 'fablefade 200ms ease-out',
          }}
        >
          <IconEyeOff size={16} style={{ color: 'var(--nxb-text-muted)', flex: 'none' }} />
          <span className="body" style={{ color: 'var(--nxb-text-secondary)' }}>
            Blind Read is on — authors, reads and fork counts are hidden. Every story opens with its
            first line instead.
          </span>
          <span
            style={{
              marginLeft: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              color: 'var(--nxb-text-muted)',
              border: '0.5px solid var(--nxb-border-medium)',
              borderRadius: 4,
              padding: '2px 6px',
              whiteSpace: 'nowrap',
            }}
          >
            BLIND · ON
          </span>
        </div>
      )}

      {/* Continue reading — only when the reader has a saved position */}
      {progress && (
        <div
          className="fi-row-hover"
          onClick={() => openStory(progress.storyId)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '16px 20px',
            borderRadius: 16,
            background: 'var(--fi-card)',
            border: '0.5px solid var(--nxb-border-low)',
            marginTop: 20,
            cursor: 'pointer',
          }}
        >
          <IconBook size={20} style={{ color: 'var(--nxb-text-muted)', flex: 'none' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="body" style={{ color: 'var(--nxb-text-primary)', fontWeight: 500 }}>
                {progress.title}
              </span>
              <span className="meta">
                {progress.chapterLabel} · {Math.round(progress.percent)}% read
              </span>
            </div>
            <div
              style={{
                height: 4,
                borderRadius: 9999,
                background: 'var(--nxb-overlay-medium)',
                position: 'relative',
                maxWidth: 320,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${progress.percent}%`,
                  borderRadius: 9999,
                  background: 'var(--nxb-text-primary)',
                }}
              />
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 0 24px', flexWrap: 'wrap' }}>
        {genreOptions.map((g) => (
          <button
            key={g}
            className={pill(genreFilter === g)}
            onClick={() => setGenreFilter(g)}
            style={{ gap: 6 }}
          >
            {g !== 'All' && (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 9999,
                  background: genreColor(g),
                  flex: 'none',
                }}
              />
            )}
            {g}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        {feed.map((st) => (
          <article
            key={st.id}
            data-lift
            onClick={() => openStory(st.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              padding: 20,
              borderRadius: 16,
              background: st.cardBg,
              border: `0.5px solid ${st.cardBorder}`,
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                margin: '-20px -20px 4px',
                padding: '14px 20px 12px',
                borderRadius: '16px 16px 0 0',
                background: st.washBg,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                  color: st.tagColor,
                  background: st.tagBg,
                  borderRadius: 4,
                  padding: '3px 7px',
                  whiteSpace: 'nowrap',
                  flex: 'none',
                }}
              >
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <h2 className="h2" style={{ margin: 0, textWrap: 'balance', color: st.titleColor }}>
                {st.title}
              </h2>
              <p className="body" style={{ margin: 0, color: st.bodyColor }}>
                {st.blurb}
              </p>
            </div>
            {!st.blind && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 'auto',
                  paddingTop: 12,
                  borderTop: '0.5px solid var(--nxb-border-low)',
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 9999,
                    background: 'var(--nxb-neutral-purple-150)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--nxb-text-primary)',
                    flex: 'none',
                  }}
                >
                  {st.initials}
                </span>
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
                style={{
                  marginTop: 'auto',
                  paddingTop: 12,
                  borderTop: '0.5px solid rgba(255, 255, 255, 0.10)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
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
