import { pubGenreOptions, visOptionDefs } from '../data.js'
import { IconChevronLeft } from '../components/Icon.jsx'

const pill = (on) => (on ? 'nxb-pill nxb-pill--selected' : 'nxb-pill')

export default function Publish({
  go,
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
  return (
    <main data-screen-label="Publish" className="fi-page fi-page--narrow">
      <button className="nxb-pill fi-back-pill" onClick={() => go('editor')}>
        <IconChevronLeft size={16} />
        Back to editor
      </button>
      <h1 className="h1" style={{ margin: '0 0 4px', textWrap: 'balance' }}>
        Publish your story
      </h1>
      <p className="body" style={{ margin: '0 0 32px', color: 'var(--nxb-text-muted)' }}>
        Readers see the title, blurb and genre — discovery is quality-first from there.
      </p>

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
