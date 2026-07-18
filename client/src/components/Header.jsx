import { IconSun, IconMoon } from './Icon.jsx'

const pill = (on) => (on ? 'nxb-pill nxb-pill--selected' : 'nxb-pill')

export default function Header({ screen, dark, go, toggleTheme, user }) {
  const isDiscoverish = screen === 'discover' || screen === 'reader'
  const isEditorish = screen === 'editor' || screen === 'publish'
  const name = user?.name ?? '…'
  const initials = user?.initials ?? '··'
  return (
    <header className="fi-header">
      <button className="fi-logo logo-mark" onClick={() => go('discover')}>
        Fable<span className="slash">&amp;Ink</span>
      </button>
      <nav className="fi-header__nav" aria-label="Primary">
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
      <div className="fi-header__user">
        <button
          className="nxb-icon-btn nxb-icon-btn--xs"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
        >
          {dark ? <IconSun size={16} /> : <IconMoon size={16} />}
        </button>
        <span className="meta fi-header__signed">Signed in as {name}</span>
        <span className="fi-avatar fi-avatar--md" title={name}>
          {initials}
        </span>
      </div>
    </header>
  )
}
