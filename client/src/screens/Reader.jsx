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

export default function Reader({
  go,
  story,
  tree,
  blindRead,
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
  if (!story) {
    return (
      <main className="fi-loading">
        <span className="meta">Loading story…</span>
      </main>
    )
  }

  const chapters = story.chapters ?? []
  const chapterCount = chapters.length || 1
  const idx = Math.min(chapter, chapterCount - 1)
  const ch = chapters[idx] ?? { title: '', paras: [], secs: 300 }
  const dur = ch.secs || 300
  const progressPct = `${Math.min(100, (progress / dur) * 100)}%`
  const c = story.genreColor || '#3b82d4'
  const forkCount = tree?.forks?.length ?? story.forkCount ?? 0

  return (
    <>
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
              style={{ color: c, background: `color-mix(in srgb, ${c} 10%, transparent)` }}
            >
              {story.genre}
            </span>
            <span className="meta">
              {story.readTime} min · {chapterCount} chapters
            </span>
          </div>
          <h1 className="h1">{story.title}</h1>
          {!story.blind && (
            <div className="fi-row fi-row--8">
              <span className="fi-avatar fi-avatar--sm">{story.initials}</span>
              <span className="body-s">{story.author}</span>
              <span className="meta">· {fmtReads(story.readCount)} reads</span>
            </div>
          )}
          {story.blind && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--nxb-text-muted)' }}>
              {story.blindId} · author hidden while Blind Read is on
            </span>
          )}
        </div>

        {/* Toolbar */}
        <div className="fi-reader-toolbar">
          <button className="nxb-pill" onClick={toggleChapters}>
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
              style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500 }}
            >
              A&minus;
            </button>
            <button
              className="nxb-icon-btn nxb-icon-btn--xs"
              onClick={fontUp}
              aria-label="Larger text"
              style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500 }}
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
                <span className="fi-chapter-row__num">{'0' + (i + 1)}</span>
                <span className="body" style={{ color: 'var(--nxb-text-primary)', flex: 1 }}>
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
              <IconGitFork size={16} style={{ color: 'var(--nxb-text-muted)' }} />
              <span className="h3" style={{ margin: 0 }}>
                Remix tree
              </span>
              <span className="meta">· forks keep a permanent link to the original</span>
            </div>
            <div className="fi-stack">
              <div className="fi-tree__root">
                <span className="fi-tag fi-tag--outline">ORIGINAL</span>
                <span className="body" style={{ color: 'var(--nxb-text-primary)' }}>
                  {tree?.original?.title ?? story.title}
                </span>
                <span className="meta" style={{ marginLeft: 'auto' }}>
                  {tree?.original?.by ?? ''}
                </span>
              </div>
              <div className="fi-tree__branches">
                {(tree?.forks ?? []).map((f) => (
                  <div key={f.id} className="fi-tree__fork">
                    <span className="fi-tree__tick" />
                    <span className="fi-tag fi-tag--outline">{f.kind}</span>
                    <span className="body" style={{ color: 'var(--nxb-text-primary)' }}>
                      {f.title}
                    </span>
                    <span className="meta" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                      {f.by}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chapter heading */}
        <div className="fi-chapter-head">
          <span className="fi-chapter-head__num">0{idx + 1}</span>
          <div className="fi-stack fi-stack--2">
            <span className="label">chapter</span>
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
          <button className="fi-player__play fi-listen-play" onClick={togglePlay} aria-label="Play or pause narration">
            {playing ? <IconPause size={16} /> : <IconPlay size={16} style={{ marginLeft: 2 }} />}
          </button>
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
