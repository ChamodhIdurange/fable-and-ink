import { useState } from 'react'
import { genreColor } from '../data.js'
import Reveal from '../components/Reveal.jsx'
import { IconChevronRight, IconGitFork, IconBook, IconAudioLines, IconSparkles } from '../components/Icon.jsx'

const compact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n ?? 0))

export default function Profile({ profile, openStory, go, saveProfile }) {
  const [editing, setEditing] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [bioDraft, setBioDraft] = useState('')
  const [saving, setSaving] = useState(false)

  if (!profile) {
    return (
      <main className="fi-loading" aria-busy="true">
        <span className="fi-skel" style={{ width: '100%', height: 150, borderRadius: 28 }} />
        <span className="fi-skel" style={{ width: '100%', height: 96, borderRadius: 20 }} />
        <span className="fi-skel" style={{ width: '70%', height: 26 }} />
      </main>
    )
  }
  const { user, stats, published = [], theirForks = [] } = profile
  const firstName = user.name.split(' ')[0]

  const startEdit = () => {
    setNameDraft(user.name)
    setBioDraft(user.bio ?? '')
    setEditing(true)
  }
  const submitEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const ok = await saveProfile({ name: nameDraft, bio: bioDraft })
    setSaving(false)
    if (ok) setEditing(false)
  }

  return (
    <main data-screen-label="Profile" className="fi-page fi-page--profile">
      {/* Header card */}
      <div className="fi-profile-head">
        <span className="fi-avatar fi-avatar--lg" style={{ position: 'relative' }}>
          {user.initials}
        </span>

        {!editing && (
          <>
            <div className="fi-profile-head__info">
              <h1 className="h1">{user.name}</h1>
              <span className="meta">{user.summary}</span>
              <p className="body fi-profile-head__bio">{user.bio}</p>
            </div>
            <div className="fi-profile-head__actions">
              <button className="nxb-btn nxb-btn--secondary nxb-btn--sm" onClick={startEdit}>
                Edit Profile
              </button>
              <button className="nxb-btn nxb-btn--primary nxb-btn--sm" onClick={() => go('editor')}>
                <IconSparkles size={16} />
                Open your draft
              </button>
            </div>
          </>
        )}

        {editing && (
          <form className="fi-profile-edit" onSubmit={submitEdit}>
            <div className="fi-field">
              <label className="label" htmlFor="prof-name">
                name
              </label>
              <input
                id="prof-name"
                className="fi-input"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                maxLength={80}
                required
              />
            </div>
            <div className="fi-field">
              <label className="label" htmlFor="prof-bio">
                bio
              </label>
              <textarea
                id="prof-bio"
                className="fi-textarea"
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                maxLength={500}
                rows={3}
              />
              <span className="meta">{bioDraft.length}/500 — a line or two about what you write.</span>
            </div>
            <div className="fi-row fi-row--8">
              <button type="submit" className="nxb-btn nxb-btn--primary nxb-btn--sm" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                className="nxb-btn nxb-btn--secondary nxb-btn--sm"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Stats band */}
      {stats && (
        <div className="fi-stats">
          {[
            ['Published stories', stats.published],
            ['Total reads', compact(stats.totalReads)],
            [`Forks of ${firstName}'s work`, stats.totalForks],
            ['Writing since', stats.joinedYear],
          ].map(([label, value], i) => (
            <Reveal key={label} delay={i * 80}>
              <div className="fi-stat">
                <span className="fi-stat__label">{label}</span>
                <span className="fi-stat__value">{value}</span>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {/* Two columns: published | forks of their work */}
      <div className="fi-profile-cols">
        <section>
          <div className="fi-section-head" style={{ marginBottom: 12 }}>
            <h2 className="h2" style={{ margin: 0 }}>
              Published
            </h2>
            <span className="meta">tap a story to read it</span>
          </div>
          <div className="fi-stack fi-stack--8">
            {published.map((o) => {
              const c = genreColor(o.genre)
              return (
                <button key={o.id} className="fi-list-row fi-list-row--btn fi-row-hover" onClick={() => openStory(o.id)}>
                  <IconBook size={16} style={{ color: 'var(--nxb-text-muted)', flex: 'none' }} />
                  <div className="fi-list-row__text">
                    <span className="body" style={{ color: 'var(--nxb-text-primary)', fontWeight: 500 }}>
                      {o.title}
                    </span>
                    {o.blurb && <span className="body-s fi-list-row__blurb">{o.blurb}</span>}
                    <span className="meta">{o.meta}</span>
                  </div>
                  <span
                    className="fi-tag"
                    style={{ color: c, background: `color-mix(in srgb, ${c} 10%, transparent)` }}
                  >
                    {o.genre}
                  </span>
                  <IconChevronRight size={16} style={{ color: 'var(--nxb-text-disabled)', flex: 'none' }} />
                </button>
              )
            })}
            {!published.length && (
              <div className="fi-empty">
                <p className="body" style={{ margin: 0, color: 'var(--nxb-text-muted)' }}>
                  Nothing published yet — your first story is waiting in the editor.
                </p>
                <button className="nxb-btn nxb-btn--primary nxb-btn--sm" onClick={() => go('editor')}>
                  Start writing
                </button>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="fi-section-head" style={{ marginBottom: 12 }}>
            <h2 className="h2" style={{ margin: 0 }}>
              Forks of {firstName}&rsquo;s work
            </h2>
          </div>
          <p className="body-s" style={{ margin: '0 0 12px', color: 'var(--nxb-text-muted)' }}>
            Other writers building on {firstName}&rsquo;s stories — every fork links back.
          </p>
          <div className="fi-stack fi-stack--8">
            {theirForks.map((f) => (
              <button key={f.id} className="fi-list-row fi-list-row--btn fi-row-hover" onClick={() => openStory(f.id)}>
                <IconGitFork size={16} style={{ color: 'var(--nxb-text-muted)', flex: 'none' }} />
                <div className="fi-list-row__text">
                  <span className="body" style={{ color: 'var(--nxb-text-primary)', fontWeight: 500 }}>
                    {f.title}
                  </span>
                  <span className="meta">
                    {f.by} · forked from {f.from}
                  </span>
                </div>
                <span className="fi-tag fi-tag--outline">{f.kind}</span>
                <IconChevronRight size={16} style={{ color: 'var(--nxb-text-disabled)', flex: 'none' }} />
              </button>
            ))}
            {!theirForks.length && (
              <div className="fi-empty">
                <p className="body" style={{ margin: 0, color: 'var(--nxb-text-muted)' }}>
                  No forks yet — when someone remixes one of {firstName}&rsquo;s stories, it shows up
                  here with a link back.
                </p>
              </div>
            )}
          </div>

          {/* Listen nudge keeps the column balanced and gives the page a real action */}
          <div className="fi-profile-tip">
            <IconAudioLines size={18} style={{ color: 'var(--nxb-text-link)', flex: 'none' }} />
            <span className="body-s" style={{ color: 'var(--nxb-text-secondary)' }}>
              Every published story here can be listened to — open one and hit{' '}
              <strong>Listen</strong> for adaptive narration.
            </span>
          </div>
        </section>
      </div>
    </main>
  )
}
