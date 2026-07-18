import { IconSparkles, IconActivity, IconGitFork, IconX, IconCheck, IconGrip } from '../components/Icon.jsx'

const pill = (on) => (on ? 'nxb-pill nxb-pill--selected' : 'nxb-pill')

// Map an API health note (kind/severity/text/scene) to render props.
function decorateNote(n) {
  const warn = n.severity === 'warn'
  return {
    ...n,
    dot: warn ? 'var(--nxb-status-medium-border)' : 'rgb(var(--nxb-status-ok))',
    bg: warn ? 'var(--nxb-status-medium-bg-hover)' : 'var(--nxb-status-ok-bg)',
    hasLink: !!n.scene,
  }
}

export default function Editor({
  go,
  tab,
  setTab,
  draftStoryTitle,
  draftChapterTitle,
  onChapterTitle,
  draft,
  onDraft,
  wordCount,
  forkedFrom,
  beautifyOpen,
  runBeautify,
  closeBeautify,
  beautifyLoading = false,
  beautifyError = null,
  healthLoading = false,
  healthError = null,
  retryHealth,
  healthOpen,
  toggleHealth,
  suggestions,
  decide,
  acceptAll,
  viewInArrange,
  // arrange
  scenes = [],
  dragId,
  drag,
  highlightScene,
  healthNotes = [],
}) {
  const isWrite = tab === 'write'
  const pendingCount = suggestions.filter((s) => s.status === 'pending').length
  const sideOpen = healthOpen || beautifyOpen
  const notes = healthNotes.map(decorateNote)

  return (
    <main data-screen-label="Editor" className="fi-page fi-page--editor">
      {/* Header row */}
      <div className="fi-editor-bar">
        <div className="fi-editor-bar__title">
          <span className="h3">{draftStoryTitle}</span>
          <span
            className="fi-tag"
            style={{
              fontSize: 10,
              letterSpacing: '0.5px',
              color: 'rgb(var(--nxb-status-medium-text))',
              background: 'var(--nxb-status-medium-bg-hover)',
            }}
          >
            DRAFT
          </span>
        </div>
        <div className="nxb-icon-btn-group" style={{ height: 34 }}>
          <button className={pill(tab === 'write')} onClick={() => setTab('write')}>
            Write
          </button>
          <button className={pill(tab === 'arrange')} onClick={() => setTab('arrange')}>
            Arrange
          </button>
        </div>
        <div className="fi-editor-bar__actions">
          <button className="nxb-btn nxb-btn--secondary nxb-btn--sm" onClick={runBeautify}>
            <IconSparkles size={16} />
            Beautify
          </button>
          <button className={pill(healthOpen)} onClick={toggleHealth}>
            <IconActivity size={16} />
            Health Check
          </button>
          <button className="nxb-btn nxb-btn--primary nxb-btn--sm" onClick={() => go('publish')}>
            Publish
          </button>
        </div>
      </div>

      {/* Forked banner */}
      {forkedFrom && (
        <div className="fi-fork-banner">
          <IconGitFork size={16} style={{ color: 'var(--nxb-text-muted)', flex: 'none' }} />
          <span className="body" style={{ color: 'var(--nxb-text-secondary)' }}>
            Forked from{' '}
            <a
              href="#"
              className="fi-link"
              onClick={(e) => {
                e.preventDefault()
                go('reader')
              }}
            >
              The Lighthouse at Wolfe Sound
            </a>{' '}
            by Mara Ellison — the link travels with your story.
          </span>
        </div>
      )}

      {/* Write tab */}
      {isWrite && (
        <div className="fi-editor-layout">
          <div className="fi-editor-main">
            <input
              value={draftChapterTitle}
              onChange={onChapterTitle}
              aria-label="chapter title"
              className="fi-editor-title-input"
            />
            <div className="meta" style={{ marginBottom: 20 }}>
              Chapter 3 · {wordCount} words · saved just now
            </div>
            <textarea value={draft} onChange={onDraft} aria-label="chapter text" className="fi-editor-body" />
            <div className="meta" style={{ marginTop: 12 }}>
              Tip: write first, tidy later — Beautify keeps your phrasing, it only mends the seams.
            </div>
          </div>

          {sideOpen && (
            <aside className="fi-editor-aside">
              {beautifyOpen && (
                <div className="fi-side-card">
                  <div className="fi-side-card__head">
                    <span className="h3">Beautify</span>
                    <span className={`meta${beautifyLoading ? ' fi-pulse' : ''}`}>
                      {beautifyLoading ? '· reading your draft…' : `· ${pendingCount} suggestions`}
                    </span>
                    <button
                      className="nxb-icon-btn nxb-icon-btn--xs"
                      onClick={closeBeautify}
                      aria-label="Close"
                      style={{ marginLeft: 'auto' }}
                    >
                      <IconX size={16} />
                    </button>
                  </div>
                  <p className="body-s" style={{ margin: 0, color: 'var(--nxb-text-muted)' }}>
                    Voice-preserving polish — your phrasing, tightened. Nothing changes until you
                    accept it.
                  </p>
                  {beautifyLoading && (
                    <div className="fi-suggestion fi-pulse">
                      <span className="body-s" style={{ color: 'var(--nxb-text-muted)' }}>
                        Reading for rhythm, grammar and punctuation…
                      </span>
                    </div>
                  )}
                  {!beautifyLoading && beautifyError && (
                    <div className="fi-ai-out">
                      <span className="body-s" style={{ color: 'var(--nxb-text-secondary)' }}>
                        {beautifyError}
                      </span>
                      <button className="fi-chip-btn fi-chip-btn--ghost" onClick={runBeautify}>
                        Try again
                      </button>
                    </div>
                  )}
                  {!beautifyLoading && !beautifyError && !suggestions.length && (
                    <div className="fi-suggestion">
                      <span className="body-s" style={{ color: 'var(--nxb-text-muted)' }}>
                        Nothing to mend — this draft already reads clean.
                      </span>
                    </div>
                  )}
                  {suggestions.map((s) => (
                    <div key={s.id} className="fi-suggestion">
                      <span className="fi-suggestion__kind">{s.kind}</span>
                      {s.status === 'pending' ? (
                        <>
                          <p className="body-s fi-suggestion__original">{s.original}</p>
                          <p className="body-s fi-suggestion__revised">{s.revised}</p>
                          <p className="fi-suggestion__why">{s.why}</p>
                          <div className="fi-suggestion__actions">
                            <button className="fi-chip-btn" onClick={() => decide(s.id, true)}>
                              Accept
                            </button>
                            <button
                              className="fi-chip-btn fi-chip-btn--ghost fi-soft-hover"
                              onClick={() => decide(s.id, false)}
                            >
                              Skip
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="fi-row" style={{ gap: 6 }}>
                          <IconCheck
                            size={14}
                            style={{
                              color:
                                s.status === 'accepted'
                                  ? 'rgb(var(--nxb-status-low-text))'
                                  : 'var(--nxb-text-disabled)',
                            }}
                          />
                          <span className="body-s" style={{ color: 'var(--nxb-text-muted)' }}>
                            {s.status === 'accepted' ? 'Applied to your draft' : 'Skipped — original kept'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  {pendingCount > 0 && (
                    <button
                      className="nxb-btn nxb-btn--secondary nxb-btn--sm"
                      onClick={acceptAll}
                      style={{ alignSelf: 'flex-start', height: 32 }}
                    >
                      Accept all
                    </button>
                  )}
                </div>
              )}

              {healthOpen && (
                <div className="fi-side-card">
                  <div className="fi-side-card__head">
                    <IconActivity size={16} style={{ color: 'var(--nxb-text-muted)' }} />
                    <span className="h3">Story Health</span>
                    <span className={`meta${healthLoading ? ' fi-pulse' : ''}`} style={{ marginLeft: 'auto' }}>
                      {healthLoading ? 'reading…' : 'ran just now'}
                    </span>
                  </div>
                  <p className="body-s" style={{ margin: 0, color: 'var(--nxb-text-muted)' }}>
                    Notes, not verdicts — the story is yours.
                  </p>
                  {healthLoading && !notes.length && (
                    <div className="fi-note fi-pulse" style={{ background: 'var(--nxb-surface-1)' }}>
                      <span className="body-s" style={{ color: 'var(--nxb-text-muted)' }}>
                        Reading your chapters and scene cards…
                      </span>
                    </div>
                  )}
                  {!healthLoading && healthError && (
                    <div className="fi-ai-out">
                      <span className="body-s" style={{ color: 'var(--nxb-text-secondary)' }}>
                        {healthError}
                      </span>
                      {retryHealth && (
                        <button className="fi-chip-btn fi-chip-btn--ghost" onClick={retryHealth}>
                          Try again
                        </button>
                      )}
                    </div>
                  )}
                  {notes.map((n, i) => (
                    <div key={i} className="fi-note" style={{ background: n.bg }}>
                      <div className="fi-row" style={{ gap: 6 }}>
                        <span className="fi-note__dot" style={{ background: n.dot }} />
                        <span className="fi-note__kind">{n.kind}</span>
                      </div>
                      <p className="body-s fi-note__text">{n.text}</p>
                      {n.hasLink && (
                        <a
                          href="#"
                          className="body-s fi-link"
                          onClick={(e) => {
                            e.preventDefault()
                            viewInArrange(n.scene)
                          }}
                        >
                          View in Arrange
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </aside>
          )}
        </div>
      )}

      {/* Arrange tab */}
      {!isWrite && (
        <div className="fi-stack" style={{ gap: 16 }}>
          <p className="body" style={{ margin: 0, color: 'var(--nxb-text-muted)' }}>
            Drag scenes to reorder. Flagged cards carry their Story Health note so you know why they
            might want to move.
          </p>
          <div className="fi-scene-grid">
            {scenes.map((s, i) => {
              const id = s.slug
              return (
                <div
                  key={id}
                  className={`fi-scene-card fi-border-hover${dragId === id ? ' is-dragging' : ''}`}
                  draggable
                  onDragStart={(e) => drag.start(e, id)}
                  onDragOver={(e) => drag.over(e, id)}
                  onDrop={(e) => e.preventDefault()}
                  onDragEnd={drag.end}
                >
                  {highlightScene === id && <span className="fi-scene-card__ring" />}
                  <div className="fi-row fi-row--8">
                    <IconGrip size={14} style={{ color: 'var(--nxb-text-disabled)', flex: 'none' }} />
                    <span className="fi-scene-card__num">{(i < 9 ? '0' : '') + (i + 1)}</span>
                    <span className="meta" style={{ marginLeft: 'auto' }}>
                      Ch. {s.ch}
                    </span>
                  </div>
                  <span className="body" style={{ color: 'var(--nxb-text-primary)', fontWeight: 500 }}>
                    {s.title}
                  </span>
                  <span className="meta">{s.words} words</span>
                  {s.flag && (
                    <div className="fi-scene-card__flag">
                      <span
                        className="fi-note__dot"
                        style={{ background: 'var(--nxb-status-medium-border)', marginTop: 4 }}
                      />
                      <span className="fi-scene-card__flag-text">{s.flag}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </main>
  )
}
