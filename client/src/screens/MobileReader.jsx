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
      <main className="fi-loading">
        <span className="meta">Loading reader…</span>
      </main>
    )
  }
  const ch = story.chapters[0]
  const dur = ch.secs || 300
  const progressPct = `${Math.min(100, (progress / dur) * 100)}%`

  return (
    <main data-screen-label="Mobile Reader" className="fi-mobile-page">
      <p className="body" style={{ margin: 0, color: 'var(--nxb-text-muted)' }}>
        The reader, sized for a short session on the train.
      </p>
      <IOSDevice>
        <div className="fi-mr">
          {/* Top bar */}
          <div className="fi-mr__top">
            <IconChevronLeft size={16} style={{ color: 'var(--nxb-text-muted)' }} />
            <div className="fi-stack" style={{ minWidth: 0, flex: 1 }}>
              <span className="fi-mr__title">{story.title}</span>
              <span className="fi-mr__sub">Ch. 1 · {ch.title}</span>
            </div>
            <span className="fi-mr__pct">{Math.round((progress / dur) * 100)}%</span>
          </div>

          {/* Body */}
          <div className="fi-mr__body">
            {ch.paras.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </div>

          {/* Mini player */}
          <div className="fi-mr__player">
            <button className="fi-mr__play" onClick={togglePlay} aria-label="Play narration">
              {playing ? <IconPause size={14} /> : <IconPlay size={14} style={{ marginLeft: 2 }} />}
            </button>
            <div className="fi-progress" style={{ flex: 1 }}>
              <div className="fi-progress__fill" style={{ width: progressPct }} />
            </div>
            <span className="fi-mr__time">
              {fmt(progress)} / {fmt(dur)}
            </span>
          </div>
        </div>
      </IOSDevice>
    </main>
  )
}
