import { IconSun, IconMoon } from './Icon.jsx'

const pill = (on) => (on ? 'nxb-pill nxb-pill--selected' : 'nxb-pill')

export default function Header({ screen, dark, go, toggleTheme, user }) {
  const isDiscoverish = screen === 'discover' || screen === 'reader'
  const isEditorish = screen === 'editor' || screen === 'publish'
  const name = user?.name ?? '…'
  const initials = user?.initials ?? '··'
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 24px',
        borderBottom: '0.5px solid var(--nxb-border-medium)',
        background: 'var(--fi-header-bg)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <button className="fi-logo logo-mark" onClick={() => go('discover')}>
        Fable<span className="slash">&amp;Ink</span>
      </button>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }} aria-label="Primary">
        <button className={pill(screen === 'home')} onClick={() => go('home')}>
          Home
        </button>
        <button className={pill(isDiscoverish)} onClick={() => go('discover')}>
          Discover
        </button>
        <button className={pill(isEditorish)} onClick={() => go('editor')}>
          Write
        </button>
        <button className={pill(screen === 'profile')} onClick={() => go('profile')}>
          Profile
        </button>
        <button className={pill(screen === 'mobile')} onClick={() => go('mobile')}>
          Mobile Reader
        </button>
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="nxb-icon-btn nxb-icon-btn--xs"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
        >
          {dark ? <IconSun size={16} /> : <IconMoon size={16} />}
        </button>
        <span className="meta" style={{ whiteSpace: 'nowrap' }}>
          Signed in as {name}
        </span>
        <span
          className="nxb-avatar nxb-avatar--md"
          style={{
            background: 'var(--nxb-neutral-purple-150)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            borderRadius: 9999,
            width: 32,
            height: 32,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {initials}
        </span>
      </div>
    </header>
  )
}
