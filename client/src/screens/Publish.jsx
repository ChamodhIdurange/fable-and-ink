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
    <main
      data-screen-label="Publish"
      style={{ width: '100%', maxWidth: 560, margin: '0 auto', padding: '32px 24px 64px', flex: 1 }}
    >
      <button className="nxb-pill" onClick={() => go('editor')} style={{ marginBottom: 24 }}>
        <IconChevronLeft size={16} />
        Back to editor
      </button>
      <h1 className="h1" style={{ margin: '0 0 4px', textWrap: 'balance' }}>
        Publish your story
      </h1>
      <p className="body" style={{ margin: '0 0 32px', color: 'var(--nxb-text-muted)' }}>
        Readers see the title, blurb and genre — discovery is quality-first from there.
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          padding: 24,
          borderRadius: 16,
          background: 'var(--fi-card)',
          border: '0.5px solid var(--nxb-border-low)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label className="label" htmlFor="pub-title">
            title
          </label>
          <input
            id="pub-title"
            value={pubTitle}
            onChange={onPubTitle}
            style={{
              height: 44,
              padding: '0 12px',
              borderRadius: 8,
              border: '1px solid var(--nxb-border-medium)',
              background: 'var(--nxb-surface-1)',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              color: 'var(--nxb-text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label className="label" htmlFor="pub-blurb">
            blurb
          </label>
          <textarea
            id="pub-blurb"
            value={pubBlurb}
            onChange={onPubBlurb}
            style={{
              minHeight: 88,
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid var(--nxb-border-medium)',
              background: 'var(--nxb-surface-1)',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              lineHeight: 1.5,
              color: 'var(--nxb-text-primary)',
              outline: 'none',
              resize: 'vertical',
            }}
          />
          <span className="meta">Tip: 1–2 sentences. Lead with the tension, not the setting.</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="label">genre · pick up to 2</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {pubGenreOptions.map((g) => (
              <button key={g} className={pill(pubGenresSel.includes(g))} onClick={() => toggleGenre(g)}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="label">visibility</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {visOptionDefs.map((v) => {
              const selected = visibility === v.id
              return (
                <button
                  key={v.id}
                  className="fi-opt-hover"
                  onClick={() => setVisibility(v.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 16px',
                    borderRadius: 8,
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: selected ? 'rgba(132, 39, 226, 0.05)' : 'var(--nxb-surface-1)',
                    border: `1px solid ${selected ? 'var(--nxb-text-link)' : 'var(--nxb-border-medium)'}`,
                  }}
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 9999,
                      border: '1.5px solid var(--nxb-border-strong)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 'none',
                    }}
                  >
                    {selected && (
                      <span style={{ width: 8, height: 8, borderRadius: 9999, background: 'var(--nxb-text-link)' }} />
                    )}
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 12,
            paddingTop: 8,
            borderTop: '0.5px solid var(--nxb-border-low)',
          }}
        >
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
