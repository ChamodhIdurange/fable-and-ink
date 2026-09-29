import { pubGenreOptions, visOptionDefs, genreColor } from '../data.js'
import StoryCard from '../components/StoryCard.jsx'
import { IconChevronLeft } from '../components/Icon.jsx'

const pill = (on) => (on ? 'nxb-pill nxb-pill--selected' : 'nxb-pill')

export default function Publish({
  go,
  authorName = '',
  authorInitials = '',
  pubTitle,
  onPubTitle,
  pubBlurb,
  onPubBlurb,
  pubGenresSel,
  toggleGenre,
  visibility,
  setVisibility,
  saveDraft,
  doPublish,
}) {
  const primaryGenre = pubGenresSel[0] ?? 'Literary'
  const preview = {
    id: 'preview',
    title: pubTitle.trim() || 'Untitled story',
    blurb: pubBlurb.trim() || 'Your blurb appears here — one or two sentences that lead with the tension.',
    genre: primaryGenre,
    genreColor: genreColor(primaryGenre),
    readTime: 15,
    author: authorName || 'You',
    initials: authorInitials || 'YOU',
    stats: 'not published yet',
  }

  return (
    <main data-screen-label="Publish" className="fi-page fi-page--narrow">
      <button className="nxb-pill fi-back-pill" onClick={() => go('editor')}>
        <IconChevronLeft size={16} />
        Back to editor
      </button>
      <span className="fi-eyebrow">Ship it</span>
      <h1 className="h1" style={{ margin: '0 0 6px' }}>
        Publish your story
      </h1>
      <p className="body" style={{ margin: '0 0 28px' }}>
        Readers see the title, blurb and genre — discovery is quality-first from there.
      </p>

      {/* Exactly what the story will look like on the Discover shelf. */}
      <div className="fi-publish-preview">
        <span className="label">live preview · discover card</span>
        <StoryCard story={preview} preview />
      </div>

      <div className="fi-form-card">
        <div className="fi-field">
          <label className="label" htmlFor="pub-title">
            title
          </label>
          <input id="pub-title" className="fi-input" value={pubTitle} onChange={onPubTitle} />
        </div>
        <div className="fi-field">
          <label className="label" htmlFor="pub-blurb">
            blurb
          </label>
          <textarea id="pub-blurb" className="fi-textarea" value={pubBlurb} onChange={onPubBlurb} />
          <span className="meta">Tip: 1–2 sentences. Lead with the tension, not the setting.</span>
        </div>
        <div className="fi-field" style={{ gap: 8 }}>
          <span className="label">genre · pick up to 2</span>
          <div className="fi-pill-set">
            {pubGenreOptions.map((g) => (
              <button key={g} className={pill(pubGenresSel.includes(g))} onClick={() => toggleGenre(g)}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="fi-field" style={{ gap: 8 }}>
          <span className="label">visibility</span>
          <div className="fi-stack fi-stack--8">
            {visOptionDefs.map((v) => {
              const selected = visibility === v.id
              return (
                <button
                  key={v.id}
                  className={`fi-opt fi-opt-hover${selected ? ' is-selected' : ''}`}
                  onClick={() => setVisibility(v.id)}
                  role="radio"
                  aria-checked={selected}
                >
                  <span className="fi-opt__radio">{selected && <span className="fi-opt__dot" />}</span>
                  <span className="fi-opt__text">
                    <span className="body" style={{ color: 'var(--nxb-text-primary)', fontWeight: 500 }}>
                      {v.title}
                    </span>
                    <span className="body-s" style={{ color: 'var(--nxb-text-muted)' }}>
                      {v.desc}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="fi-form-actions">
          <button className="nxb-btn nxb-btn--secondary nxb-btn--sm" onClick={saveDraft}>
            Save draft
          </button>
          <button className="nxb-btn nxb-btn--primary nxb-btn--sm" onClick={doPublish}>
            Publish Story
          </button>
        </div>
      </div>
    </main>
  )
}
