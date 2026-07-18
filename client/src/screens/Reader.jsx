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
      <main style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 48 }}>
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
      <main
        data-screen-label="Reader"
        style={{ width: '100%', maxWidth: 720, margin: '0 auto', padding: '24px 24px 120px', flex: 1 }}
      >
        <button className="nxb-pill" onClick={() => go('discover')} style={{ marginBottom: 24 }}>
          <IconChevronLeft size={16} />
          Discover
        </button>

        {/* Title block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
              {story.genre}
            </span>
            <span className="meta">
              {story.readTime} min · {chapterCount} chapters
            </span>
          </div>
          <h1 className="h1" style={{ margin: 0, fontSize: 32, letterSpacing: '-0.7px', textWrap: 'balance' }}>
            {story.title}
          </h1>
          {!story.blind && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                }}
              >
                {story.initials}
              </span>
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            padding: '16px 0',
            borderTop: '0.5px solid var(--nxb-border-low)',
            borderBottom: '0.5px solid var(--nxb-border-low)',
            marginBottom: 32,
          }}
        >
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
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
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
          <div
            style={{
              border: '0.5px solid var(--nxb-border-low)',
              borderRadius: 16,
              background: 'var(--fi-card)',
              padding: 8,
              marginBottom: 32,
              animation: 'fablefade 200ms ease-out',
            }}
          >
            {chapters.map((cc, i) => (
              <button
                key={i}
                className="fi-soft-hover"
                onClick={() => setChapter(i, { fromList: true })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: 12,
                  border: 0,
                  borderRadius: 8,
                  background: i === idx ? 'var(--nxb-surface-3)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--nxb-text-muted)', width: 24 }}>
                  {'0' + (i + 1)}
                </span>
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
          <div
            style={{
              border: '0.5px solid var(--nxb-border-low)',
              borderRadius: 16,
              background: 'var(--fi-card)',
              padding: 20,
              marginBottom: 32,
              animation: 'fablefade 200ms ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <IconGitFork size={16} style={{ color: 'var(--nxb-text-muted)' }} />
              <span className="h3" style={{ margin: 0 }}>
                Remix tree
              </span>
              <span className="meta">· forks keep a permanent link to the original</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'var(--nxb-neutral-purple-150)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'var(--nxb-text-muted)',
                    border: '0.5px solid var(--nxb-border-medium)',
                    borderRadius: 4,
                    padding: '2px 6px',
                    whiteSpace: 'nowrap',
                    flex: 'none',
                  }}
                >
                  ORIGINAL
                </span>
                <span className="body" style={{ color: 'var(--nxb-text-primary)' }}>
                  {tree?.original?.title ?? story.title}
                </span>
                <span className="meta" style={{ marginLeft: 'auto' }}>
                  {tree?.original?.by ?? ''}
                </span>
              </div>
              <div
                style={{
                  marginLeft: 16,
                  borderLeft: '1px solid var(--nxb-border-medium)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {(tree?.forks ?? []).map((f) => (
                  <div
                    key={f.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 12px 10px 16px',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        width: 12,
                        height: 1,
                        background: 'var(--nxb-border-medium)',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: 'var(--nxb-text-muted)',
                        border: '0.5px solid var(--nxb-border-medium)',
                        borderRadius: 4,
                        padding: '2px 6px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {f.kind}
                    </span>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 200,
              fontSize: 56,
              lineHeight: 1,
              letterSpacing: '-1px',
              color: 'var(--nxb-text-disabled)',
            }}
          >
            0{idx + 1}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span className="label">chapter</span>
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: 22,
                letterSpacing: '-0.5px',
                color: 'var(--nxb-text-primary)',
              }}
            >
              {ch.title}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            fontSize: `${readerFs}px`,
            lineHeight: 1.75,
            letterSpacing: '-0.2px',
            color: 'var(--nxb-text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            maxWidth: '62ch',
          }}
        >
          {ch.paras.map((t, i) => (
            <p key={i} style={{ margin: 0, textWrap: 'pretty' }}>
              {t}
            </p>
          ))}
        </div>

        {/* Prev / next */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginTop: 48,
            paddingTop: 24,
            borderTop: '0.5px solid var(--nxb-border-low)',
          }}
        >
          <button
            className="nxb-btn nxb-btn--secondary nxb-btn--sm"
            onClick={() => setChapter(Math.max(0, idx - 1))}
            disabled={idx === 0}
          >
            <IconChevronLeft size={16} />
            Previous
          </button>
          <span className="meta">
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
        <div
          style={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(640px, calc(100vw - 32px))',
            zIndex: 45,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 24,
            background: 'var(--nxb-surface-4)',
            border: '1px solid rgba(255, 255, 255, 0.10)',
            backdropFilter: 'saturate(1.2) blur(12px)',
            WebkitBackdropFilter: 'saturate(1.2) blur(12px)',
            boxShadow: 'var(--nxb-glass-shadow)',
            animation: 'fablefade 250ms ease-out',
          }}
        >
          <button
            className="fi-listen-play"
            onClick={togglePlay}
            aria-label="Play or pause narration"
            style={{
              width: 40,
              height: 40,
              borderRadius: 9999,
              border: 0,
              background: '#fafafa',
              color: '#090909',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flex: 'none',
            }}
          >
            {playing ? <IconPause size={16} /> : <IconPlay size={16} style={{ marginLeft: 2 }} />}
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span
                className="body-s"
                style={{
                  color: '#fafafa',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Ch. {idx + 1} · {ch.title}
              </span>
              <span
                className="meta"
                style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', color: '#afafaf' }}
              >
                {fmt(progress)} / {fmt(dur)}
              </span>
            </div>
            <div
              onClick={seek}
              style={{
                height: 4,
                borderRadius: 9999,
                background: 'rgba(255, 255, 255, 0.15)',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  borderRadius: 9999,
                  background: '#fafafa',
                  width: progressPct,
                }}
              />
            </div>
          </div>
          <button
            className="nxb-pill"
            onClick={cycleSpeed}
            style={{ fontFamily: 'var(--font-mono)', flex: 'none', background: 'rgba(255, 255, 255, 0.10)', color: '#fafafa' }}
          >
            {speeds[speedIdx]}&times;
          </button>
        </div>
      )}
    </>
  )
}
