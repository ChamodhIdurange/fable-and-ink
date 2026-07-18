// A lightweight iPhone frame — the real-app equivalent of the prototype's
// ios-frame.jsx <x-import> wrapper. Renders its children inside a 390×844-ish
// device shell with rounded bezel, notch and home indicator. On short or
// narrow viewports the shell shrinks to fit (see .fi-device in styles.css).

export default function IOSDevice({ children }) {
  return (
    <div className="fi-device">
      <div className="fi-device__screen">
        {/* Dynamic-island / notch */}
        <div className="fi-device__notch" />
        <div className="fi-device__content">{children}</div>
        {/* Home indicator */}
        <div className="fi-device__home" />
      </div>
    </div>
  )
}
