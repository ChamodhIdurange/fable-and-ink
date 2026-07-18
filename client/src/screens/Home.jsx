import { pubGenreOptions, genreColor, genreCounts } from '../data.js'
import { IconEyeOff, IconAudioLines, IconSparkles, IconActivity, IconGitFork } from '../components/Icon.jsx'

export default function Home({ go, tryBlind, openStory, pickCategory, samples = [] }) {
  return (
    <main data-screen-label="Home" className="fi-page fi-page--full">
      {/* Hero */}
      <section className="fi-hero">
        <span className="fi-hero__glow fi-hero__glow--read" aria-hidden="true" />
        <span className="fi-hero__glow fi-hero__glow--write" aria-hidden="true" />
        <span className="fi-hero__glow fi-hero__glow--fork" aria-hidden="true" />
        <div className="fi-hero__inner">
          <span className="fi-kicker">A home for storytellers</span>
          <h1 className="fi-hero__title">
            <span style={{ color: '#4eb86a' }}>Read it.</span>{' '}
            <span style={{ color: '#a867ee' }}>Write it.</span>{' '}
            <span style={{ color: '#d44f78' }}>Fork it.</span>
          </h1>
          <p className="fi-hero__lede">
            Fable&amp;Ink is where stories get read for how they&rsquo;re written — not who wrote
            them. Listen with adaptive narration, polish without losing your voice, and remix any
            story that moves you.
          </p>
          <div className="fi-hero__actions">
            <button className="nxb-btn nxb-btn--primary nxb-btn--md" onClick={() => go('discover')}>
              Explore Discover
            </button>
            <button className="nxb-btn nxb-btn--sm fi-btn-ghost-dark" onClick={() => go('editor')}>
              Start Writing
            </button>
          </div>
        </div>
      </section>

      {/* Blind Read banner */}
      <section className="fi-blind-banner-wrap">
        <div className="fi-blind-banner">
          <IconEyeOff size={32} style={{ color: 'var(--nxb-text-link)', flex: 'none' }} />
          <div className="fi-blind-banner__copy">
            <h2 className="h2">Blind Read — our answer to follower-count fiction</h2>
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
      <section className="fi-home-section fi-home-section--first" style={{ paddingBottom: 16 }}>
        <div className="fi-grid fi-grid--features">
          <FeatureCard tint="#3b82d4" title="Listen to any chapter" body="AI narration that reads the room — pace tightens in the tense scenes, breathes in the calm ones.">
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
      <section className="fi-home-section" style={{ paddingBottom: 16 }}>
        <div className="fi-section-head">
          <h2 className="h1">Browse by category</h2>
          <span className="meta">every genre, one shelf</span>
        </div>
        <div className="fi-grid fi-grid--cats">
          {pubGenreOptions.map((g) => {
            const c = genreColor(g)
            return (
              <button
                key={g}
                data-lift
                className="fi-cat-card"
                onClick={() => pickCategory(g)}
                style={{ background: `color-mix(in srgb, ${c} 16%, transparent)` }}
              >
                <span className="fi-cat-card__name" style={{ color: c }}>
                  {g}
                </span>
                <span className="meta">{genreCounts[g] || '1k'} stories</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Fresh off the press */}
      <section className="fi-home-section fi-home-section--last">
        <div className="fi-section-head">
          <h2 className="h1">Fresh off the press</h2>
          <button className="nxb-pill" onClick={() => go('discover')} style={{ marginLeft: 'auto' }}>
            Discover more
          </button>
        </div>
        <div className="fi-grid fi-grid--stories">
          {samples.slice(0, 6).map((hs) => {
            const c = hs.genreColor || genreColor(hs.genre)
            return (
              <article key={hs.id} data-lift className="fi-story-card" onClick={() => openStory(hs.id)}>
                <div
                  className="fi-story-card__wash"
                  style={{ background: `color-mix(in srgb, ${c} 14%, transparent)` }}
                >
                  <span
                    className="fi-tag"
                    style={{ color: c, background: `color-mix(in srgb, ${c} 10%, transparent)` }}
                  >
                    {hs.genre}
                  </span>
                  <span className="meta">{hs.readTime} min</span>
                </div>
                <h3 className="h2">{hs.title}</h3>
                <p className="body fi-story-card__blurb" style={{ color: 'var(--nxb-text-secondary)' }}>
                  {hs.blurb}
                </p>
                <div className="fi-story-card__footer">
                  <span className="fi-avatar fi-avatar--sm">{hs.initials}</span>
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
      <section className="fi-cta">
        <div className="fi-cta__inner">
          <div className="fi-stack fi-stack--8">
            <h2 className="fi-cta__title">Your story, discovered on merit.</h2>
            <p className="fi-cta__sub">No follower counts. No algorithm games. Just the work.</p>
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
    <div className="fi-feature-card" style={{ background: `color-mix(in srgb, ${tint} 12%, transparent)` }}>
      {children}
      <h3 className="h3">{title}</h3>
      <p className="body-s" style={{ color: 'var(--nxb-text-secondary)' }}>
        {body}
      </p>
    </div>
  )
}
