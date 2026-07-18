import IOSDevice from '../components/IOSDevice.jsx'
import { IconChevronLeft, IconPlay, IconPause } from '../components/Icon.jsx'

const fmt = (s) => {
  const m = Math.floor(s / 60)
  const ss = Math.floor(s % 60)
  return `${m}:${ss < 10 ? '0' : ''}${ss}`
}

export default function MobileReader({ playing, togglePlay, progress, story }) {
  if (!story?.chapters?.length) {
    return (
      <main style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 48 }}>
        <span className="meta">Loading reader…</span>
      </main>
    )
  }
  const ch = story.chapters[0]
  const dur = ch.secs || 300
  const progressPct = `${Math.min(100, (progress / dur) * 100)}%`

  return (
    <main
      data-screen-label="Mobile Reader"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        padding: '32px 24px 64px',
        flex: 1,
      }}
    >
      <p className="body" style={{ margin: 0, color: 'var(--nxb-text-muted)' }}>
        The reader, sized for a short session on the train.
      </p>
      <IOSDevice>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--nxb-surface-page)', fontFamily: 'var(--font-sans)' }}>
          {/* Top bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '46px 16px 10px',
              borderBottom: '0.5px solid var(--nxb-border-medium)',
              background: 'rgba(250, 250, 250, 0.85)',
            }}
          >
            <IconChevronLeft size={16} style={{ color: 'var(--nxb-text-muted)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--nxb-text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {story.title}
              </span>
              <span style={{ fontSize: 11, color: 'var(--nxb-text-muted)' }}>Ch. 1 · {ch.title}</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--nxb-text-muted)' }}>
              {Math.round((progress / dur) * 100)}%
            </span>
          </div>

          {/* Body */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {ch.paras.map((t, i) => (
              <p
                key={i}
                style={{
                  margin: 0,
                  fontSize: 17,
                  lineHeight: 1.7,
                  letterSpacing: '-0.2px',
                  color: 'var(--nxb-text-secondary)',
                  textWrap: 'pretty',
                }}
              >
                {t}
              </p>
            ))}
          </div>

          {/* Mini player */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px 26px',
              borderTop: '0.5px solid var(--nxb-border-medium)',
              background: 'var(--nxb-surface-1)',
            }}
          >
            <button
              onClick={togglePlay}
              aria-label="Play narration"
              style={{
                width: 36,
                height: 36,
                borderRadius: 9999,
                border: 0,
                background: 'var(--nxb-action-inverse-bg)',
                color: 'var(--nxb-action-inverse-text)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flex: 'none',
              }}
            >
              {playing ? <IconPause size={14} /> : <IconPlay size={14} style={{ marginLeft: 2 }} />}
            </button>
            <div style={{ flex: 1, height: 4, borderRadius: 9999, background: 'var(--nxb-overlay-medium)', position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  borderRadius: 9999,
                  background: 'var(--nxb-text-primary)',
                  width: progressPct,
                }}
              />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--nxb-text-muted)', whiteSpace: 'nowrap' }}>
              {fmt(progress)} / {fmt(dur)}
            </span>
          </div>
        </div>
      </IOSDevice>
    </main>
  )
}
