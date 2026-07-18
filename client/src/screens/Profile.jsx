import { genreColor } from '../data.js'
import { IconChevronRight, IconGitFork } from '../components/Icon.jsx'

export default function Profile({ profile }) {
  if (!profile) {
    return (
      <main style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 48 }}>
        <span className="meta">Loading profile…</span>
      </main>
    )
  }
  const { user, published = [], theirForks = [] } = profile

  return (
    <main
      data-screen-label="Profile"
      style={{ width: '100%', maxWidth: 760, margin: '0 auto', padding: '32px 24px 64px', flex: 1 }}
    >
      {/* Header card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 20,
          marginBottom: 40,
          padding: 32,
          borderRadius: 24,
          background: 'var(--nxb-neutral-purple-150)',
        }}
      >
        <span
          style={{
            width: 64,
            height: 64,
            borderRadius: 9999,
            background: 'var(--nxb-surface-1)',
            fontFamily: 'var(--font-mono)',
            fontSize: 20,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--nxb-text-primary)',
            flex: 'none',
          }}
        >
          {user.initials}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <h1 className="h1" style={{ margin: 0 }}>
            {user.name}
          </h1>
          <span className="meta">{user.summary}</span>
          <p className="body" style={{ margin: '4px 0 0', color: 'var(--nxb-text-secondary)', maxWidth: '52ch' }}>
            {user.bio}
          </p>
        </div>
        <button className="nxb-btn nxb-btn--secondary nxb-btn--sm" style={{ flex: 'none' }}>
          Edit Profile
        </button>
      </div>

      {/* Published */}
      <h2 className="h2" style={{ margin: '0 0 12px' }}>
        Published
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 40 }}>
        {published.map((o) => {
          const c = genreColor(o.genre)
          return (
            <div
              key={o.id}
              className="fi-row-hover"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                borderRadius: 16,
                background: 'var(--fi-card)',
                border: '0.5px solid var(--nxb-border-low)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
                <span className="body" style={{ color: 'var(--nxb-text-primary)', fontWeight: 500 }}>
                  {o.title}
                </span>
                <span className="meta">{o.meta}</span>
              </div>
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
                }}
              >
                {o.genre}
              </span>
              <IconChevronRight size={16} style={{ color: 'var(--nxb-text-disabled)', flex: 'none' }} />
            </div>
          )
        })}
      </div>

      {/* Forks of her work */}
      <h2 className="h2" style={{ margin: '0 0 4px' }}>
        Forks of her work
      </h2>
      <p className="body-s" style={{ margin: '0 0 12px', color: 'var(--nxb-text-muted)' }}>
        Other writers building on {user.name.split(' ')[0]}&rsquo;s stories — every fork links back.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {theirForks.map((f) => (
          <div
            key={f.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 20px',
              borderRadius: 16,
              background: 'var(--fi-card)',
              border: '0.5px solid var(--nxb-border-low)',
            }}
          >
            <IconGitFork size={16} style={{ color: 'var(--nxb-text-muted)', flex: 'none' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
              <span className="body" style={{ color: 'var(--nxb-text-primary)', fontWeight: 500 }}>
                {f.title}
              </span>
              <span className="meta">
                {f.by} · forked from {f.from}
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                color: 'var(--nxb-text-muted)',
                border: '0.5px solid var(--nxb-border-medium)',
                borderRadius: 4,
                padding: '2px 6px',
                whiteSpace: 'nowrap',
              }}
            >
              {f.kind}
            </span>
          </div>
        ))}
      </div>
    </main>
  )
}
