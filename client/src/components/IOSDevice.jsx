// A lightweight iPhone frame — the real-app equivalent of the prototype's
// ios-frame.jsx <x-import> wrapper. Renders its children inside a 390×844-ish
// device shell with rounded bezel, notch and home indicator.

export default function IOSDevice({ children, width = 390, height = 844 }) {
  return (
    <div
      style={{
        width,
        height,
        maxWidth: '100%',
        position: 'relative',
        borderRadius: 54,
        padding: 12,
        background: '#0b0b0d',
        boxShadow:
          '0 0 0 2px rgba(255,255,255,0.06), 0 30px 80px rgba(0,0,0,0.45)',
        flex: 'none',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 42,
          overflow: 'hidden',
          background: 'var(--nxb-surface-page)',
        }}
      >
        {/* Dynamic-island / notch */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 112,
            height: 30,
            borderRadius: 9999,
            background: '#0b0b0d',
            zIndex: 20,
          }}
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
        {/* Home indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 134,
            height: 5,
            borderRadius: 9999,
            background: 'var(--nxb-text-disabled)',
            opacity: 0.6,
            zIndex: 20,
          }}
        />
      </div>
    </div>
  )
}
