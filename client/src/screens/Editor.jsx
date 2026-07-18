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
    <main
      data-screen-label="Editor"
      style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '24px 24px 64px', flex: 1 }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span className="h3" style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {draftStoryTitle}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              color: 'rgb(var(--nxb-status-medium-text))',
              background: 'var(--nxb-status-medium-bg-hover)',
              borderRadius: 4,
              padding: '3px 7px',
              whiteSpace: 'nowrap',
              flex: 'none',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            marginBottom: 20,
            border: '0.5px solid var(--nxb-border-medium)',
            borderRadius: 8,
            background: 'var(--nxb-surface-1)',
          }}
        >
          <IconGitFork size={16} style={{ color: 'var(--nxb-text-muted)', flex: 'none' }} />
          <span className="body" style={{ color: 'var(--nxb-text-secondary)' }}>
            Forked from{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                go('reader')
              }}
              style={{ color: 'var(--nxb-text-link)', textDecoration: 'none' }}
            >
              The Lighthouse at Wolfe Sound
            </a>{' '}
            by Mara Ellison — the link travels with your story.
          </span>
        </div>
      )}

      {/* Write tab */}
      {isWrite && (
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0, maxWidth: 720, margin: '0 auto' }}>
            <input
              value={draftChapterTitle}
              onChange={onChapterTitle}
              aria-label="chapter title"
              style={{
                width: '100%',
                border: 0,
                outline: 'none',
                background: 'transparent',
                fontFamily: 'var(--font-sans)',
                fontSize: 24,
                fontWeight: 500,
                letterSpacing: '-0.5px',
                color: 'var(--nxb-text-primary)',
                padding: '0 0 4px',
              }}
            />
            <div className="meta" style={{ marginBottom: 20 }}>
              Chapter 3 · {wordCount} words · saved just now
            </div>
            <textarea
              value={draft}
              onChange={onDraft}
              aria-label="chapter text"
              style={{
                width: '100%',
                minHeight: 460,
                border: 0,
                outline: 'none',
                resize: 'vertical',
                background: 'transparent',
                fontFamily: 'var(--font-sans)',
                fontSize: 16,
                lineHeight: 1.75,
                letterSpacing: '-0.2px',
                color: 'var(--nxb-text-secondary)',
                padding: 0,
              }}
            />
            <div className="meta" style={{ marginTop: 12 }}>
              Tip: write first, tidy later — Beautify keeps your phrasing, it only mends the seams.
            </div>
          </div>

          {sideOpen && (
            <aside
              style={{
                width: 340,
                flex: 'none',
                position: 'sticky',
                top: 76,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {beautifyOpen && (
                <div
                  style={{
                    border: '0.5px solid var(--nxb-border-low)',
                    borderRadius: 16,
                    background: 'var(--fi-card)',
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    animation: 'fablefade 200ms ease-out',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="h3" style={{ margin: 0 }}>
                      Beautify
                    </span>
                    <span className="meta">· {pendingCount} suggestions</span>
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
                  {suggestions.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        border: '0.5px solid var(--nxb-border-low)',
                        borderRadius: 8,
                        background: 'var(--nxb-surface-1)',
                        padding: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          color: 'var(--nxb-text-muted)',
                          alignSelf: 'flex-start',
                        }}
                      >
                        {s.kind}
                      </span>
                      {s.status === 'pending' ? (
                        <>
                          <p
                            className="body-s"
                            style={{
                              margin: 0,
                              color: 'var(--nxb-text-muted)',
                              textDecoration: 'line-through',
                              textDecorationColor: 'var(--nxb-border-strong)',
                            }}
                          >
                            {s.original}
                          </p>
                          <p className="body-s" style={{ margin: 0, color: 'var(--nxb-text-primary)' }}>
                            {s.revised}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 11,
                              lineHeight: 1.4,
                              color: 'var(--nxb-text-muted)',
                              fontFamily: 'var(--font-sans)',
                            }}
                          >
                            {s.why}
                          </p>
                          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                            <button
                              onClick={() => decide(s.id, true)}
                              style={{
                                height: 28,
                                padding: '0 12px',
                                borderRadius: 9999,
                                border: 0,
                                background: 'var(--nxb-action-inverse-bg)',
                                color: 'var(--nxb-action-inverse-text)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: 'pointer',
                              }}
                            >
                              Accept
                            </button>
                            <button
                              className="fi-soft-hover"
                              onClick={() => decide(s.id, false)}
                              style={{
                                height: 28,
                                padding: '0 12px',
                                borderRadius: 9999,
                                border: '1px solid var(--nxb-border-medium)',
                                background: 'transparent',
                                color: 'var(--nxb-text-primary)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: 12,
                                cursor: 'pointer',
                              }}
                            >
                              Skip
                            </button>
                          </div>
                        </>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
                  <button
                    className="nxb-btn nxb-btn--secondary nxb-btn--sm"
                    onClick={acceptAll}
                    style={{ alignSelf: 'flex-start', height: 32 }}
                  >
                    Accept all
                  </button>
                </div>
              )}

              {healthOpen && (
                <div
                  style={{
                    border: '0.5px solid var(--nxb-border-low)',
                    borderRadius: 16,
                    background: 'var(--fi-card)',
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <IconActivity size={16} style={{ color: 'var(--nxb-text-muted)' }} />
                    <span className="h3" style={{ margin: 0 }}>
                      Story Health
                    </span>
                    <span className="meta" style={{ marginLeft: 'auto' }}>
                      ran 2m ago
                    </span>
                  </div>
                  <p className="body-s" style={{ margin: 0, color: 'var(--nxb-text-muted)' }}>
                    Notes, not verdicts — the story is yours.
                  </p>
                  {notes.map((n, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        padding: 12,
                        borderRadius: 8,
                        background: n.bg,
                        border: '0.5px solid var(--nxb-border-low)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{ width: 6, height: 6, borderRadius: 9999, background: n.dot, flex: 'none' }}
                        />
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10,
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            color: 'var(--nxb-text-muted)',
                          }}
                        >
                          {n.kind}
                        </span>
                      </div>
                      <p className="body-s" style={{ margin: 0, color: 'var(--nxb-text-secondary)', lineHeight: 1.5 }}>
                        {n.text}
                      </p>
                      {n.hasLink && (
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            viewInArrange(n.scene)
                          }}
                          className="body-s"
                          style={{ color: 'var(--nxb-text-link)', textDecoration: 'none' }}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p className="body" style={{ margin: 0, color: 'var(--nxb-text-muted)' }}>
            Drag scenes to reorder. Flagged cards carry their Story Health note so you know why they
            might want to move.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 12,
            }}
          >
            {scenes.map((s, i) => {
              const id = s.slug
              return (
                <div
                  key={id}
                  className="fi-border-hover"
                  draggable
                  onDragStart={(e) => drag.start(e, id)}
                  onDragOver={(e) => drag.over(e, id)}
                  onDrop={(e) => e.preventDefault()}
                  onDragEnd={drag.end}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    padding: 16,
                    borderRadius: 16,
                    background: 'var(--fi-card)',
                    border: '0.5px solid var(--nxb-border-low)',
                    cursor: 'grab',
                    opacity: dragId === id ? 0.4 : 1,
                    transition: 'opacity 150ms ease',
                  }}
                >
                  {highlightScene === id && (
                    <span
                      style={{
                        position: 'absolute',
                        inset: -2,
                        borderRadius: 18,
                        border: '2px solid var(--nxb-border-focus-ring)',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <IconGrip size={14} style={{ color: 'var(--nxb-text-disabled)', flex: 'none' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--nxb-text-muted)' }}>
                      {(i < 9 ? '0' : '') + (i + 1)}
                    </span>
                    <span className="meta" style={{ marginLeft: 'auto' }}>
                      Ch. {s.ch}
                    </span>
                  </div>
                  <span className="body" style={{ color: 'var(--nxb-text-primary)', fontWeight: 500 }}>
                    {s.title}
                  </span>
                  <span className="meta">{s.words} words</span>
                  {s.flag && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 6,
                        paddingTop: 8,
                        borderTop: '0.5px solid var(--nxb-border-low)',
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 9999,
                          background: 'var(--nxb-status-medium-border)',
                          flex: 'none',
                          marginTop: 4,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          lineHeight: 1.4,
                          color: 'var(--nxb-text-muted)',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        {s.flag}
                      </span>
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
