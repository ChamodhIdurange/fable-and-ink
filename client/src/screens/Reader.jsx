import { useEffect, useState } from 'react'
import {
  IconChevronLeft,
  IconChevronRight,
  IconList,
  IconAudioLines,
  IconGitFork,
  IconPlay,
  IconPause,
} from '../components/Icon.jsx'

const pill = (on) => (on ? 'nxb-pill nxb-pill--selected' : 'nxb-pill')

const fmt = (s) => {
  const m = Math.floor(s / 60)
  const ss = Math.floor(s % 60)
  return `${m}:${ss < 10 ? '0' : ''}${ss}`
}
const fmtReads = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n ?? 0))

// Bar heights for the narration waveform. Fixed rather than random so the
// shape is stable across re-renders.
const WAVE = [0.4, 0.75, 0.5, 1, 0.65, 0.9, 0.45, 0.8, 0.55]

/** Fraction of the page scrolled, 0–1, updated on a rAF tick. */
function useScrollProgress() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    let frame = 0
    const read = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      setPct(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return pct
}

export default function Reader({
  go,
  story,
  tree,
  chapter,
  setChapter,
  readerFs,
  fontDown,
  fontUp,
  chaptersOpen,
  toggleChapters,
  treeOpen,
  toggleTree,
  openFork,
  // audio
  listenOpen,
  toggleListen,
  playing,
  togglePlay,
  progress,
  seek,
  speedIdx,
  cycleSpeed,
  speeds,
}) {
  const scrolled = useScrollProgress()

  const chapters = story?.chapters ?? []
  const chapterCount = chapters.length || 1
  const idx = Math.min(chapter, chapterCount - 1)

  // Arrow keys page through chapters, but not while the reader is typing in a
  // field somewhere or holding a modifier for a browser shortcut.
  useEffect(() => {
    if (!story) return
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = document.activeElement
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return
      if (e.key === 'ArrowLeft' && idx > 0) setChapter(idx - 1)
      if (e.key === 'ArrowRight' && idx < chapterCount - 1) setChapter(idx + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [story, idx, chapterCount, setChapter])

  if (!story) {
    return (
      <main className="fi-loading" aria-busy="true">
        <span className="fi-skel" style={{ width: 120, height: 32, borderRadius: 9999 }} />
        <span className="fi-skel" style={{ width: '82%', height: 46, marginTop: 14 }} />
        <span className="fi-skel" style={{ width: '54%', height: 46 }} />
        <span className="fi-skel" style={{ width: 200, height: 22, marginTop: 10 }} />
        <span className="fi-skel" style={{ width: '100%', height: 220, marginTop: 24, borderRadius: 20 }} />
      </main>
    )
  }

  const ch = chapters[idx] ?? { title: '', paras: [], secs: 300 }
  const dur = ch.secs || 300
  const progressPct = `${Math.min(100, (progress / dur) * 100)}%`
  const c = story.genreColor || '#3b82d4'
  const forkCount = tree?.forks?.length ?? story.forkCount ?? 0

  return (
    <>
      {/* Reading position — the only always-on chrome in the reader. */}
      <div className="fi-read-progress" aria-hidden="true">
        <div className="fi-read-progress__fill" style={{ width: `${scrolled * 100}%` }} />
      </div>

      <main data-screen-label="Reader" className="fi-page fi-page--reader">
        <button className="nxb-pill fi-back-pill" onClick={() => go('discover')}>
          <IconChevronLeft size={16} />
          Discover
        </button>

        {/* Title block */}
        <div className="fi-reader-title">
          <div className="fi-row fi-row--8">
            <span
              className="fi-tag"
              style={{ color: c, background: `color-mix(in srgb, ${c} 14%, transparent)` }}
            >
              {story.genre}
            </span>
            <span className="meta">
              {story.readTime} min · {chapterCount} chapters
            </span>
          </div>
          <h1>{story.title}</h1>
          {!story.blind && (
            <div className="fi-row fi-row--8">
              <span className="fi-avatar fi-avatar--sm">{story.initials}</span>
              <span className="body-s">{story.author}</span>
              <span className="meta">· {fmtReads(story.readCount)} reads</span>
            </div>
          )}
          {story.blind && (
            <span className="meta" style={{ fontFamily: 'var(--font-mono)' }}>
              {story.blindId} · author hidden while Blind Read is on
            </span>
          )}
        </div>

        {/* Toolbar */}
        <div className="fi-reader-toolbar">
          <button className={pill(chaptersOpen)} onClick={toggleChapters}>
            <IconList size={16} />
            Chapters
          </button>
          <button className={pill(listenOpen)} onClick={toggleListen}>
            <IconAudioLines size={16} />
            Listen
          </button>
          <button className="nxb-pill" onClick={openFork}>
            <IconGitFork size={16} />
            Fork / Remix
          </button>
          <button className={pill(treeOpen)} onClick={toggleTree}>
            {forkCount} forks
          </button>
          <div className="fi-reader-toolbar__fonts">
            <button
              className="nxb-icon-btn nxb-icon-btn--xs"
              onClick={fontDown}
              aria-label="Smaller text"
              style={{ fontSize: 12, fontWeight: 500 }}
            >
              A&minus;
            </button>
            <button
              className="nxb-icon-btn nxb-icon-btn--xs"
              onClick={fontUp}
              aria-label="Larger text"
              style={{ fontSize: 15, fontWeight: 500 }}
            >
              A+
            </button>
          </div>
        </div>

        {/* Chapters panel */}
        {chaptersOpen && (
          <div className="fi-panel fi-chapters-panel">
            {chapters.map((cc, i) => (
              <button
                key={i}
                className={`fi-chapter-row fi-soft-hover${i === idx ? ' is-current' : ''}`}
                onClick={() => setChapter(i, { fromList: true })}
              >
                <span className="fi-chapter-row__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="body" style={{ color: 'var(--fi-ink)', flex: 1 }}>
                  {cc.title}
                </span>
                <span className="meta">{cc.mins} min</span>
              </button>
            ))}
          </div>
        )}

        {/* Remix tree */}
        {treeOpen && (
          <div className="fi-panel fi-tree-panel">
            <div className="fi-tree__head">
              <IconGitFork size={16} style={{ color: 'var(--fi-ink-3)' }} />
              <span className="h3">Remix tree</span>
              <span className="meta">· forks keep a permanent link to the original</span>
            </div>
            <div className="fi-stack fi-stack--8">
              <div className="fi-tree__root">
                <span className="fi-tag fi-tag--outline">ORIGINAL</span>
                <span className="body" style={{ color: 'var(--fi-ink)' }}>
                  {tree?.original?.title ?? story.title}
                </span>
                <span className="meta" style={{ marginLeft: 'auto' }}>
                  {tree?.original?.by ?? ''}
                </span>
              </div>
              {(tree?.forks ?? []).length > 0 && (
                <div className="fi-tree__branches">
                  {tree.forks.map((f) => (
                    <div key={f.id} className="fi-tree__fork">
                      <span className="fi-tree__tick" />
                      <span className="fi-tag fi-tag--outline">{f.kind}</span>
                      <span className="body" style={{ color: 'var(--fi-ink)' }}>
                        {f.title}
                      </span>
                      <span className="meta" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                        {f.by}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chapter heading */}
        <div className="fi-chapter-head">
          <span className="fi-chapter-head__num" aria-hidden="true">
            {String(idx + 1).padStart(2, '0')}
          </span>
          <div className="fi-stack fi-stack--4">
            <span className="label">chapter {idx + 1}</span>
            <h2 className="fi-chapter-head__title">{ch.title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="fi-prose" style={{ fontSize: `${readerFs}px` }}>
          {ch.paras.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>

        {/* Prev / next */}
        <div className="fi-pager">
          <button
            className="nxb-btn nxb-btn--secondary nxb-btn--sm"
            onClick={() => setChapter(Math.max(0, idx - 1))}
            disabled={idx === 0}
          >
            <IconChevronLeft size={16} />
            Previous
          </button>
          <span className="meta fi-pager__label">
            Chapter {idx + 1} of {chapterCount}
          </span>
          <button
            className="nxb-btn nxb-btn--secondary nxb-btn--sm"
            onClick={() => setChapter(Math.min(chapterCount - 1, idx + 1))}
            disabled={idx === chapterCount - 1}
          >
            Next
            <IconChevronRight size={16} />
          </button>
        </div>
      </main>

      {/* Floating Listen player */}
      {listenOpen && (
        <div className="fi-player">
          <button className="fi-player__play" onClick={togglePlay} aria-label={playing ? 'Pause narration' : 'Play narration'}>
            {playing ? <IconPause size={17} /> : <IconPlay size={17} style={{ marginLeft: 2 }} />}
          </button>

          <div className={`fi-wave${playing ? ' is-playing' : ''}`} aria-hidden="true">
            {WAVE.map((h, i) => (
              <span
                key={i}
                className="fi-wave__bar"
                style={{ height: `${h * 100}%`, '--fi-delay': `${i * 90}ms` }}
              />
            ))}
          </div>

          <div className="fi-player__body">
            <div className="fi-player__meta">
              <span className="body-s fi-player__title">
                Ch. {idx + 1} · {ch.title}
              </span>
              <span className="meta fi-player__time">
                {fmt(progress)} / {fmt(dur)}
              </span>
            </div>
            <div className="fi-player__track" onClick={seek}>
              <div className="fi-player__fill" style={{ width: progressPct }} />
            </div>
          </div>

          <button className="nxb-pill fi-player__speed" onClick={cycleSpeed}>
            {speeds[speedIdx]}&times;
          </button>
        </div>
      )}
    </>
  )
}
