import { pubGenreOptions, genreColor, genreCounts } from '../data.js'
import { IconEyeOff, IconAudioLines, IconSparkles, IconActivity, IconGitFork } from '../components/Icon.jsx'

export default function Home({ go, tryBlind, openStory, pickCategory, samples = [] }) {
  return (
    <main data-screen-label="Home" style={{ width: '100%', flex: 1 }}>
      {/* Hero */}
      <section style={{ background: 'var(--nxb-surface-4)', padding: '88px 24px 96px' }}>
        <div
          style={{
            maxWidth: 1080,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            alignItems: 'flex-start',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              color: '#afafaf',
            }}
          >
            A home for storytellers
          </span>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              fontSize: 64,
              lineHeight: 1.08,
              letterSpacing: '-1.5px',
              color: '#fafafa',
              textWrap: 'balance',
            }}
          >
            <span style={{ color: '#4eb86a' }}>Read it.</span>{' '}
            <span style={{ color: '#a867ee' }}>Write it.</span>{' '}
            <span style={{ color: '#d44f78' }}>Fork it.</span>
          </h1>
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-sans)',
              fontSize: 18,
              lineHeight: 1.5,
              letterSpacing: '-0.25px',
              color: '#c7c7c7',
              maxWidth: '54ch',
            }}
          >
            Fable&amp;Ink is where stories get read for how they&rsquo;re written — not who wrote
            them. Listen with adaptive narration, polish without losing your voice, and remix any
            story that moves you.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
            <button className="nxb-btn nxb-btn--primary nxb-btn--md" onClick={() => go('discover')}>
              Explore Discover
            </button>
            <button
              className="nxb-btn nxb-btn--sm"
              onClick={() => go('editor')}
              style={{
                height: 48,
                background: 'rgba(255, 255, 255, 0.10)',
                borderColor: 'rgba(255, 255, 255, 0.20)',
                color: '#fafafa',
              }}
            >
              Start Writing
            </button>
          </div>
        </div>
      </section>

      {/* Blind Read banner */}
      <section style={{ maxWidth: 1080, margin: '-48px auto 0', padding: '0 24px' }}>
        <div
          style={{
            borderRadius: 24,
            background: 'var(--nxb-neutral-purple-150)',
            padding: '32px 40px',
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <IconEyeOff size={32} style={{ color: 'var(--nxb-text-link)', flex: 'none' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 260 }}>
            <h2 className="h2" style={{ margin: 0 }}>
              Blind Read — our answer to follower-count fiction
            </h2>
            <p className="body" style={{ margin: 0, color: 'var(--nxb-text-secondary)' }}>
              Flip one switch and every author name, read count and fork count disappears. Stories
              stand on their first line alone.
            </p>
          </div>
          <button className="nxb-btn nxb-btn--inverse nxb-btn--sm" onClick={tryBlind} style={{ flex: 'none' }}>
            Try Blind Read
          </button>
        </div>
      </section>

      {/* Feature grid */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 16px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 16,
          }}
        >
          <FeatureCard tint="#3b82d4" iconColor="#3b82d4" title="Listen to any chapter" body="AI narration that reads the room — pace tightens in the tense scenes, breathes in the calm ones.">
            <IconAudioLines size={24} style={{ color: '#3b82d4' }} />
          </FeatureCard>
          <FeatureCard tint="#4eb86a" title="Beautify, not rewrite" body="Grammar and rhythm polish that keeps your voice. Every change is a suggestion you accept or skip.">
            <IconSparkles size={24} style={{ color: '#187e43' }} />
          </FeatureCard>
          <FeatureCard tint="#e8822a" title="Story Health Check" body="Pacing dips, missing characters, setups that never pay off — flagged as friendly notes, never verdicts.">
            <IconActivity size={24} style={{ color: '#b86d05' }} />
          </FeatureCard>
          <FeatureCard tint="#d44f78" title="Fork & remix" body="Alternate endings, new branches, spin-offs — every fork keeps a living link back to the original.">
            <IconGitFork size={24} style={{ color: '#d44f78' }} />
          </FeatureCard>
        </div>
      </section>

      {/* Browse by category */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
          <h2 className="h1" style={{ margin: 0, fontSize: 24 }}>
            Browse by category
          </h2>
          <span className="meta">every genre, one shelf</span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          {pubGenreOptions.map((g) => {
            const c = genreColor(g)
            return (
              <button
                key={g}
                data-lift
                onClick={() => pickCategory(g)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 4,
                  padding: 20,
                  borderRadius: 16,
                  border: 0,
                  cursor: 'pointer',
                  background: `color-mix(in srgb, ${c} 16%, transparent)`,
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 16,
                    fontWeight: 500,
                    letterSpacing: '-0.25px',
                    color: c,
                  }}
                >
                  {g}
                </span>
                <span className="meta">{genreCounts[g] || '1k'} stories</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Fresh off the press */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 24px 56px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
          <h2 className="h1" style={{ margin: 0, fontSize: 24 }}>
            Fresh off the press
          </h2>
          <button className="nxb-pill" onClick={() => go('discover')} style={{ marginLeft: 'auto' }}>
            Discover more
          </button>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {samples.slice(0, 3).map((hs) => {
            const c = hs.genreColor || genreColor(hs.genre)
            return (
              <article
                key={hs.id}
                data-lift
                onClick={() => openStory(hs.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  padding: 20,
                  borderRadius: 16,
                  background: 'var(--fi-card)',
                  border: '0.5px solid var(--nxb-border-low)',
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
                    background: `color-mix(in srgb, ${c} 14%, transparent)`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase',
                      color: c,
                      background: `color-mix(in srgb, ${c} 10%, transparent)`,
                      borderRadius: 4,
                      padding: '3px 7px',
                      whiteSpace: 'nowrap',
                      flex: 'none',
                    }}
                  >
                    {hs.genre}
                  </span>
                  <span className="meta">{hs.readTime} min</span>
                </div>
                <h3 className="h2" style={{ margin: 0, textWrap: 'balance' }}>
                  {hs.title}
                </h3>
                <p className="body" style={{ margin: 0, color: 'var(--nxb-text-secondary)' }}>
                  {hs.blurb}
                </p>
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
                    {hs.initials}
                  </span>
                  <span className="body-s" style={{ color: 'var(--nxb-text-primary)' }}>
                    {hs.author}
                  </span>
                  <span className="meta" style={{ marginLeft: 'auto' }}>
                    {hs.stats}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Merit CTA */}
      <section style={{ background: 'var(--nxb-surface-4)', padding: '64px 24px' }}>
        <div
          style={{
            maxWidth: 1080,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: 32,
                letterSpacing: '-0.7px',
                color: '#fafafa',
                textWrap: 'balance',
              }}
            >
              Your story, discovered on merit.
            </h2>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                letterSpacing: '-0.25px',
                color: '#afafaf',
              }}
            >
              No follower counts. No algorithm games. Just the work.
            </p>
          </div>
          <button
            className="nxb-btn nxb-btn--inverse nxb-btn--md"
            onClick={() => go('discover')}
            style={{ background: '#fafafa', color: '#090909', flex: 'none' }}
          >
            Browse the Shelves
          </button>
        </div>
      </section>
    </main>
  )
}

function FeatureCard({ tint, title, body, children }) {
  return (
    <div
      style={{
        borderRadius: 16,
        background: `color-mix(in srgb, ${tint} 12%, transparent)`,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {children}
      <h3 className="h3" style={{ margin: 0 }}>
        {title}
      </h3>
      <p className="body-s" style={{ margin: 0, color: 'var(--nxb-text-secondary)' }}>
        {body}
      </p>
    </div>
  )
}
